#!/usr/bin/env node
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, unlinkSync, rmdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const configPath = join(__dirname, 'deploy.config.json')
let config = {}

if (existsSync(configPath)) {
    config = JSON.parse(readFileSync(configPath, 'utf-8'))
}

const RL = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function question(query) {
    return new Promise((resolve) => RL.question(query, resolve))
}

function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m',
        success: '\x1b[32m',
        warning: '\x1b[33m',
        error: '\x1b[31m',
        reset: '\x1b[0m',
    }
    console.log(`\n${colors[type]}Deploy ⚡︎${colors.reset}\n${message}`)
}

async function executeStep(_stepNumber, description, fn) {
    try {
        await fn()
        log(`✓ ${description}`, 'success')
    } catch (error) {
        log(`✗ ${description}\n${error.message}`, 'error')
        throw error
    }
}

async function updateImagePaths() {
    let bucketURL = config.bucketUrl

    if (!bucketURL) {
        bucketURL = await question('Digite a URL base do bucket GCP: ')
        if (!bucketURL) throw new Error('URL do bucket é obrigatória')

        config.bucketUrl = bucketURL
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    }

    const cleanBucketURL = bucketURL.replace(/\/$/, '')
    const newImagePath = `${cleanBucketURL}/img`

    const indexPath = join(__dirname, 'info', 'index.html')
    let htmlContent = readFileSync(indexPath, 'utf-8')

    config.paths.imagesToReplace.forEach(pattern => {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        const replacement = pattern.replace('./img', newImagePath)
        htmlContent = htmlContent.replace(regex, replacement)
    })

    writeFileSync(indexPath, htmlContent, 'utf-8')

    const configFilePath = join(__dirname, config.paths.configFile)
    if (existsSync(configFilePath)) {
        let configContent = readFileSync(configFilePath, 'utf-8')
        configContent = configContent.replace(
            /export const imgPath = ['"`][^'"`]*['"`]/g,
            `export const imgPath = '${cleanBucketURL}/img'`
        )
        writeFileSync(configFilePath, configContent, 'utf-8')
    }

    const cssSourcePath = join(__dirname, 'info', 'css', 'electrolux-fonts.css')
    if (existsSync(cssSourcePath)) {
        let cssContent = readFileSync(cssSourcePath, 'utf-8')
        cssContent = cssContent.replace(
            /url\(\.\/fonts\//g,
            `url(${cleanBucketURL}/css/fonts/`
        )
        writeFileSync(cssSourcePath, cssContent, 'utf-8')
    }
}

async function executeViteBuild() {
    try {
        execSync('npm run build:deploy', { stdio: 'inherit', cwd: __dirname })
    } catch (error) {
        throw new Error(`Build falhou: ${error.message}`)
    }
}

async function extractArtifactContent() {
    const productionIndexPath = join(__dirname, config.productionDir, 'index.html')

    if (!existsSync(productionIndexPath)) {
        throw new Error(`index.html não encontrado em: ${productionIndexPath}`)
    }

    const htmlContent = readFileSync(productionIndexPath, 'utf-8')

    const startTag = `<article id="artifact"`
    const startIndex = htmlContent.indexOf(startTag)

    if (startIndex === -1) {
        throw new Error(`Article com ID "artifact" não encontrada`)
    }

    let articleCount = 0
    let endIndex = startIndex
    let inTag = false

    for (let i = startIndex; i < htmlContent.length; i++) {
        const char = htmlContent[i]

        if (char === '<') {
            inTag = true
        } else if (char === '>' && inTag) {
            inTag = false
            const tagContent = htmlContent.substring(htmlContent.lastIndexOf('<', i), i + 1)

            if (tagContent.startsWith('<article')) {
                articleCount++
            } else if (tagContent === '</article>') {
                articleCount--
                if (articleCount === 0) {
                    endIndex = i + 1
                    break
                }
            }
        }
    }

    let artifactContent = htmlContent.substring(startIndex, endIndex)

    if (config.options.removeComments) {
        artifactContent = artifactContent.replace(/<!--[\s\S]*?-->/g, '')
    }

    writeFileSync(productionIndexPath, artifactContent, 'utf-8')
}

async function insertExternalLinks() {
    const productionIndexPath = join(__dirname, config.productionDir, 'index.html')
    let htmlContent = readFileSync(productionIndexPath, 'utf-8')

    const assetsUrl = config.assetsUrl.replace(/\/$/, '')
    const cssUrl = `${assetsUrl}/css/electrolux-app.css`
    const jsPath = join(__dirname, config.productionDir, 'js', 'electrolux-app.js')

    if (!existsSync(jsPath)) {
        throw new Error(`JavaScript buildado não encontrado em: ${jsPath}`)
    }

    const jsContent = readFileSync(jsPath, 'utf-8')

    const cssLink = `<link rel="stylesheet" href="${cssUrl}">`
    const inlineScript = `<script>${jsContent}</script>`

    const articleOpenRegex = /(<article[^>]*id="artifact"[^>]*>)/
    htmlContent = htmlContent.replace(articleOpenRegex, `$1\n    ${cssLink}`)

    htmlContent = htmlContent.replace('</article>', `    ${inlineScript}\n</article>`)

    writeFileSync(productionIndexPath, htmlContent, 'utf-8')

    const jsDir = join(__dirname, config.productionDir, 'js')

    if (existsSync(jsPath)) {
        unlinkSync(jsPath)
    }

    if (existsSync(jsDir)) {
        rmdirSync(jsDir)
    }
}

async function ensureCharsetDeclaration() {
    const productionIndexPath = join(__dirname, config.productionDir, 'index.html')
    let htmlContent = readFileSync(productionIndexPath, 'utf-8')

    const hasCharset = /<meta\s+charset=["']?utf-8["']?\s*\/?>/i.test(htmlContent)

    const hasViewport = /<meta\s+name=["']viewport["']/i.test(htmlContent)

    let metaTags = []

    if (!hasCharset) {
        metaTags.push('<meta charset="UTF-8">')
    }

    if (!hasViewport) {
        metaTags.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    }

    if (metaTags.length > 0) {
        const articleOpenRegex = /(<article[^>]*id="artifact"[^>]*>\s*)/
        const metaTagsString = metaTags.join('\n    ')
        htmlContent = htmlContent.replace(
            articleOpenRegex,
            `$1${metaTagsString}\n    `
        )
    }

    writeFileSync(productionIndexPath, htmlContent, 'utf-8')
}


async function formatFinalOutput() {
    const productionIndexPath = join(__dirname, config.productionDir, 'index.html')
    let htmlContent = readFileSync(productionIndexPath, 'utf-8')

    htmlContent = htmlContent.replace(/\n\s*\n/g, '\n')

    const lines = htmlContent.split('\n')
    const formattedLines = []
    let indentLevel = 0
    const indent = '    '

    const selfClosingTags = ['img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source']
    const inlineTags = ['span', 'a', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'code']

    for (let line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        if (trimmed.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1)
        }

        formattedLines.push(indent.repeat(indentLevel) + trimmed)

        if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
            const tagMatch = trimmed.match(/<(\w+)/)
            const tagName = tagMatch ? tagMatch[1].toLowerCase() : ''

            const isSelfClosing = trimmed.endsWith('/>') || selfClosingTags.includes(tagName)
            const closesOnSameLine = trimmed.includes(`</${tagName}>`)
            const isInlineTag = inlineTags.includes(tagName)
            const isScriptOrLink = tagName === 'script' || tagName === 'link'

            if (!isSelfClosing && !closesOnSameLine && !isInlineTag) {
                if (tagName === 'script') {
                    if (!trimmed.includes('src=')) {
                        indentLevel++
                    }
                } else if (!isScriptOrLink) {
                    indentLevel++
                }
            }
        }
    }

    htmlContent = formattedLines.join('\n')

    if (!htmlContent.endsWith('\n')) {
        htmlContent += '\n'
    }

    writeFileSync(productionIndexPath, htmlContent, 'utf-8')
}

async function restoreOriginalPaths() {
    const bucketURL = config.bucketUrl
    if (!bucketURL) return

    const cleanBucketURL = bucketURL.replace(/\/$/, '')
    const bucketImagePath = `${cleanBucketURL}/img`

    const indexPath = join(__dirname, 'info', 'index.html')
    let htmlContent = readFileSync(indexPath, 'utf-8')

    config.paths.imagesToReplace.forEach(pattern => {
        const bucketPattern = pattern.replace('./img', bucketImagePath)
        const regex = new RegExp(bucketPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        htmlContent = htmlContent.replace(regex, pattern)
    })

    writeFileSync(indexPath, htmlContent, 'utf-8')

    const configFilePath = join(__dirname, config.paths.configFile)
    if (existsSync(configFilePath)) {
        let configContent = readFileSync(configFilePath, 'utf-8')
        configContent = configContent.replace(
            /export const imgPath = ['"`][^'"`]*['"`]/g,
            `export const imgPath = './img'`
        )
        writeFileSync(configFilePath, configContent, 'utf-8')
    }

    const cssSourcePath = join(__dirname, 'info', 'css', 'electrolux-fonts.css')
    if (existsSync(cssSourcePath)) {
        let cssContent = readFileSync(cssSourcePath, 'utf-8')
        const escapedURL = cleanBucketURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        cssContent = cssContent.replace(
            new RegExp(`url\\(${escapedURL}/css/fonts/`, 'g'),
            'url(./fonts/'
        )
        writeFileSync(cssSourcePath, cssContent, 'utf-8')
    }
}

async function main() {
    try {
        const startTime = Date.now()
        await executeStep(1, 'Caminhos das imagens atualizados', updateImagePaths)
        await executeStep(2, 'Build do Vite executado', executeViteBuild)
        await executeStep(3, 'Artefato <article> extraído da index', extractArtifactContent)
        await executeStep(4, 'CSS e JS inseridos no artefato', insertExternalLinks)
        await executeStep(5, 'Artefato formatado', formatFinalOutput)
        await executeStep(6, 'Declaração UTF-8 garantida no artefato', ensureCharsetDeclaration)
        await executeStep(7, 'Caminhos originais das imagens restaurados na index e no TypeScript', restoreOriginalPaths)
        const duration = ((Date.now() - startTime) / 1000).toFixed(2)
        const finalPath = join(__dirname, config.productionDir, 'index.html')
        const finalSize = (readFileSync(finalPath, 'utf-8').length / 1024).toFixed(2)
        log(`Concluído em ${duration}s em artefato de ${finalSize}KB`, 'info')

    } catch (error) {
        log(`Erro: ${error.message}`, 'error')
        process.exit(1)
    } finally {
        RL.close()
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main()
}
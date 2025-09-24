#!/usr/bin/env node
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/* Carregar configurações */
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
    console.log(`${colors[type]}:: Deploy ::${colors.reset} ${message}`)
}

async function executeStep(_stepNumber, description, fn) {
    try {
        await fn()
        log(`✓ ${description}`, 'success')
    } catch (error) {
        log(`✗ ${description}: ${error.message}`, 'error')
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

    /* Atualizar HTML */
    const indexPath = join(__dirname, 'info', 'index.html')
    let htmlContent = readFileSync(indexPath, 'utf-8')

    config.paths.imagesToReplace.forEach(pattern => {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
        const replacement = pattern.replace('./img', newImagePath)
        htmlContent = htmlContent.replace(regex, replacement)
    })

    writeFileSync(indexPath, htmlContent, 'utf-8')

    /* Atualizar config TypeScript */
    const configFilePath = join(__dirname, config.paths.configFile)
    if (existsSync(configFilePath)) {
        let configContent = readFileSync(configFilePath, 'utf-8')
        configContent = configContent.replace(
            /export const imgPath = ['"`][^'"`]*['"`]/g,
            `export const imgPath = '${cleanBucketURL}/img'`
        )
        writeFileSync(configFilePath, configContent, 'utf-8')
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

    /* Buscar a article completa do artefato */
    const startTag = `<article id="artifact"`
    const startIndex = htmlContent.indexOf(startTag)

    if (startIndex === -1) {
        throw new Error(`Article com ID "artifact" não encontrada`)
    }

    /* Encontrar o fechamento correto da article */
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

    /* URLs dos assets externos */
    const assetsUrl = config.assetsUrl.replace(/\/$/, '')
    const cssUrl = `${assetsUrl}/css/electrolux-app.css`
    const jsUrl = `${assetsUrl}/js/electrolux-app.js`

    /* Criar links externos */
    const cssLink = `<link rel="stylesheet" href="${cssUrl}">`
    const jsScript = `<script src="${jsUrl}"></script>`

    /* CORREÇÃO: Usar regex mais específico que funciona com id="artifact" */
    const articleOpenRegex = /(<article[^>]*id="artifact"[^>]*>)/
    htmlContent = htmlContent.replace(articleOpenRegex, `$1\n    ${cssLink}`)

    /* Inserir JS antes do fechamento da article */
    htmlContent = htmlContent.replace('</article>', `    ${jsScript}\n</article>`)

    writeFileSync(productionIndexPath, htmlContent, 'utf-8')
}

async function formatFinalOutput() {
    const productionIndexPath = join(__dirname, config.productionDir, 'index.html')
    let htmlContent = readFileSync(productionIndexPath, 'utf-8')

    /* Remover espaços desnecessários e formatar corretamente */
    htmlContent = htmlContent.replace(/\n\s*\n/g, '\n') /* Remover linhas vazias extras */

    /* Formatar com indentação consistente */
    const lines = htmlContent.split('\n')
    const formattedLines = []
    let indentLevel = 0
    const indent = '    ' /* 4 espaços por nível */

    /* Tags que são self-closing ou não precisam de indentação interna */
    const selfClosingTags = ['img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source']
    const inlineTags = ['span', 'a', 'strong', 'em', 'b', 'i', 'u', 'small', 'sub', 'sup', 'code']

    for (let line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        /* Diminuir indentação para tags de fechamento */
        if (trimmed.startsWith('</')) {
            indentLevel = Math.max(0, indentLevel - 1)
        }

        /* Adicionar linha com indentação apropriada */
        formattedLines.push(indent.repeat(indentLevel) + trimmed)

        /* Aumentar indentação para tags de abertura */
        if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
            /* Extrair o nome da tag */
            const tagMatch = trimmed.match(/<(\w+)/)
            const tagName = tagMatch ? tagMatch[1].toLowerCase() : ''

            /* Verificar se é uma tag self-closing ou se fecha na mesma linha */
            const isSelfClosing = trimmed.endsWith('/>') || selfClosingTags.includes(tagName)
            const closesOnSameLine = trimmed.includes(`</${tagName}>`)
            const isInlineTag = inlineTags.includes(tagName)

            /* Casos especiais para script e link */
            const isScriptOrLink = tagName === 'script' || tagName === 'link'

            /* Só aumenta indentação se não for self-closing, não fechar na mesma linha,  */
            /* não for inline e não for script/link vazio */
            if (!isSelfClosing && !closesOnSameLine && !isInlineTag) {
                /* Para script, só aumenta se tiver conteúdo */
                if (tagName === 'script') {
                    /* Se for script com src (externo), não aumenta indentação */
                    if (!trimmed.includes('src=')) {
                        indentLevel++
                    }
                } else {
                    indentLevel++
                }
            }
        }
    }

    /* Juntar as linhas formatadas */
    htmlContent = formattedLines.join('\n')

    /* Garantir quebra de linha no final */
    if (!htmlContent.endsWith('\n')) {
        htmlContent += '\n'
    }

    writeFileSync(productionIndexPath, htmlContent, 'utf-8')
}

async function main() {
    try {
        const startTime = Date.now()
        await executeStep(1, 'Atualizar caminhos das imagens', updateImagePaths)
        await executeStep(2, 'Executar build Vite', executeViteBuild)
        await executeStep(3, 'Extrair artefato', extractArtifactContent)
        await executeStep(4, 'Inserir links externos para CSS e JS', insertExternalLinks)
        await executeStep(5, 'Formatar artefato', formatFinalOutput)
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
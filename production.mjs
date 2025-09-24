#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/* Carregar configurações */
const configPath = join(__dirname, 'production.config.json')
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

async function changeAssetsLinks() {
    let assetsUrl = config.artifact.assetsUrl

    if (!assetsUrl) {
        assetsUrl = await question('Digite a URL base do bucket onde estão o CSS e o JS: ')
        if (!assetsUrl) throw new Error('URL do bucket é obrigatória')

        config.artifact.assetsUrl = assetsUrl
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    }

    const cleanAssetsUrl = assetsUrl.replace(/\/$/, '')
    const indexPath = join(__dirname, 'index.html')

    if (!existsSync(indexPath)) {
        throw new Error(`index.html não encontrado em: ${indexPath}`)
    }

    let htmlContent = readFileSync(indexPath, 'utf-8')

    /* Substituir tags <link> de CSS */
    htmlContent = htmlContent.replace(
        /<link\s+rel="stylesheet"\s+href="[^"]*\/css\/([^"]+\.css[^"]*)"/g,
        `<link rel="stylesheet" href="${cleanAssetsUrl}/css/$1"`
    )

    /* Substituir tags <script> de JS */
    htmlContent = htmlContent.replace(
        /<script\s+src="[^"]*\/js\/([^"]+\.js[^"]*)"/g,
        `<script src="${cleanAssetsUrl}/js/$1"`
    )

    writeFileSync(indexPath, htmlContent, 'utf-8')
}

async function changeImagesPaths() {
    let bucketURL = config.artifact.bucketUrl

    if (!bucketURL) {
        bucketURL = await question('Digite a URL base do bucket de entrega: ')
        if (!bucketURL) throw new Error('URL do bucket é obrigatória')

        config.artifact.bucketUrl = bucketURL
        writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    }

    const cleanBucketURL = bucketURL.replace(/\/$/, '')
    const indexPath = join(__dirname, 'index.html')

    if (!existsSync(indexPath)) {
        throw new Error(`index.html não encontrado em: ${indexPath}`)
    }

    let htmlContent = readFileSync(indexPath, 'utf-8')

    /* Substituir apenas a base da URL nas tags <img> */
    htmlContent = htmlContent.replace(
        /src="https:\/\/[^"]*(?=\/img\/)/g,
        `src="${cleanBucketURL}"`
    )

    /* Substituir apenas a base da URL na constante JS */
    htmlContent = htmlContent.replace(
        /(const\s+[^=]+=\s*["'])https:\/\/[^"']*(?=\/img["'])/g,
        `$1${cleanBucketURL}`
    )

    writeFileSync(indexPath, htmlContent, 'utf-8')
}

async function main() {
    try {
        await executeStep(1, 'Atualizar links de CSS e JS', changeAssetsLinks)
        await executeStep(2, 'Atualizar caminhos das imagens', changeImagesPaths)

    } catch (error) {
        log(`Erro: ${error.message}`, 'error')
        process.exit(1)
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main()
}
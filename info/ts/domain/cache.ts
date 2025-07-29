import { AppError } from '../errors/app-error'
import { CacheConfig, CacheInterface, CacheMetadata } from './types/cache'
import { Media } from './media'

class Cache implements CacheInterface {
    private userAgent = navigator.userAgent
    private CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 /* 24 horas em milissegundos */
    private DEFAULT_EXPIRY = 7 * 24 * 60 * 60 * 1000 /* 7 dias em milissegundos */
    private METADATA_KEY = 'cache-metadata'

    constructor() {
        this.checkCacheAPISupport()
        this.automaticCleanup()
    }

    checkCacheAPISupport(): void {
        if (!('caches' in window)) {
            throw new AppError(`Seu navegador não suporta Cache API: você está em ${this.userAgent}`)
        }
    }

    reserveFonts(type: CacheConfig) {
        this.checkCacheAPISupport()
        switch (type) {
            case 'Electrolux':
                this.cache('Fonts @ Electrolux', ['./css/fonts/ElectroluxSans-Bold.woff', './css/fonts/ElectroluxSans-BoldObl.woff', './css/fonts/ElectroluxSans-Light.woff', './css/fonts/ElectroluxSans-LightObl.woff', './css/fonts/ElectroluxSans-Regular.woff', './css/fonts/ElectroluxSans-RegularObl.woff', './css/fonts/ElectroluxSans-Thin.woff', './css/fonts/ElectroluxSans-ThinObl.woff', './css/fonts/ElectroluxSans-SemiBold.woff', './css/fonts/ElectroluxSans-SemiBoldObl.woff'])
                break
            case 'Mademsa':
                this.cache('Fonts @ Mademsa', ['./css/fonts/ProximaNova-Black.woff', './css/fonts/ProximaNova-Bold.woff', './css/fonts/ProximaNova-BoldIt.woff', './css/fonts/ProximaNova-Extrabold.woff', './css/fonts/ProximaNova-Light.woff', './css/fonts/ProximaNova-LightItalic.woff', './css/fonts/ProximaNova-Regular.woff', './css/fonts/ProximaNova-RegularItalic.woff', './css/fonts/ProximaNova-Semibold.woff', './css/fonts/ProximaNova-SemiboldItalic.woff'])
                break
        }
    }

    reserveScriptsAndStyles() {
        this.checkCacheAPISupport()
        this.cache('Scripts & Styles @ App', ['./js/index-electrolux-app.js', './js/index-legacy-electrolux-app.js', './js/polyfills-legacy-electrolux-app.js', './css/electrolux-app.css'])
    }

    async reserveMedia(media: Media): Promise<void> {
        this.checkCacheAPISupport()
        const files: string[] = []
        const moduleID = media.module.getAttribute('id')
        media.elements.map((element) => {
            const folder = element.getAttribute('id')?.slice(-2)
            if (!folder) {
                return
            }
            const desktop = element.getAttribute('desktop')
            const mobile = element.getAttribute('mobile')
            if (desktop) {
                files.push(`./img/${folder}/${desktop}.${media.extension}`)
            }
            if (mobile) {
                files.push(`./img/${folder}/${mobile}.${media.extension}`)
            }
            if (files.length > 0) {
                this.cache(`Media @ #${moduleID}`, files)
            }
        })
        return Promise.resolve()
    }

    private async cache(name: string, files: string[], expiry?: number): Promise<void> {
        return caches
            .open(name)
            .then(async (cache) => {
                await cache.addAll(files)
                const metadata: CacheMetadata = {
                    timestamp: Date.now(),
                    expiry: expiry || this.DEFAULT_EXPIRY,
                }
                const metadataResponse = new Response(JSON.stringify(metadata))
                await cache.put(`${name}-${this.METADATA_KEY}`, metadataResponse)
            })
            .catch((error) => {
                throw new AppError(`Erro ao cachear ${name}: ${(error as Error).message}`)
            })
    }

    private async isCacheExpired(name: string): Promise<boolean> {
        try {
            const cache = await caches.open(name)
            const metadataResponse = await cache.match(`${name}-${this.METADATA_KEY}`)
            if (!metadataResponse) {
                return true
            }
            const metadata: CacheMetadata = await metadataResponse.json()
            return Date.now() - metadata.timestamp > metadata.expiry
        } catch (error) {
            throw new AppError(`Erro ao veririfcar expiração do cache ${name}: ${(error as Error).message}`)
        }
    }

    private async clearCache(name: string): Promise<void> {
        try {
            await caches.delete(name)
        } catch (error) {
            throw new AppError(`Erro ao remover o cache ${name}: ${(error as Error).message}`)
        }
    }

    private async clearExpiredCaches(): Promise<void> {
        try {
            const names = await caches.keys()
            for (const name of names) {
                const isExpired = await this.isCacheExpired(name)
                if (isExpired) {
                    await this.clearCache(name)
                }
            }
        } catch (error) {
            throw new AppError(`Erro ao limpar caches expirados: ${(error as Error).message}`)
        }
    }

    private automaticCleanup(): void {
        this.clearExpiredCaches()
        setInterval(() => {
            this.clearExpiredCaches()
        }, this.CLEANUP_INTERVAL)
    }
}

const cache = new Cache()
export { cache }

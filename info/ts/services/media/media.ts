import { env, imagesClass, videoClass } from '../../config'
import { cache } from '../../domain/cache'
import { Media } from '../../domain/media'
import { storage } from '../../domain/storage'
import { AppError } from '../../errors/app-error'
import { logger } from '../../logger'
import { subscribe } from '../../main'
import { MediaLog } from './types/media'

export const mediaLog: MediaLog = {
    initMedia: [],
}

const processedMedia = new Set<HTMLElement>()

export const initMedia = async (module: HTMLElement) => {
    if (processedMedia.has(module)) {
        return
    }
    processedMedia.add(module)
    const id = module.getAttribute('id')
    if (!id) {
        throw new AppError(`O módulo "${module}" não possui id`)
    }
    const hasMedia = module.hasAttribute('media')
    let image: Media | null = null
    let video: Media | null = null
    let mediaClass
    if (hasMedia) {
        const type = module.getAttribute('media')
        let extension
        switch (type) {
            case 'image':
                extension = 'webp'
                mediaClass = imagesClass
                image = new Media({ module, extension, mediaClass, type })
                if (image) {
                    await cache.reserveMedia(image)
                }
                await image.structureMedia()
                break
            case 'video':
                extension = 'mp4'
                mediaClass = videoClass
                video = new Media({ module, extension, mediaClass, type })
                if (video) {
                    await cache.reserveMedia(video)
                }
                await video.structureMedia()
                break
        }
        mediaLog.initMedia.push({
            media: type!,
            '@': id,
        })
    }
    subscribe(async (prop, value) => {
        if (prop === 'device') {
            if (env === 'development') {
                logger.info(`:: Assinante de reatividade :: Device atualizado para ${String(value).toUpperCase()}`)
            }
            if (hasMedia) {
                const type = module.getAttribute('media')
                if (type === 'image' && image !== null) {
                    await cache.reserveMedia(image)
                    await image.update()
                }
                if (type === 'video' && video !== null) {
                    await cache.reserveMedia(video)
                    await video.update()
                }
            }
        }
    })
    storage.saveSessionMediaData({ name: 'App Media Data', log: mediaLog })
}

import { imagesClass, videoClass } from '../../config'
import { ApplicationError } from '../../application/errors/application.error'
import { Media } from '../../application/domain/media'
import { subscribe } from '../../main'

const processedMedia = new Set<HTMLElement>()

export const initMedia = async (module: HTMLElement) => {
    if (processedMedia.has(module)) {
        return
    }
    processedMedia.add(module)
    const id = module.getAttribute('id')
    if (!id) {
        throw new ApplicationError(`O módulo "${module}" não possui id`)
    }
    const hasMedia = module.hasAttribute('media')
    console.log(':: hasMedia ::', hasMedia)
    let image: Media | null = null
    let video: Media | null = null
    let mediaClass
    if (hasMedia) {
        const type = module.getAttribute('media')
        console.log(':: type ::', type)
        let extension
        switch (type) {
            case 'image':
                extension = 'webp'
                mediaClass = imagesClass
                image = new Media({ module, extension, mediaClass, type })
                await image.createMedia()
                break
            case 'video':
                extension = 'mp4'
                mediaClass = videoClass
                video = new Media({ module, extension, mediaClass, type })
                await video.createMedia()
                break
        }
    }
    subscribe(async (prop) => {
        if (prop === 'device') {
            if (hasMedia) {
                const type = module.getAttribute('media')
                if (type === 'image' && image !== null) {
                    await image.update()
                }
                if (type === 'video' && video !== null) {
                    await video.update()
                }
            }
        }
    })
}

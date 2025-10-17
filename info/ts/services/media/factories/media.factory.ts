import { Media } from '../../../application/domain/entities/media'
import { MediaTypes } from '../../../application/schemas/media.schema'
import { subscribeMediaToObserver } from '../subscribers/media.subscriber'
import { imagesClass, videoClass } from '../../../config'

export const createMediaFactory = async (module: HTMLElement, type: MediaTypes) => {
    let image: Media | null = null
    let video: Media | null = null
    let mediaClass
    let extension
    switch (type) {
        case 'image':
            extension = 'webp'
            mediaClass = imagesClass
            image = new Media({ module, extension, mediaClass, type })
            await image.createMedia()
            subscribeMediaToObserver(type, image)
        break
        case 'video':
            extension = 'mp4'
            mediaClass = videoClass
            video = new Media({ module, extension, mediaClass, type })
            await video.createMedia()
            subscribeMediaToObserver(type, video)
        break
    }
}
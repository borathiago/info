import { Media } from '../../../application/domain/entities/media'
import { MediaTypes } from '../../../application/schemas/media.schema'
import { subscribe } from '../../../infrastructure/subscriber/application.subscriber'

export const subscribeMediaToObserver = async (type: MediaTypes, media: Media) => {
    subscribe(async (prop) => {
        if (prop !== 'device') return
        switch (type) {
            case 'image':
                if (media === null) return
                await media.update()
            break
            case 'video':
                if (media === null) return
                await media.update()
            break
        }
    })
}
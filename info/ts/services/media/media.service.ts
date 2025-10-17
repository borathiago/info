import { MediaTypes } from '../../application/schemas/media.schema'
import { ApplicationError } from '../../application/errors/application.error'
import { createMediaFactory } from './factories/media.factory'

const processedMedia = new Set<HTMLElement>()

export const createMediaService = async (module: HTMLElement) => {
    if (processedMedia.has(module)) {
        return
    }
    processedMedia.add(module)
    const id = module.getAttribute('id')
    if (!id) {
        throw new ApplicationError(`O módulo "${module}" não possui id`)
    }
    const hasMedia = module.hasAttribute('media')
    if (hasMedia) {
        const type = module.getAttribute('media') as MediaTypes
        createMediaFactory(module, type)
    }
}

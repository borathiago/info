import { ApplicationError } from '../../application/errors/application.error'
import { CarouselTypes } from '../../application/schemas/carousel.schema'
import { handler } from '../../application/utils/handler/handler'
import { carouselClass, carouselLib, modalUI } from '../../config'
import { createCarouselFactory } from './factories/carousel.factory'
import { createModalFactory } from './factories/modal.factory'

const processedModules = new Set<HTMLElement>()

export const startModuleEventsService = (module: HTMLElement) => {
    if (processedModules.has(module)) {
        return
    }
    processedModules.add(module)
    const moduleID = module.getAttribute('id')
    if (!moduleID) {
        throw new ApplicationError(`Módulo não possui id.`)
    }
    const hasCarousel = module.hasAttribute('carousel')
    const hasModal = module.hasAttribute('modal')
    if (hasCarousel) {
        const lib = carouselLib
        const formattedCarouselClass = handler.formatSelector(carouselClass, 'class')
        const formattedModuleID = handler.formatSelector(moduleID, 'id')
        const carousel = `${formattedModuleID} ${formattedCarouselClass}`
        const type = module.getAttribute('carousel')! as CarouselTypes
        const randomID = handler.createRandomString(Number(type.length))
        createCarouselFactory({ carousel, lib, type, randomID })
    }
    if (hasModal) {
        createModalFactory({ moduleID, modalUI })
    }
}

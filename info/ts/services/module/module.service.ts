import { Modal } from '../../application/domain/modal'
import { ApplicationError } from '../../application/errors/application.error'
import { CarouselTypes } from '../../application/schemas/carousel.schema'
import { handler } from '../../application/utils/handler/handler'
import { carouselClass, carouselLib, modalUI } from '../../config'
import { initCarousel } from '../libs'

const processedModules = new Set<HTMLElement>()

export const initModuleEvents = (module: HTMLElement) => {
    if (processedModules.has(module)) {
        return
    }
    processedModules.add(module)
    const id = module.getAttribute('id')
    if (!id) {
        throw new ApplicationError(`O módulo "${module}" não possui id`)
    }
    const hasCarousel = module.hasAttribute('carousel')
    const hasModal = module.hasAttribute('modal')
    if (hasCarousel) {
        const carousel = `#${id} .${carouselClass}`
        const type = module.getAttribute('carousel')! as CarouselTypes
        const randomID = handler.createRandomString(Number(type.length))
        const lib = carouselLib
        initCarousel({ carousel, lib, type, randomID })
    }
    if (hasModal) {
        new Modal({ moduleID: id, modalUI })
    }
}

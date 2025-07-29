import { initCarousel } from '../../infra/libs/libs'
import { CarouselTypes } from '../../domain/types/carousel'
import { AppError } from '../../errors/app-error'
import { handler } from '../../utils/handler'
import { Modal } from '../../domain/modal'
import { Log } from './types/module'
import { storage } from '../../domain/storage'
import { carouselClass, carouselLib, modalUI } from '../../config'

export const moduleLog: Log = {
    initModuleEvents: [],
}

const processedModules = new Set<HTMLElement>()

export const initModuleEvents = (module: HTMLElement) => {
    if (processedModules.has(module)) {
        return
    }
    processedModules.add(module)
    const id = module.getAttribute('id')
    if (!id) {
        throw new AppError(`O módulo "${module}" não possui id`)
    }
    const hasCarousel = module.hasAttribute('carousel')
    const hasModal = module.hasAttribute('modal')
    if (hasCarousel) {
        const carousel = `#${id} .${carouselClass}`
        const type = module.getAttribute('carousel')! as CarouselTypes
        const randomID = handler.createRandomString(Number(type.length))
        initCarousel({ carousel, type, randomID }, carouselLib)
        moduleLog.initModuleEvents.push({
            event: 'Carousel',
            type: type!,
            '@': id,
        })
    }
    if (hasModal) {
        const type = module.getAttribute('modal')
        new Modal({ moduleID: id, modalUI })
        moduleLog.initModuleEvents.push({
            event: 'Modal',
            type: type!,
            '@': id,
        })
    }
    storage.saveSessionEventsData({ name: 'App Events Data', log: moduleLog })
}

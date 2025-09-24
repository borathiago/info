import { ApplicationError } from '../errors/application.error'
import { handler } from '../utils/handler/handler'
import { CarouselRepository } from '../repositories/carousel.repository'
import { CarouselConfig, CarouselInstanceDetails, CarouselLibrary, CarouselTypes } from '../schemas/carousel.schema'

export class Carousel implements CarouselRepository {
    carousel: HTMLElement
    type: CarouselTypes
    lib: CarouselLibrary
    private classes: Set<string> = new Set()

    constructor({ carousel, lib, type, randomID }: CarouselConfig) {
        const _carousel = handler.getItem(carousel)
        if (!_carousel) {
            throw new ApplicationError(`O carrossel "${_carousel}" não foi encontrado`)
        }
        this.carousel = _carousel
        this.type = type
        this.lib = lib
        this.initClasses()
        this.createInstanceID(randomID)
    }

    private initClasses() {
        Array.from(this.carousel.classList).forEach((className) => {
            this.classes.add(className)
        })
    }

    private addClass(className: string) {
        if (this.classes.has(className)) {
            return
        }
        this.classes.add(className)
        this.carousel.classList.add(className)
    }

    createInstanceID(randomID: string): void {
        if (!randomID) {
            throw new ApplicationError(`O carrossel "${this.carousel}" não possui id`)
        }
        const carouselAppId = `electrolux-${this.lib}-${randomID}-${this.type}`
        this.carousel.setAttribute('id', carouselAppId)
        const newTypeClass = `electrolux-${this.lib}-${this.type}`
        if (!this.classes.has(newTypeClass)) {
            this.addClass(newTypeClass)
        }
        this.carousel.style.width = '100%'
        this.carousel.style.maxWidth = '100%'
    }

    getInstanceDetails(): CarouselInstanceDetails {
        return {
            type: this.type,
            carousel: this.carousel,
        }
    }
}

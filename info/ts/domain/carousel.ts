import { AppError } from '../errors/app-error'
import { handler } from '../utils/handler'
import { CarouselConfig, CarouselInstanceDetails, CarouselInterface, CarouselTypes } from './types/carousel'

export class Carousel implements CarouselInterface {
    carousel: HTMLElement
    type: CarouselTypes
    classes: Set<string> = new Set()

    constructor({ carousel, type, randomID }: CarouselConfig) {
        const _carousel = handler.getItem(carousel)
        if (!_carousel) {
            throw new AppError(`O carrossel "${_carousel}" não foi encontrado`)
        }
        this.carousel = _carousel
        this.type = type
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
            throw new AppError(`O carrossel "${this.carousel}" não possui id`)
        }
        const carouselAppId = `electrolux-swiper-${randomID}-${this.type}`
        this.carousel.setAttribute('id', carouselAppId)
        const newTypeClass = `electrolux-swiper-${this.type}`
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

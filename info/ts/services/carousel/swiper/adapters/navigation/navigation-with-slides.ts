import Swiper from 'swiper'
import { Carousel } from '../../../../../application/domain/entities/carousel'
import { ApplicationError } from '../../../../../application/errors/application.error'
import { swiperCustomNextButton, swiperCustomPrevButton, swiperSlides } from '../../../../../config'
import { CarouselConfig } from '../../../../../application/schemas/carousel.schema'
import { SwiperRepository } from '../../repositories/swiper.repository'
import { handler } from '../../../../../application/utils/handler/handler'
import { Navigation } from 'swiper/modules'

export class SwiperNavigationWithSlides extends Carousel implements SwiperRepository {
    id: string
    slides: number = 1
    next: string = '.swiper-button-next'
    prev: string = '.swiper-button-prev'
    swiper: Swiper | undefined

    constructor({ carousel, lib, type, randomID }: CarouselConfig) {
        super({ carousel, lib, type, randomID })
        const crsl = handler.getItem(carousel)
        const ID = crsl?.getAttribute('id')
        if (!ID) {
            throw new ApplicationError(`O carrossel "${carousel}" não possui id`)
        }
        this.id = handler.formatSelector(ID, 'id')
        this.initSwiper()
    }

    async initSwiper(): Promise<Swiper> {
        this.slides = swiperSlides ? swiperSlides : this.slides
        this.prev = swiperCustomPrevButton ? handler.formatSelector(swiperCustomPrevButton, 'class') : this.prev
        this.next = swiperCustomNextButton ? handler.formatSelector(swiperCustomNextButton, 'class') : this.next
        await new Promise((resolve) => setTimeout(resolve, 200))
        this.swiper = new Swiper(this.id, {
            modules: [Navigation],
            direction: 'horizontal',
            autoplay: false,
            loop: false,
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 0,
            breakpoints: {
                768: {
                    slidesPerView: this.slides,
                    slidesPerGroup: this.slides,
                    spaceBetween: 0,
                },
            },
            navigation: {
                nextEl: `${this.id} ${this.next}`,
                prevEl: `${this.id} ${this.prev}`,
            },
        })
        await this.updateSwiper()
        return this.swiper
    }

    async updateSwiper(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(async () => {
                await new Promise((resolveInner) => setTimeout(resolveInner, 200))
                if (this.swiper === undefined) {
                    throw new ApplicationError(`O carrossel Swiper em ${this.id} está indefinido`)
                }
                this.swiper.update()
                resolve()
            }, 500)
        })
    }
}

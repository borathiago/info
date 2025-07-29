import Swiper from 'swiper'
import { Carousel } from '../../../../../domain/carousel'
import { CarouselConfig } from '../../../../../domain/types/carousel'
import { AppError } from '../../../../../errors/app-error'
import { handler } from '../../../../../utils/handler'
import { Navigation } from 'swiper/modules'
import { env, swiperCustomNextButton, swiperCustomPrevButton, swiperSlides } from '../../../../../config'
import { logger } from '../../../../../logger'
import { SwiperInterface } from '../../types/swiper'

export class SwiperNavigationWithSlides extends Carousel implements SwiperInterface {
    id: string
    slides: number = 1
    next: string = '.swiper-button-next'
    prev: string = '.swiper-button-prev'
    swiper: Swiper | undefined

    constructor({ carousel, type, randomID }: CarouselConfig) {
        super({ carousel, type, randomID })
        const crsl = handler.getItem(carousel)
        const ID = crsl?.getAttribute('id')
        if (!ID) {
            throw new AppError(`O carrossel "${carousel}" não possui id`)
        }
        this.id = handler.formatSelector(ID, 'id')
        this.initSwiper()
    }

    async initSwiper() {
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
        this.updateSwiper()
        return this.swiper
    }

    async updateSwiper(): Promise<void> {
        setTimeout(async () => {
            await new Promise((resolve) => setTimeout(resolve, 200))
            if (this.swiper === undefined) {
                throw new AppError(`O carrossel Swiper em ${this.id} está indefinido`)
            }
            this.swiper.update()
            if (env === 'development') {
                logger.info('Swiper', this.swiper.el)
            }
            return this.swiper
        }, 500)
    }
}

import Swiper from 'swiper'
import { Carousel } from '../../../../domain/carousel'
import { CarouselConfig } from '../../../../domain/types/carousel'
import { AppError } from '../../../../errors/app-error'
import { handler } from '../../../../utils/handler'
import { env } from '../../../../config'
import { logger } from '../../../../logger'
import { SwiperInterface } from '../types/swiper'

export class SwiperDefault extends Carousel implements SwiperInterface {
    id: string
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
        await new Promise((resolve) => setTimeout(resolve, 200))
        this.swiper = new Swiper(this.id, {
            direction: 'horizontal',
            autoplay: false,
            loop: false,
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

import Swiper from 'swiper'
import { Carousel } from '../../../../../application/domain/entities/carousel'
import { CarouselConfig } from '../../../../../application/schemas/carousel.schema'
import { ApplicationError } from '../../../../../application/errors/application.error'
import { SwiperRepository } from '../../repositories/swiper.repository'
import { handler } from '../../../../../application/utils/handler/handler'
import { Navigation, Pagination } from 'swiper/modules'

export class SwiperBullets extends Carousel implements SwiperRepository {
    id: string
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
        await new Promise((resolve) => setTimeout(resolve, 200))
        this.swiper = new Swiper(this.id, {
            modules: [Navigation, Pagination],
            direction: 'horizontal',
            autoplay: false,
            loop: false,
            pagination: {
                el: `${this.id} .swiper-pagination`,
                bulletClass: 'swiper-pagination-bullet electrolux-swiper-bullet',
                clickable: true,
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

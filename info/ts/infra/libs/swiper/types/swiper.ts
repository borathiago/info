import Swiper from 'swiper'

export interface SwiperInterface {
    initSwiper(): Promise<Swiper>
    updateSwiper(): Promise<void>
}

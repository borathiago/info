import Swiper from 'swiper'

export interface SwiperRepository {
    initSwiper(): Promise<Swiper>
    updateSwiper(): Promise<void>
}

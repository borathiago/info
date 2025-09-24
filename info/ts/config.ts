import { ModalUIConfig } from './application/schemas/modal.schema'
import { VideoUIConfig } from './application/schemas/media.schema'
import { CarouselLibrary } from './application/schemas/carousel.schema'
import { Layout } from '@arizona/config-schemas'

export const imgPath = './img'
export const layout: Layout = 'electrolux'
export const breakpoint = 768
export const modules = 'section'
export const root = '.main'
export const app = 'app'

export const modalUI: ModalUIConfig = {
    parent: 'box-modals',
    selector: 'modal-container',
    actionButtons: {
        open: 'open-modal',
        close: 'close-modal',
    },
    state: {
        oppened: 'modal-oppened',
        closed: 'modal-closed',
    },
    transition: {
        scale: 'scale-100',
        opacity: 'opacity-0',
    },
    hideOnModalOppened: {
        elements: 'modal-hide',
    },
}

export const videoUI: VideoUIConfig = {
    controls: false,
    muted: true,
    playsInline: true,
    autoplay: true,
    loop: true,
}

export const imagesClass = 'electrolux-create-image'
export const videoClass = 'electrolux-create-video'

export const carouselLib: CarouselLibrary = 'swiper'
export const swiperCustomPrevButton = 'electrolux-custom-button-prev'
export const swiperCustomNextButton = 'electrolux-custom-button-next'
export const carouselClass = 'swiper'
export const swiperSlides = 3

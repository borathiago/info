import { z } from 'zod'
import { CarouselLibs } from './domain/types/carousel'
import { VideoUIConfig } from './domain/types/media'
import { ModalUIConfig } from './domain/types/modal'

export const envSchema = z.union([z.literal('development'), z.literal('production')])
export type env = z.infer<typeof envSchema>
export const env: env = 'production'

export const breakpoint = 768
export const modules = 'section'
export const root = 'body'
export const app = 'app'

export const scriptIdentifier = 'electrolux-iframe-script'
export const url = 'https://content.electrolux.com.br/utils/getIframeHeight.js'

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

export const carouselLib: CarouselLibs = 'Swiper'
export const swiperCustomPrevButton = 'electrolux-custom-button-prev'
export const swiperCustomNextButton = 'electrolux-custom-button-next'
export const carouselClass = 'swiper'
export const swiperSlides = 3

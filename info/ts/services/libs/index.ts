import { CarouselConfig } from '../../application/schemas/carousel.schema'
import { SwiperBullets } from './swiper/adapters/bullets/bullets'
import { SwiperComplete } from './swiper/adapters/complete/complete'
import { SwiperDefault } from './swiper/adapters/default'
import { SwiperNavigation } from './swiper/adapters/navigation/navigation'
import { SwiperNavigationWithSlides } from './swiper/adapters/navigation/navigation-with-slides'
import { SwiperNumbered } from './swiper/adapters/numbered/numbered'

export const initCarousel = ({ carousel, lib, type, randomID }: CarouselConfig) => {
    switch (lib) {
        case 'swiper':
            switch (type) {
                case 'bullets':
                    new SwiperBullets({ carousel, lib, type, randomID })
                    break
                case 'complete':
                    new SwiperComplete({ carousel, lib, type, randomID })
                    break
                case 'default':
                    new SwiperDefault({ carousel, lib, type, randomID })
                    break
                case 'navigation':
                    new SwiperNavigation({ carousel, lib, type, randomID })
                    break
                case 'navigation-slides':
                    new SwiperNavigationWithSlides({ carousel, lib, type, randomID })
                    break
                case 'numbered':
                    new SwiperNumbered({ carousel, lib, type, randomID })
                    break
            }
            break
        case 'default':
            break
    }
}

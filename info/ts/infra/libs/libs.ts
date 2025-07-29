import { CarouselConfig, CarouselLibs } from '../../domain/types/carousel'
import { SwiperBullets } from './swiper/use-cases/bullets/bullets'
import { SwiperComplete } from './swiper/use-cases/complete/complete'
import { SwiperDefault } from './swiper/use-cases/default'
import { SwiperNavigation } from './swiper/use-cases/navigation/navigation'
import { SwiperNavigationWithSlides } from './swiper/use-cases/navigation/navigation-with-slides'
import { SwiperNumbered } from './swiper/use-cases/numbered/numbered'

export const initCarousel = ({ carousel, type, randomID }: CarouselConfig, lib: CarouselLibs) => {
    switch (lib) {
        case 'Swiper':
            switch (type) {
                case 'bullets':
                    new SwiperBullets({ carousel, type, randomID })
                    break
                case 'complete':
                    new SwiperComplete({ carousel, type, randomID })
                    break
                case 'default':
                    new SwiperDefault({ carousel, type, randomID })
                    break
                case 'navigation':
                    new SwiperNavigation({ carousel, type, randomID })
                    break
                case 'navigation-slides':
                    new SwiperNavigationWithSlides({ carousel, type, randomID })
                    break
                case 'numbered':
                    new SwiperNumbered({ carousel, type, randomID })
                    break
            }
            break
        case 'Default':
            break
    }
}

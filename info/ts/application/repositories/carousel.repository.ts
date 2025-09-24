import { CarouselInstanceDetails } from '../schemas/carousel.schema'

export interface CarouselRepository {
    getInstanceDetails(): CarouselInstanceDetails
    createInstanceID(randomID: string): void
}

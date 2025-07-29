import z from 'zod'

export const CarouselTypesSchema = z.union([z.literal('default'), z.literal('bullets'), z.literal('numbered'), z.literal('navigation'), z.literal('complete'), z.literal('navigation-slides')])
export type CarouselTypes = z.infer<typeof CarouselTypesSchema>

export interface CarouselInterface {
    getInstanceDetails(): CarouselInstanceDetails
    createInstanceID(randomID: string): void
}

export const CarouselConfigSchema = z.object({
    carousel: z.string(),
    type: CarouselTypesSchema,
    randomID: z.string(),
})
export type CarouselConfig = z.infer<typeof CarouselConfigSchema>

export const CarouselResponseSchema = z.object({
    carousel: z.instanceof(HTMLElement),
    type: CarouselTypesSchema,
})
export type CarouselInstanceDetails = z.infer<typeof CarouselResponseSchema>

export const CarouselLibsSchema = z.union([z.literal('Swiper'), z.literal('Default')])
export type CarouselLibs = z.infer<typeof CarouselLibsSchema>

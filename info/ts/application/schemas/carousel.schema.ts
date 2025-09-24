import { CarouselSchema } from '@arizona/config-schemas'
import z from 'zod'

export const _CarouselSchema = CarouselSchema.unwrap()
export type CarouselTypes = z.infer<typeof _CarouselSchema>

export const CarouselLibsSchema = z.union([z.literal('swiper'), z.literal('default')])
export type CarouselLibrary = z.infer<typeof CarouselLibsSchema>

export const CarouselConfigSchema = z.object({
    carousel: z.string(),
    lib: CarouselLibsSchema,
    type: _CarouselSchema,
    randomID: z.string(),
})
export type CarouselConfig = z.infer<typeof CarouselConfigSchema>

export const CarouselResponseSchema = z.object({
    carousel: z.instanceof(HTMLElement),
    type: _CarouselSchema,
})
export type CarouselInstanceDetails = z.infer<typeof CarouselResponseSchema>

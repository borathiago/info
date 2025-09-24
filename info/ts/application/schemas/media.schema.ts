import { MediaSchema } from '@arizona/config-schemas'
import z from 'zod'

export const _MediaSchema = MediaSchema.unwrap()
export type MediaTypes = z.infer<typeof _MediaSchema>

export const VideoUISchema = z.object({
    controls: z.boolean(),
    muted: z.boolean(),
    playsInline: z.boolean(),
    autoplay: z.boolean(),
    loop: z.boolean(),
})
export type VideoUIConfig = z.infer<typeof VideoUISchema>

export const MediaCreationOptionsSchema = z.object({
    module: z.union([z.instanceof(HTMLElement), z.instanceof(Element)]),
    extension: z.string(),
    mediaClass: z.string(),
    type: _MediaSchema,
    ui: VideoUISchema.nullish(),
})
export type MediaCreationOptions = z.infer<typeof MediaCreationOptionsSchema>

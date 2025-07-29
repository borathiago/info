import z from 'zod'

export const MediaTypesSchema = z.union([z.literal('image'), z.literal('video')])
export type MediaTypes = z.infer<typeof MediaTypesSchema>

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
    type: MediaTypesSchema,
    ui: VideoUISchema.nullish(),
})
export type MediaCreationOptions = z.infer<typeof MediaCreationOptionsSchema>

export interface MediaInterface {
    structureMedia(): Promise<void>
    generateImage(device: string, element: HTMLElement | Element): Promise<void>
    generateVideo(device: string, element: HTMLElement | Element): Promise<void>
}

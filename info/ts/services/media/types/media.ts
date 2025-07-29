import z from 'zod'

export const MediaLogSchema = z.object({
    initMedia: z.array(
        z.object({
            media: z.string(),
            '@': z.string(),
        }),
    ),
})
export type MediaLog = z.infer<typeof MediaLogSchema>

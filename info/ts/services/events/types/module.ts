import z from 'zod'

export const LogSchema = z.object({
    initModuleEvents: z.array(
        z.object({
            event: z.string(),
            type: z.string(),
            '@': z.string(),
        }),
    ),
})
export type Log = z.infer<typeof LogSchema>

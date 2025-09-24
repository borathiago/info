import z from 'zod'

export const ModuleResponseSchema = z.object({
    module: z.instanceof(HTMLElement),
    ok: z.boolean(),
})
export type ModuleResponse = z.infer<typeof ModuleResponseSchema>

export const ModuleEventsSchema = z.union([z.literal('carousel, dialog, svg'), z.literal('carousel, dialog'), z.literal('dialog, svg'), z.literal('replacement'), z.literal('carousel'), z.literal('dialog'), z.literal('svg')])
export type ModuleEventsConfig = z.infer<typeof ModuleEventsSchema>

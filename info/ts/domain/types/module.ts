import z from 'zod'

export interface ModuleInterface {
    fetch(path: string): Promise<ModuleFetchResponse>
}

export const HTTPStatusCodeSchema = z.union([z.literal(200), z.literal(400), z.literal(401), z.literal(403), z.literal(404), z.literal(500), z.literal(502), z.literal(503), z.literal(504)])
export type HTTPStatusCode = z.infer<typeof HTTPStatusCodeSchema>

export const ModuleFetchResponseSchema = z.object({
    module: z.instanceof(HTMLElement),
    status: HTTPStatusCodeSchema,
    ok: z.boolean(),
})
export type ModuleFetchResponse = z.infer<typeof ModuleFetchResponseSchema>

export const ModuleEventsSchema = z.union([z.literal('carousel, dialog, svg'), z.literal('carousel, dialog'), z.literal('dialog, svg'), z.literal('replacement'), z.literal('carousel'), z.literal('dialog'), z.literal('svg')])
export type ModuleEventsConfig = z.infer<typeof ModuleEventsSchema>

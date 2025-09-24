import { LayoutSchema } from '@arizona/config-schemas'
import z from 'zod'

export type AppBrandType = z.infer<typeof LayoutSchema>

export const AppInstanceDetailsSchema = z.object({
    appId: z.string(),
    oppenedAt: z.string(),
})

export type AppInstanceDetails = z.infer<typeof AppInstanceDetailsSchema>

export const AppConfigSchema = z.object({
    root: z.string(),
    layout: LayoutSchema,
    app: z.string(),
    breakpoint: z.number(),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export const DeviceNavigatorSchema = z.object({
    maxTouchPoints: z.number().nullish(),
})

export type Navigator = z.infer<typeof DeviceNavigatorSchema>

export const DevicesTypeSchema = z.union([z.literal('desktop'), z.literal('mobile')])
export type DevicesType = z.infer<typeof DevicesTypeSchema>

export const ObserveDeviceResponseSchema = z.object({
    device: DevicesTypeSchema,
})
export type ObserveDeviceResponse = z.infer<typeof ObserveDeviceResponseSchema>

export const DeviceResponseSchema = z.object({
    appBreakpoint: z.number(),
    deviceHasTouch: z.boolean(),
    deviceIs: DevicesTypeSchema,
})

export type DeviceSchema = z.infer<typeof DeviceResponseSchema>

export const InstanceDataSchema = z.object({
    appId: z.string(),
    device: DevicesTypeSchema,
    oppenedAt: z.string(),
})
export type InstanceDataType = z.infer<typeof InstanceDataSchema>

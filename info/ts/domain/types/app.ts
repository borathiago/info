import z from 'zod'
import { CacheConfig } from './cache'
import { env } from '../../config'

export const AppBrandTypeSchema = z.union([z.literal('electrolux'), z.literal('mademsa')])
export type AppBrandType = z.infer<typeof AppBrandTypeSchema>

export interface AppInterface {
    validateDevice(): DeviceSchema
    applyStyles(): void
    insertHelperScript(scriptIdentifier: string, url: string): void
    setModules(): Set<HTMLElement | Element>
    toggleLayoutDisplay(classToRemove: string): void
    setUpSession(type: CacheConfig): void
    setUpCache(type: CacheConfig, environment: env): void
    observeSizeChanges(callback: (device: DevicesType) => void): void
    getInstanceData(): AppInstanceDetails
}

export const AppInstanceDetailsSchema = z.object({
    appId: z.string(),
    oppenedAt: z.string(),
})

export type AppInstanceDetails = z.infer<typeof AppInstanceDetailsSchema>

export const AppConfigSchema = z.object({
    modules: z.string(),
    root: z.string(),
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
    modules: z.number(),
    oppenedAt: z.string(),
})
export type InstanceDataType = z.infer<typeof InstanceDataSchema>

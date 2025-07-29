import z from 'zod'
import { AppInstanceDetailsSchema } from './app'
import { LogSchema } from '../../services/events/types/module'
import { MediaLogSchema } from '../../services/media/types/media'

export const CacheTypeSchema = z.union([z.literal('Electrolux'), z.literal('Mademsa')])
export type CacheConfig = z.infer<typeof CacheTypeSchema>

export const SessionConfigSchema = z.object({
    name: z.string(),
    log: AppInstanceDetailsSchema,
})
export type SessionConfig = z.infer<typeof SessionConfigSchema>

export const SessionDataConfigSchema = z.object({
    name: z.string(),
    log: LogSchema,
})
export type SessionEventsDataConfig = z.infer<typeof SessionDataConfigSchema>

export const SessionMediaConfigSchema = z.object({
    name: z.string(),
    log: MediaLogSchema,
})
export type SessionMediaDataConfig = z.infer<typeof SessionMediaConfigSchema>

export const StorageItemSchema = z.object({
    value: z.any(),
    expiry: z.number().nullish(),
})
export type StorageItem = z.infer<typeof StorageItemSchema>

export interface StorageInterface {
    startSession({ name, log }: SessionConfig): void
    saveSessionEventsData({ name, log }: SessionEventsDataConfig): void
    saveSessionMediaData({ name, log }: SessionMediaDataConfig): void
    getSession<T = unknown>(name: string): T
}

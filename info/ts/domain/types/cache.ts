import z from 'zod'
import { Media } from '../media'

export const CacheTypeSchema = z.union([z.literal('Electrolux'), z.literal('Mademsa')])
export type CacheConfig = z.infer<typeof CacheTypeSchema>

export const StorageItemSchema = z.object({
    value: z.any(),
    expiry: z.number().nullish(),
})
export type StorageItem = z.infer<typeof StorageItemSchema>

export interface CacheInterface {
    checkCacheAPISupport(): void
    reserveFonts(type: CacheConfig): void
    reserveScriptsAndStyles(): void
    reserveMedia(media: Media): Promise<void>
}

export const CacheMetadataSchema = z.object({
    timestamp: z.number(),
    expiry: z.number(),
})
export type CacheMetadata = z.infer<typeof CacheMetadataSchema>

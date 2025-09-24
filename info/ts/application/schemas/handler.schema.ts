import z from 'zod'

export const ListItemsSchema = z.enum(['all', 'class', 'tag'])
export type ListItemsType = z.infer<typeof ListItemsSchema>

export const FormatElementSchema = z.enum(['id', 'class'])
export type FormatElementType = z.infer<typeof FormatElementSchema>

export const CheckForAttributeParamsSchema = z.object({
    selector: z.union([z.instanceof(HTMLElement), z.instanceof(Element), z.null()]),
    attr: z.string(),
})
export type CheckForAttributeParams = z.infer<typeof CheckForAttributeParamsSchema>

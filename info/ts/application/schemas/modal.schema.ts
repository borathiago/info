import { ModalSchema } from '@arizona/config-schemas'
import z from 'zod'

export type ModalTypes = z.infer<typeof ModalSchema>

export const ModalUISchema = z.object({
    parent: z.string(),
    selector: z.string(),
    actionButtons: z.object({
        open: z.string(),
        close: z.string(),
    }),
    state: z.object({
        oppened: z.string(),
        closed: z.string(),
    }),
    transition: z.object({
        scale: z.string(),
        opacity: z.string(),
    }),
    hideOnModalOppened: z
        .object({
            elements: z.string(),
        })
        .nullish(),
})
export type ModalUIConfig = z.infer<typeof ModalUISchema>

export const ModalOptionsSchema = z.object({
    moduleID: z.string(),
    modalUI: ModalUISchema,
})
export type ModalOptions = z.infer<typeof ModalOptionsSchema>

export const ModalStateSchema = z.object({
    isOpen: z.boolean(),
    isClose: z.boolean(),
})
export type ModalStateType = z.infer<typeof ModalStateSchema>

export const ModalConfigSchema = z.instanceof(Element)

export const ModalTargetSchema = z.string()

export const HandleModalEventSchema = z.instanceof(HTMLElement)

export const ToggleModalStateSchema = z.object({
    item: ModalConfigSchema,
    state: ModalStateSchema,
})
export type ToggleModalType = z.infer<typeof ToggleModalStateSchema>

export const ApplyModalAnimationSchema = z.object({
    item: ModalConfigSchema,
    target: ModalTargetSchema,
    state: ModalStateSchema,
})
export type ApplyModalAnimationType = z.infer<typeof ApplyModalAnimationSchema>

export const HandleModalSchema = z.object({
    button: HandleModalEventSchema,
    target: ModalTargetSchema,
    state: ModalStateSchema,
})
export type HandleModalType = z.infer<typeof HandleModalSchema>

export type ExtendedModalStateType = ModalStateType & {
    switching?: boolean
    activeButtonId?: string
    keepActive?: boolean
}

import { ApplyModalAnimationType, HandleModalType, ToggleModalType } from '../schemas/modal.schema'

export interface ModalRepository {
    buildStructure(): Promise<void>
    toggleState({ item, state }: ToggleModalType): string
    applyAnimation({ item, target, state }: ApplyModalAnimationType): void
    handleModal({ button, target, state }: HandleModalType): void
}

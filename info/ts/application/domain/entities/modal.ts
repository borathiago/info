import { handler } from '../../utils/handler/handler'
import { ApplicationError } from '../../errors/application.error'
import { ModalRepository } from '../../repositories/modal.repository'
import { ApplyModalAnimationType, ExtendedModalStateType, HandleModalType, ModalOptions, ModalUIConfig, ToggleModalType } from '../../schemas/modal.schema'

export class Modal implements ModalRepository {
    moduleID: string
    modalUI: ModalUIConfig
    open: HTMLElement[] | Element[] = []
    close: HTMLElement[] | Element[] = []
    private animationTimeouts = new Map<string, number>()

    constructor({ moduleID, modalUI }: ModalOptions) {
        this.moduleID = handler.formatSelector(moduleID, 'id')
        this.modalUI = modalUI
        const _open = this.modalUI.actionButtons.open
        const _close = this.modalUI.actionButtons.close
        this.open = handler.listItems(`${this.moduleID} .${_open}`, 'all')
        this.close = handler.listItems(`${this.moduleID} .${_close}`, 'all')
        const _modals = this.modalUI.selector
        const modals = handler.listItems(`${this.moduleID} .${_modals}`, 'all')
        if (!modals && !this.open && !this.close) {
            throw new ApplicationError('Erro na configuração das classes do Modal')
        }
        this.buildStructure()
    }

    async buildStructure(): Promise<void> {
        await this.delay(100)
        this.open.forEach((item) => {
            const state: ExtendedModalStateType = { isOpen: true, isClose: false }
            const target = this.toggleState({ item, state })
            this.applyAnimation({ item, target, state })
        })
        this.close.forEach((item) => {
            item.classList.add(this.modalUI.transition.opacity, '-z-1', 'pointer-events-none')
            const state: ExtendedModalStateType = { isOpen: false, isClose: true }
            const target = this.toggleState({ item, state })
            this.applyAnimation({ item, target, state })
        })
    }

    toggleState({ item }: ToggleModalType & { state: ExtendedModalStateType }): string {
        const target = item.getAttribute('for')
        if (!target) {
            throw new ApplicationError(`O elemento "${item.getAttribute('id')}" requer o atributo for=""`)
        }
        return target
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /* Rolagem suave para o topo da seção */
    private scrollToSection(): void {
        const section = handler.getItem(this.moduleID)
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    /* Timeout controlado por chave */
    private setControlledTimeout(key: string, callback: () => void, delay: number): void {
        const existingTimeout = this.animationTimeouts.get(key)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
        }
        const timeoutId = window.setTimeout(() => {
            this.animationTimeouts.delete(key)
            callback()
        }, delay)
        this.animationTimeouts.set(key, timeoutId)
    }

    applyAnimation({ item, target, state }: ApplyModalAnimationType & { state: ExtendedModalStateType }): void {
        const { isOpen, isClose } = state
        const _scale = this.modalUI.transition.scale
        const _opacity = this.modalUI.transition.opacity
        const aside = this.modalUI.hideOnModalOppened?.elements
        const hasOtherElementsToAnimate = aside ? true : false
        let otherAnimatedElements: HTMLElement[] | null = null
        if (hasOtherElementsToAnimate) {
            otherAnimatedElements = handler.listItems(`${this.moduleID} .${aside}`, 'all')
        }
        item.addEventListener('click', (event) => {
            event.stopPropagation()
            if (isOpen) {
                this.scrollToSection()
                item.classList.add(_opacity, '-z-1', _scale, 'pointer-events-none')
                this.open.forEach((button) => {
                    if (button !== item) {
                        const otherTarget = button.getAttribute('for')
                        if (!otherTarget) {
                            throw new ApplicationError(`O botão ${item.getAttribute('id')} não tem o atributo for=""`)
                        }
                        const otherModal = handler.getItem(handler.formatSelector(otherTarget, 'id'))
                        if (otherModal && otherModal.classList.contains(this.modalUI.state.oppened)) {
                            const closeValue = button.getAttribute('close')
                            if (!closeValue) {
                                throw new ApplicationError(`O botão ${item.getAttribute('id')} não tem o atributo close=""`)
                            }
                            const otherCloseButton = handler.getItem(handler.formatSelector(closeValue, 'id'))
                            if (otherCloseButton) {
                                this.handleModal({
                                    button: otherCloseButton,
                                    target: otherTarget!,
                                    state: { isOpen: false, isClose: true, switching: true, activeButtonId: item.getAttribute('id')! },
                                })
                            }
                        }
                    }
                })
                if (hasOtherElementsToAnimate && otherAnimatedElements) {
                    otherAnimatedElements.forEach((animatedElement) => {
                        animatedElement.classList.add('pointer-events-none', _opacity)
                    })
                }
                const button = event.currentTarget as HTMLElement
                const extendedState: ExtendedModalStateType = {
                    ...state,
                    keepActive: true,
                    activeButtonId: item.getAttribute('id')!,
                }
                this.setControlledTimeout(
                    `open-${target}`,
                    () => {
                        this.handleModal({ button, target, state: extendedState })
                    },
                    200,
                )
            }
            if (isClose) {
                const button = event.currentTarget as HTMLElement
                this.setControlledTimeout(
                    `close-handle-${target}`,
                    () => {
                        this.handleModal({ button, target, state })
                    },
                    50,
                )
                this.setControlledTimeout(
                    `close-cleanup-${target}`,
                    () => {
                        if (hasOtherElementsToAnimate && otherAnimatedElements) {
                            if (!state.switching) {
                                otherAnimatedElements.forEach((animatedElement) => {
                                    animatedElement.classList.remove('pointer-events-none', _opacity)
                                })
                            }
                        }
                        item.classList.remove(_opacity, '-z-1', 'pointer-events-none', _scale)
                    },
                    50,
                )
            }
        })
    }

    handleModal({ button, target, state }: HandleModalType & { state: ExtendedModalStateType }): void {
        const { isOpen, isClose, switching, activeButtonId } = state
        const _opened = this.modalUI.state.oppened
        const _closed = this.modalUI.state.closed
        const _target = handler.formatSelector(target, 'id')
        const targettedItem = handler.getItem(_target)
        if (!targettedItem) {
            throw new ApplicationError(`O botão "${_target}" não foi encontrado`)
        }
        if (isOpen) {
            const closeValue = button.getAttribute('close')
            if (!closeValue) {
                throw new ApplicationError(`O botão ${button.getAttribute('id')} precisa de um atributo close="", indicando o id do botão .close-modal`)
            }
            const closeButtonFormattedId = handler.formatSelector(closeValue, 'id')
            const getCloseButton = handler.getItem(closeButtonFormattedId)
            if (!getCloseButton) {
                throw new ApplicationError(`O botão "${closeButtonFormattedId}" não foi encontrado`)
            }
            getCloseButton.classList.remove(this.modalUI.transition.opacity, '-z-1', 'pointer-events-none')
            targettedItem.classList.remove(_closed)
            targettedItem.classList.add(_opened)
        }
        if (isClose) {
            this.setControlledTimeout(
                `modal-close-${target}`,
                () => {
                    const opacity = this.modalUI.transition.opacity
                    const scale = this.modalUI.transition.scale
                    targettedItem.classList.remove(_opened)
                    targettedItem.classList.add(_closed)
                    this.open.forEach((openButton) => {
                        if (switching && activeButtonId && openButton.getAttribute('id') === activeButtonId) {
                            return
                        }
                        openButton.classList.remove('-z-1', 'pointer-events-none', opacity, scale)
                    })
                    if (!switching && this.modalUI.hideOnModalOppened?.elements) {
                        const elements = handler.listItems(`${this.moduleID} .${this.modalUI.hideOnModalOppened.elements}`, 'all')
                        elements.forEach((element) => {
                            element.classList.remove('pointer-events-none', opacity)
                        })
                    }
                },
                50,
            )
            this.setControlledTimeout(
                `modal-final-${target}`,
                () => {
                    button.classList.add(this.modalUI.transition.opacity, '-z-1', 'pointer-events-none')
                },
                400,
            )
        }
    }

    destroy(): void {
        this.animationTimeouts.forEach((timeoutId) => {
            clearTimeout(timeoutId)
        })
        this.animationTimeouts.clear()
    }
}

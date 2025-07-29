import { AppError } from '../errors/app-error'
import { handler } from '../utils/handler'
import { ApplyModalAnimationType, ExtendedModalStateType, HandleModalType, ModalInterface, ModalOptions, ModalUIConfig, ToggleModalType } from './types/modal'

export class Modal implements ModalInterface {
    moduleID: string
    modalUI: ModalUIConfig
    open: HTMLElement[] | Element[] = []
    close: HTMLElement[] | Element[] = []

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
            throw new AppError('Erro na configuração das classes do Modal')
        }
        this.buildStructure()
    }

    async buildStructure(): Promise<void> {
        await new Promise((resolve) => setTimeout(() => resolve('Done'), 100))
        this.open.forEach((item) => {
            const state: ExtendedModalStateType = { isOpen: true, isClose: false }
            const target = this.toggleState({ item, state })
            this.applyAnimation({ item, target, state })
        })
        this.close.forEach((item) => {
            item.classList.add('opacity-0', '-z-1', 'pointer-events-none')
            const state: ExtendedModalStateType = { isOpen: false, isClose: true }
            const target = this.toggleState({ item, state })
            this.applyAnimation({ item, target, state })
        })
    }

    toggleState({ item }: ToggleModalType & { state: ExtendedModalStateType }): string {
        const target = item.getAttribute('for')
        if (!target) {
            throw new AppError(`O elemento "${item}" requer o atributo for=""`)
        }
        return target
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
                item.classList.add(_opacity, '-z-1', _scale, 'pointer-events-none')
                this.open.forEach((button) => {
                    if (button !== item) {
                        const otherTarget = button.getAttribute('for')
                        const otherModal = handler.getItem(`#${otherTarget}`)
                        if (otherModal && otherModal.classList.contains(this.modalUI.state.oppened)) {
                            const closeValue = button.getAttribute('close')
                            if (closeValue) {
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
                    }
                })
                if (hasOtherElementsToAnimate && otherAnimatedElements) {
                    otherAnimatedElements.forEach((animatedElement) => {
                        animatedElement.classList.add('pointer-events-none', 'opacity-0')
                    })
                }
                const button = event.currentTarget as HTMLElement
                const extendedState: ExtendedModalStateType = {
                    ...state,
                    keepActive: true,
                    activeButtonId: item.getAttribute('id')!,
                }
                new Promise((resolve) => setTimeout(() => resolve('Done'), 100)).then(() => {
                    this.handleModal({ button, target, state: extendedState })
                })
            }
            if (isClose) {
                const button = event.currentTarget as HTMLElement
                new Promise((resolve) => setTimeout(() => resolve('Done'), 100)).then(() => {
                    this.handleModal({ button, target, state })
                })
                new Promise((resolve) => setTimeout(() => resolve('Done'), 200)).then(() => {
                    if (hasOtherElementsToAnimate && otherAnimatedElements) {
                        if (!state.switching) {
                            otherAnimatedElements.forEach((animatedElement) => {
                                animatedElement.classList.remove('pointer-events-none', 'opacity-0')
                            })
                        }
                    }
                    item.classList.remove(_opacity, '-z-1', 'pointer-events-none', _scale)
                })
            }
        })
    }

    handleModal({ button, target, state }: HandleModalType & { state: ExtendedModalStateType }): void {
        const { isOpen, isClose, switching, activeButtonId } = state
        const _opened = this.modalUI.state.oppened
        const _closed = this.modalUI.state.closed
        const targettedItem = handler.getItem(`#${target}`)
        if (!targettedItem) {
            throw new AppError(`O botão "#${target}" não foi encontrado`)
        }
        if (isOpen) {
            const closeValue = button.getAttribute('close')
            if (!closeValue) {
                throw new AppError(`O botão ${button.getAttribute('id')} precisa de um atributo close="", indicando o id do botão .close-modal`)
            }
            const closeButtonFormattedId = handler.formatSelector(closeValue, 'id')
            const getCloseButton = handler.getItem(closeButtonFormattedId)
            if (!getCloseButton) {
                throw new AppError(`O botão "${closeButtonFormattedId}" não foi encontrado`)
            }
            getCloseButton.classList.remove('opacity-0', '-z-1', 'pointer-events-none')
            targettedItem.classList.remove(_closed)
            targettedItem.classList.add(_opened)
        }
        if (isClose) {
            new Promise((resolve) => setTimeout(() => resolve('Done'), 300)).then(() => {
                const opacity = this.modalUI.transition.opacity
                const scale = this.modalUI.transition.scale
                targettedItem.classList.remove(_opened)
                targettedItem.classList.add(_closed)
                this.open.forEach((button) => {
                    if (switching && activeButtonId && button.getAttribute('id') === activeButtonId) {
                        return
                    }
                    button.classList.remove('-z-1', 'pointer-events-none', opacity, scale)
                })
                if (!switching && this.modalUI.hideOnModalOppened?.elements) {
                    const elements = handler.listItems(`${this.moduleID} .${this.modalUI.hideOnModalOppened.elements}`, 'all')
                    elements.forEach((element) => {
                        element.classList.remove('pointer-events-none', 'opacity-0')
                    })
                }
            })
            new Promise((resolve) => setTimeout(() => resolve('Done'), 450)).then(() => {
                button.classList.add('opacity-0', '-z-1', 'pointer-events-none')
            })
        }
    }
}

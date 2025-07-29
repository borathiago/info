import { AppError } from '../errors/app-error'
import { CheckForAttributeParams, FormatElementType, ListItemsType } from './types/handler'

class Handler {
    private chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    getItem(item: string): HTMLElement | null {
        const element = document.querySelector<HTMLElement>(item)
        if (!element) {
            throw new AppError(`Elemento "${item}" não encontrado`)
        }
        return element
    }

    getItemByID(item: string): HTMLElement | null {
        const element = document.getElementById(item)
        if (!element) {
            throw new AppError(`Elemento com ID "${item}" não foi encontrado`)
        }
        return element as HTMLElement
    }

    listItems(items: string, type: ListItemsType): HTMLElement[] {
        switch (type) {
            case 'all':
                return Array.from(document.querySelectorAll<HTMLElement>(items))
            case 'tag':
                return Array.from(document.getElementsByTagName(items) as HTMLCollectionOf<HTMLElement>)
            case 'class':
                return Array.from(document.getElementsByClassName(items) as HTMLCollectionOf<HTMLElement>)
            default:
                throw new AppError(`Tipo inválido: "${type}". Use "all", "tag" ou "class"`)
        }
    }

    formatSelector(item: string, type: FormatElementType): string {
        switch (type) {
            case 'class':
                return item.startsWith('.') ? item : `.${item}`
            case 'id':
                return item.startsWith('#') ? item : `#${item}`
            default:
                throw new AppError(`Tipo inválido: "${type}". Use "id" ou "class".`)
        }
    }

    createRandomString(length: number): string {
        if (length <= 0) {
            throw new AppError('O comprimento deve ser maior que zero')
        }
        if (!window.crypto || !window.crypto.getRandomValues) {
            let result = ''
            for (let i = 0; i < length; i++) {
                result += this.chars.charAt(Math.floor(Math.random() * this.chars.length))
            }
            return result
        } else {
            const array = new Uint32Array(length)
            crypto.getRandomValues(array)
            const result = Array.from(array, (num) => this.chars.charAt(num % this.chars.length))
            return result.join('')
        }
    }

    checkForAttribute({ selector, attr }: CheckForAttributeParams): boolean {
        if (!selector) {
            throw new AppError('O seletor não pode ser nulo')
        }
        if (!attr) {
            throw new AppError('O atributo não pode ser vazio')
        }
        return selector.hasAttribute(attr)
    }
}

const handler = new Handler()
export { handler }

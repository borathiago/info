import { AppError } from '../errors/app-error'
import { StorageItem } from './types/cache'
import { SessionConfig, SessionEventsDataConfig, SessionMediaDataConfig, StorageInterface } from './types/storage'

class Storage implements StorageInterface {
    private hasLocalStorage = typeof localStorage !== 'undefined'
    private hasSessionStorage = typeof sessionStorage !== 'undefined'
    private userAgent = navigator.userAgent
    private defaultExpiry = 24 * 60 * 60 * 1000 /* 24 horas em milissegundos */

    constructor() {
        this.checkStorageSupport()
    }

    private checkStorageSupport(): void {
        if (!this.hasLocalStorage && !this.hasSessionStorage) {
            throw new AppError(`Seu navegador não suporta sessionStorage: você está em ${this.userAgent}`)
        }
    }

    startSession({ name, log }: SessionConfig) {
        this.session(name, log)
    }

    saveSessionEventsData({ name, log }: SessionEventsDataConfig) {
        this.session(name, log)
    }

    saveSessionMediaData({ name, log }: SessionMediaDataConfig): void {
        this.session(name, log)
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    session(name: any, log: any, expiry?: number) {
        this.checkStorageSupport()
        const item: StorageItem = {
            value: log,
            expiry: expiry ? Date.now() + expiry : this.defaultExpiry,
        }
        try {
            sessionStorage.setItem(name, JSON.stringify(item))
        } catch (error) {
            throw new AppError(`Falha ao armazenar dados em cache: ${(error as Error).message}`)
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    getSession(name: string): any {
        try {
            const storedItem = sessionStorage.getItem(name)
            if (!storedItem) {
                return null
            }
            const item: StorageItem = JSON.parse(storedItem)
            const hasItemExpired = item.expiry && Date.now() > item.expiry
            if (hasItemExpired) {
                sessionStorage.removeItem(name)
                return null
            }
            return item.value
        } catch (error) {
            throw new AppError(`Erro ao recuperar dados da sessionStorage: ${(error as Error).message}`)
        }
    }

    clearExpiredItems(): void {}
}

const storage = new Storage()
export { storage }

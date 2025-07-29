import { isAxiosError } from 'axios'
import { api } from '../infra/api/api'
import { AppError } from '../errors/app-error'
import { handler } from '../utils/handler'
import { HTTPStatusCode, ModuleFetchResponse, ModuleInterface } from './types/module'

export class Module implements ModuleInterface {
    id: string
    module: HTMLElement
    private classes: Set<string> = new Set()

    constructor(id: string) {
        this.id = id
        const module = handler.getItemByID(this.id)
        if (!module) {
            throw new AppError(`O módulo "${module}" não foi encontrado ou não existe`)
        }
        this.module = module
        this.initClasses()
    }

    private initClasses() {
        Array.from(this.module.classList).forEach((className) => {
            this.classes.add(className)
        })
    }

    async fetch(path: string): Promise<ModuleFetchResponse> {
        try {
            const response = await api.get(path)
            const status = response.status as HTTPStatusCode
            const section = await response.data
            this.module.innerHTML = section
            this.module.setAttribute('loaded', 'true')
            return {
                module: this.module,
                status,
                ok: true,
            }
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status || (400 as HTTPStatusCode)
                return {
                    module: this.module,
                    status: status as HTTPStatusCode,
                    ok: false,
                }
            } else {
                return { module: this.module, status: 400 as HTTPStatusCode, ok: false }
            }
        }
    }
}

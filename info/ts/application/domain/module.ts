import { handler } from '../utils/handler/handler'
import { ApplicationError } from '../errors/application.error'
import { ModuleRepository } from '../repositories/module.repository'
import { ModuleResponse } from '../schemas/module.schema'

export class Module implements ModuleRepository {
    id: string
    module: HTMLElement
    private classes: Set<string> = new Set()

    constructor(id: string) {
        this.id = id
        const module = handler.getItemByID(this.id)
        if (!module) {
            throw new ApplicationError(`O módulo "${module}" não foi encontrado ou não existe.`)
        }
        this.module = module
        this.initClasses()
    }

    private initClasses() {
        Array.from(this.module.classList).forEach((className) => {
            this.classes.add(className)
        })
    }

    async load(): Promise<ModuleResponse> {
        try {
            this.module.setAttribute('loaded', 'true')
            return {
                module: this.module,
                ok: true,
            }
        } catch (_error) {
            return { module: this.module, ok: false }
        }
    }
}

import { ModuleResponse } from '../schemas/module.schema'

export interface ModuleRepository {
    load(): Promise<ModuleResponse>
}

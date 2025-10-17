import { Module } from '../../application/domain/entities/module'
import { ApplicationError } from '../../application/errors/application.error'
import { ModuleResponse } from '../../application/schemas/module.schema'

export const response = new Set<ModuleResponse>()

export const processModules = async (modules: Set<HTMLElement | Element>): Promise<ModuleResponse[]> => {
    const modulePromises = Array.from(modules).map(async (element) => {
        const id = element.getAttribute('id')
        if (!id) {
            throw new ApplicationError(`O módulo ${element} não possui id.`)
        }

        const module = new Module(id)
        const moduleResponse = await module.load()
        response.add(moduleResponse)
        return moduleResponse
    })

    const results = await Promise.all(modulePromises)
    return results
}
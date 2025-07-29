import { App } from './domain/app'
import { Module } from './domain/module'
import { AppError } from './errors/app-error'
import { handler } from './utils/handler'
import { initModuleEvents } from './services/events/module'
import { InstanceDataType } from './domain/types/app'
import { ModuleFetchResponse } from './domain/types/module'
import { initMedia } from './services/media/media'
import { storage } from './domain/storage'
import { logger } from './logger'
import { app, breakpoint, env, modules, root, scriptIdentifier, url } from './config'

export const appInstance = new App({ modules, root, app, breakpoint })
appInstance.validateDevice()
appInstance.applyStyles()

appInstance.insertHelperScript(scriptIdentifier, url)

export const response = new Set<ModuleFetchResponse>()
appInstance.setModules().forEach(async (element) => {
    const id = element.getAttribute('id')
    if (!id) {
        throw new AppError(`O módulo "${element}" não possui "id"`)
    }
    const path = element.getAttribute('module')
    if (!path) {
        throw new AppError(`O módulo "${element}" não possui o atributo "module"`)
    }
    const module = new Module(id)
    const moduleResponse = await module.fetch(path)
    response.add(moduleResponse)
})

appInstance.setUpCache('Electrolux', env)

export const instanceLength = appInstance.setModules().size
export const instanceData: InstanceDataType = {
    ...appInstance.getInstanceData(),
    modules: instanceLength,
    device: appInstance.device,
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Callback = (prop: keyof InstanceDataType, value: any) => void
const subscribers = new Set<Callback>()
export const subscribe = (callback: Callback) => {
    if (!subscribers.has(callback)) {
        subscribers.add(callback)
    }
}
export const reactiveInstanceData = new Proxy<InstanceDataType>(instanceData, {
    set<K extends keyof InstanceDataType>(target: InstanceDataType, property: K, value: InstanceDataType[K]): boolean {
        target[property] = value
        instanceData[property] = value
        subscribers.forEach((callback) => callback(property, value))
        return true
    },
})
const name = 'Instance Data'
const log = { ...instanceData }
storage.session(name, log)

let appInitialized = false
let modulesProcessed = false
const setUpListeners = async () => {
    if (appInitialized) return
    appInitialized = true
    await new Promise<void>((resolve) => {
        if (document.readyState !== 'loading') {
            resolve()
        } else {
            document.addEventListener('DOMContentLoaded', () => resolve())
        }
    })
    await new Promise<void>((resolve) => {
        if (document.readyState !== 'complete') {
            resolve()
        } else {
            window.addEventListener('load', () => resolve())
        }
    })
    const observer = new MutationObserver(async () => {
        if (modulesProcessed) {
            return
        }
        const contents = handler.listItems('[loaded]', 'all')
        const areAllModulesProcessed = contents.length === instanceLength && contents.length === response.size + 1
        if (areAllModulesProcessed) {
            modulesProcessed = true
            await Promise.all(
                contents.map(async (content) => {
                    await initMedia(content)
                    initModuleEvents(content)
                    if (env === 'development') {
                        logger.info(':: Mídia & Eventos ::', content)
                    }
                }),
            )
            await new Promise((resolve) => setTimeout(resolve, 950)).then(() => {
                observer.disconnect()
                void document.body.offsetHeight
                appInstance.toggleLayoutDisplay('opacity-0')
                if (env === 'development') {
                    logger.info('Observador desconectado.')
                }
            })
        }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    appInstance.observeSizeChanges((updatedDevice) => {
        reactiveInstanceData.device = updatedDevice
        const name = 'Instance Data'
        const log = { ...reactiveInstanceData }
        storage.session(name, log)
        if (env === 'development') {
            logger.info(':: Dados reativos da instância de App ::', log)
        }
    })
}
setUpListeners()

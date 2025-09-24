import { App } from './application/domain/app'
import { handler } from './application/utils/handler/handler'
import { initMedia } from './services/media/media.service'
import { app, breakpoint, layout, root } from './config'
import { InstanceDataType } from './application/schemas/app.schema'
import { ModuleResponse } from './application/schemas/module.schema'
import { ApplicationError } from './application/errors/application.error'
import { Module } from './application/domain/module'
import { initModuleEvents } from './services/module/module.service'

console.log(':: Buscando contêiner ::')
const getContainer = (): Document | ShadowRoot => {
    const shadow = document.querySelector('#infographic-shadow-container')?.shadowRoot
    if (shadow) {
        console.log(':: Contêiner raiz encontrado ::', shadow)
        return shadow
    }
    console.log(':: Contêiner raiz encontrado ::', document)
    return document
}

export const container = getContainer()
export const isShadowRoot = container instanceof ShadowRoot

console.log(':: Iniciando aplicação ::')
export const application = new App({ root, layout, app, breakpoint })
console.log(':: application ::', application)
application.validateDevice()
application.applyStyles()

export const instanceData: InstanceDataType = {
    ...application.getInstanceData(),
    device: application.device,
}
console.log(':: instanceData ::', instanceData)

export const response = new Set<ModuleResponse>()

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
console.log(':: reactiveInstanceData ::', reactiveInstanceData)

const processModules = async (): Promise<ModuleResponse[]> => {
    console.log(':: Iniciando processamento dos módulos ::')
    const modules = application.setModules()
    const modulePromises = Array.from(modules).map(async (element) => {
        const id = element.getAttribute('id')
        if (!id) {
            throw new ApplicationError(`O módulo ${element} não possui id.`)
        }
        console.log(':: Processando módulo ::', id)
        const module = new Module(id)
        const moduleResponse = await module.load()
        response.add(moduleResponse)
        return moduleResponse
    })

    const results = await Promise.all(modulePromises)
    console.log(':: Todos os módulos processados ::', response)
    return results
}

const processLoadedMedia = async (): Promise<void> => {
    const loadedElements = handler.listItems('[loaded]', 'all')
    console.log(':: Elementos [loaded] encontrados ::', loadedElements)
    if (loadedElements.length > 0) {
        console.log(':: Inicializando mídia dos elementos [loaded]')
        await Promise.all(
            loadedElements.map(async (content) => {
                await initMedia(content)
                initModuleEvents(content)
            }),
        )
    }
}

const initializeApp = async (): Promise<void> => {
    try {
        console.log(':: Modo de injeção detectado. Iniciando sem aguardar eventos DOM ::')
        await processModules() /* Processar módulos */
        console.log(':: Módulos processados com sucesso ::')
        await new Promise((resolve) => setTimeout(resolve, 100))
        await processLoadedMedia() /* Aguardar processamento de mídias */
        await new Promise((resolve) => setTimeout(resolve, 300))
        /* Forçar reflow */
        if (container instanceof ShadowRoot) {
            const host = (container as any).host
            if (host) void host.offsetHeight
        } else {
            void document.body.offsetHeight
        }
        application.toggleLayoutDisplay('opacity-0')
        /* Configurar observador de mudanças de dispositivo */
        application.observeSizeChanges((updatedDevice) => {
            reactiveInstanceData.device = updatedDevice
        })
        console.log(':: Aplicação inicializada ::')
    } catch (error) {
        console.error(':: Erro na inicialização da aplicação ::', error)
        try {
            console.log(':: Tentando inicialização de fallback ::')
            await new Promise((resolve) => setTimeout(resolve, 300))
            application.toggleLayoutDisplay('opacity-0')
        } catch (error) {
            console.error(':: Falha no fallback ::', error)
        }
    }
}

const isDocumenteReadyStateComplete = document.readyState === 'complete'
const startApp = (): void => {
    /* Em contexto de injeção, document.readyState provavelmente já será 'complete' */
    if (isDocumenteReadyStateComplete) {
        console.log(':: Contexto de injeção detectado ::')
        requestAnimationFrame(() => {
            initializeApp()
        })
    } else if (document.readyState === 'interactive') {
        /* DOM carregando. Recursos ainda indisponíveis */
        console.log(':: DOM interativo. Esperando por load ::')
        window.addEventListener('load', () => {
            requestAnimationFrame(() => {
                initializeApp()
            })
        })
    } else {
        /* DOM ainda carregando */
        console.log(':: DOM carregando. Esperando por DOMContentLoaded')
        document.addEventListener('DOMContentLoaded', () => {
            if (isDocumenteReadyStateComplete) {
                requestAnimationFrame(() => {
                    initializeApp()
                })
            } else {
                window.addEventListener('load', () => {
                    requestAnimationFrame(() => {
                        initializeApp()
                    })
                })
            }
        })
    }
}

startApp()

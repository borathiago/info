import { App } from './application/domain/app'
import { app, breakpoint, layout, root } from './config'
import { InstanceDataType } from './application/schemas/app.schema'
import { processModules } from './infrastructure/processors/module.processor'
import { processLoadedMedia } from './infrastructure/processors/media.processor'
import { getContainer } from './infrastructure/container/application.container'
import { subscribers } from './infrastructure/subscriber/application.subscriber'

export const container = getContainer()
export const isShadowRoot = container instanceof ShadowRoot

export const application = new App({ 
    root,
    layout,
    app,
    breakpoint 
})

application.validateDevice()
application.applyStyles()

const instanceData: InstanceDataType = {
    ...application.getInstanceData(),
    device: application.device,
}

export const reactiveInstanceData = new Proxy<InstanceDataType>(instanceData, {
    set<K extends keyof InstanceDataType>(target: InstanceDataType, property: K, value: InstanceDataType[K]): boolean {
        target[property] = value
        instanceData[property] = value
        subscribers.forEach((callback) => callback(property, value))
        return true
    },
})

export const modules = application.setModules()

const initializeApp = async (): Promise<void> => {
    try {
        await processModules(modules) /* Processar módulos */
        /* await new Promise((resolve) => setTimeout(resolve, 100)) */
        await processLoadedMedia() /* Aguardar processamento de mídias */
        /* await new Promise((resolve) => setTimeout(resolve, 300)) */
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
    } catch (error) {
        console.error(':: Erro na inicialização da aplicação ::', error)
        try {
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
        requestAnimationFrame(() => {
            initializeApp()
        })
    } else if (document.readyState === 'interactive') {
        /* DOM carregando. Recursos ainda indisponíveis */
        window.addEventListener('load', () => {
            requestAnimationFrame(() => {
                initializeApp()
            })
        })
    } else {
        /* DOM ainda carregando */
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

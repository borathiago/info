import { env } from '../config'
import { AppError } from '../errors/app-error'
import { handler } from '../utils/handler'
import { cache } from './cache'
import { storage } from './storage'
import { AppConfig, AppInstanceDetails, AppInterface, DeviceSchema, Navigator, DevicesType } from './types/app'
import { CacheConfig } from './types/cache'

export class App implements AppInterface {
    root: string
    app: HTMLElement | Element
    modules: string
    breakpoint: number
    hasTouch: boolean = false
    instanceId: string = ''
    deviceIs: DevicesType = 'desktop'
    private readonly container: string[] = ['flex', 'direction-column', 'justify-center', 'align-center', 'transition-all', 'opacity-0']

    constructor({ modules, root, app, breakpoint }: AppConfig) {
        this.root = root
        this.modules = modules
        this.breakpoint = breakpoint
        this.app = this.validateAppInput(app)
    }

    get device() {
        return this.deviceIs
    }

    private validateAppInput(app: string): HTMLElement | Element {
        const _app = handler.getItemByID(app)
        if (!_app) {
            throw new AppError(`O elemento "${app}" não foi encontrado`)
        }
        return _app
    }

    validateDevice(): DeviceSchema {
        const UserAgent = navigator.userAgent
        this.hasTouch = 'maxTouchPoints' in navigator && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ? navigator.maxTouchPoints > 0 : 'orientation' in window ? true : /BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod/i.test(UserAgent)
        const device = window.innerWidth >= this.breakpoint ? 'desktop' : 'mobile'
        this.deviceIs = device as DevicesType
        return {
            appBreakpoint: this.breakpoint,
            deviceHasTouch: this.hasTouch,
            deviceIs: this.deviceIs,
        }
    }

    applyStyles() {
        const root = handler.getItem(this.root)
        if (!root) {
            throw new AppError(`O elemento "${root}" não foi encontrado`)
        }
        const random = handler.createRandomString(8)
        const appInstanceId = `app-electrolux-${random}`
        root.setAttribute('id', appInstanceId)
        this.container.forEach((_class) => {
            const doesRootHaveClass = root.classList.contains(_class)
            if (doesRootHaveClass) {
                return
            }
            this.app.classList.add(_class)
        })
        handler.getItem('body')!.classList.remove('desktop-app', 'mobile-app')
        handler.getItem('body')!.classList.add(`${this.deviceIs}-app`)
        this.instanceId = appInstanceId
    }

    insertHelperScript(scriptIdentifier: string, url: string) {
        const script: HTMLScriptElement = document.createElement('script')
        script.setAttribute('class', scriptIdentifier)
        script.type = 'text/javascript'
        script.src = url
        document.body.appendChild<HTMLScriptElement>(script)
    }

    setModules(): Set<HTMLElement | Element> {
        const set = new Set<HTMLElement | Element>()
        const modules = handler.listItems('[module]', 'all')
        if (!modules) {
            throw new AppError('Nenhum módulo foi encontrado')
        }
        modules.map((module) => {
            set.add(module)
        })
        return set
    }

    toggleLayoutDisplay(classToRemove: string) {
        const doesAppHaveClassToRemove = this.app.classList.contains(classToRemove)
        if (doesAppHaveClassToRemove) {
            this.app.classList.remove(classToRemove)
        }
    }

    setUpSession(type: CacheConfig): void {
        storage.startSession({
            name: `App @ ${type}`,
            log: this.getInstanceData(),
        })
    }

    setUpCache(type: CacheConfig, environment: env): void {
        cache.reserveFonts(type)
        if (environment === 'production') {
            cache.reserveScriptsAndStyles()
        }
    }

    observeSizeChanges(callback: (device: DevicesType) => void): void {
        const desktop = window.matchMedia(`(min-width: ${this.breakpoint + 1}px)`)
        const mobile = window.matchMedia(`(max-width: ${this.breakpoint}px)`)
        desktop.addEventListener('change', (event) => {
            if (event.matches) {
                updateDevice()
            }
        })
        mobile.addEventListener('change', (event) => {
            if (event.matches) {
                updateDevice()
            }
        })
        const updateDevice = () => {
            this.deviceIs = desktop.matches ? 'desktop' : 'mobile'
            handler.getItem('body')!.classList.remove('desktop-app', 'mobile-app')
            handler.getItem('body')!.classList.add(`${this.deviceIs}-app`)
            callback(this.deviceIs)
        }
    }

    getInstanceData(): AppInstanceDetails {
        const { deviceIs } = this.validateDevice()
        return {
            appId: this.instanceId,
            oppenedAt: deviceIs as DevicesType,
        }
    }
}

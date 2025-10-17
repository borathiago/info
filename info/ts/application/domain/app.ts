import { ApplicationError } from '../errors/application.error'
import { handler } from '../utils/handler/handler'
import { AppRepository } from '../repositories/app.repository'
import { AppConfig, AppInstanceDetails, DeviceSchema, DevicesType } from '../schemas/app.schema'
import { Layout } from '@arizona/config-schemas'

export class App implements AppRepository {
    main: HTMLElement
    app: HTMLElement | Element
    layout: Layout
    breakpoint: number
    hasTouch: boolean = false
    instanceId: string = ''
    deviceIs: DevicesType = 'desktop'
    private classes: Set<string> = new Set()
    private readonly container: string[] = ['flex', 'direction-column', 'justify-center', 'align-center', 'transition-all', 'opacity-0']

    constructor({ root, layout, app, breakpoint }: AppConfig) {
        const _root = handler.getItem(root)
        if (!_root) {
            throw new ApplicationError(`O elemento "${_root}" não foi encontrado`)
        }
        this.main = _root
        this.breakpoint = breakpoint
        this.layout = layout
        this.app = this.validateAppInput(app)
        this.initClasses()
    }

    get device() {
        return this.deviceIs
    }

    private initClasses() {
        Array.from(this.main.classList).forEach((className) => {
            this.classes.add(className)
        })
    }

    private addClass(className: string) {
        if (this.classes.has(className)) {
            return
        }
        this.classes.add(className)
        this.main.classList.add(className)
    }

    private validateAppInput(app: string): HTMLElement | Element {
        const _app = handler.getItemByID(app)
        if (!_app) {
            throw new ApplicationError(`O elemento ${app} não foi encontrado`)
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
        const random = handler.createRandomString(8)
        const appInstanceId = `app-electrolux-${random}`
        this.main.setAttribute('class', appInstanceId)
        this.container.forEach((_class) => {
            const doesRootHaveClass = this.app.classList.contains(_class)
            if (doesRootHaveClass) {
                return
            }
            this.app.classList.add(_class)
        })
        if (this.main.classList.contains('desktop-app')) {
            this.main.classList.remove('mobile-app')
        } else if (this.main.classList.contains('mobile-app')) {
            this.main.classList.remove('mobile-app')
        }
        this.addClass(`${this.deviceIs}-app`)
        const fontStyle = `font-${this.layout}`
        this.addClass(fontStyle)
        this.instanceId = appInstanceId
    }

    setModules(): Set<HTMLElement | Element> {
        const set = new Set<HTMLElement | Element>()
        const modules = handler.listItems('[module]', 'all')
        if (!modules) {
            throw new ApplicationError('Nenhum módulo foi encontrado')
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
            if (this.main.classList.contains('desktop-app')) {
                this.main.classList.remove('mobile-app')
            } else if (this.main.classList.contains('mobile-app')) {
                this.main.classList.remove('mobile-app')
            }
            this.addClass(`${this.deviceIs}-app`)
            callback(this.deviceIs)
        }
    }

    getInstanceData(): AppInstanceDetails {
        const { deviceIs } = this.validateDevice()
        return {
            appInstanceId: this.instanceId,
            device: deviceIs as DevicesType,
        }
    }
}

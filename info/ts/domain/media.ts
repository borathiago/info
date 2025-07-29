import { env } from '../config'
import { AppError } from '../errors/app-error'
import { logger } from '../logger'
import { appInstance } from '../main'
import { handler } from '../utils/handler'
import { MediaCreationOptions, MediaInterface, MediaTypes, VideoUIConfig } from './types/media'

export class Media implements MediaInterface {
    mediaClass: string
    module: HTMLElement | Element
    elements: HTMLElement[] | Element[] = []
    type: MediaTypes
    extension: string
    ui?: VideoUIConfig
    private classes: Set<string> = new Set()

    constructor({ module, extension, mediaClass, type, ui }: MediaCreationOptions) {
        this.module = module
        this.mediaClass = mediaClass
        const formattedModuleID = handler.formatSelector(this.module.getAttribute('id')!, 'id')
        const formattedMediaClass = handler.formatSelector(this.mediaClass, 'class')
        const media = handler.listItems(`${formattedModuleID} ${formattedMediaClass}`, 'all')
        if (!media) {
            throw new AppError(`O elemento "${formattedMediaClass}" não foi encontrado`)
        }
        this.elements = media
        this.type = type
        this.extension = extension
        this.ui = ui ?? undefined
        this.initClasses()
    }

    private initClasses() {
        this.elements.map((element) => {
            Array.from(element.classList).forEach((className) => {
                this.classes.add(className)
            })
        })
    }

    private addClass(className: string) {
        if (this.classes.has(className)) {
            return
        }
        this.classes.add(className)
        this.module.classList.add(className)
    }

    async structureMedia(): Promise<void> {
        let device
        this.elements.map((element) => {
            switch (this.type) {
                case 'image':
                    switch (appInstance.device) {
                        case 'desktop':
                            device = element.getAttribute('desktop')
                            if (!device) {
                                throw new AppError(`O elemento "${element}" não possui o atributo "mobile"`)
                            }
                            this.generateImage(device, element)
                            break
                        case 'mobile':
                            device = element.getAttribute('mobile')
                            if (!device) {
                                throw new AppError(`O elemento "${element}" não possui o atributo "mobile"`)
                            }
                            this.generateImage(device, element)
                            break
                    }
                    break
                case 'video':
                    switch (appInstance.device) {
                        case 'desktop':
                            device = element.getAttribute('desktop')
                            if (!device) {
                                throw new AppError(`O elemento "${element}" não possui o atributo "mobile"`)
                            }
                            this.generateVideo(device, element)
                            break
                        case 'mobile':
                            device = element.getAttribute('mobile')
                            if (!device) {
                                throw new AppError(`O elemento "${element}" não possui o atributo "mobile"`)
                            }
                            this.generateVideo(device, element)
                            break
                    }
                    break
            }
        })
    }

    async generateImage(device: string, element: HTMLElement | Element): Promise<void> {
        return new Promise((resolve) => {
            const folder = element.getAttribute('id')?.slice(-2)
            if (!folder) {
                throw new AppError(`Atributo ID não encontrado ou o contêiner de ".${this.mediaClass}" não contém informação de pasta`)
            }
            const img = new Image()
            img.loading = 'eager'
            img.decoding = 'async'
            img.src = `./img/${folder}/${device}.${this.extension}`
            img.setAttribute('id', `object-${handler.createRandomString(12)}-electrolux-image-${handler.createRandomString(8)}`)
            const newClass = `electrolux-image-${this.module.id.slice(-2)}-container`
            if (!this.classes.has(newClass)) {
                this.addClass(newClass)
            }
            img.setAttribute('class', `electrolux-image-${this.module.id.slice(-2)}`)
            img.onload = () => {
                element.innerHTML = ''
                element.appendChild(img)
                if (env === 'development') {
                    logger.info(`Media :: Image @ /img/${folder}`, img)
                }
                resolve()
            }
            img.onerror = () => {
                if (env === 'development') {
                    logger.info('Erro ao carregar imagem ::', img)
                }
                element.innerHTML = `<div class="media-placeholder">Imagem não disponível</div>`
                resolve()
            }
        })
    }

    async generateVideo(device: string, element: HTMLElement | Element): Promise<void> {
        return new Promise((resolve) => {
            const folder = element.getAttribute('id')?.slice(-2)
            if (!folder) {
                throw new AppError(`Atributo ID não encontrado ou o contêiner de ".${this.mediaClass}" não contém informação de pasta`)
            }
            const video = document.createElement('video')
            video.src = `./img/${folder}/${device}.${this.extension}`
            video.setAttribute('id', `object-${handler.createRandomString(5)}-electrolux-video-${handler.createRandomString(8)}`)
            video.setAttribute('class', 'electrolux-video')
            video.controls = this.ui?.controls ?? false
            video.muted = this.ui?.muted ?? false
            video.playsInline = this.ui?.playsInline ?? false
            video.autoplay = this.ui?.autoplay ?? false
            video.loop = this.ui?.loop ?? false
            video.onload = () => {
                element.innerHTML = ''
                element.appendChild(video)
                if (env === 'development') {
                    logger.info(`Media :: Video @ /img/${folder}`, video)
                }
                resolve()
            }
            video.onerror = () => {
                if (env === 'development') {
                    logger.info('Erro ao carregar vídeo ::', video)
                }
                element.innerHTML = `<div class="media-placeholder">Vídeo não disponível</div>`
                resolve()
            }
        })
    }

    async update(): Promise<void> {
        await this.structureMedia()
    }
}

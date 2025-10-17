import { ApplicationError } from '../../errors/application.error'
import { application } from '../../../main'
import { handler } from '../../utils/handler/handler'
import { MediaRepository } from '../../repositories/media.repository'
import { MediaCreationOptions, MediaTypes, VideoUIConfig } from '../../schemas/media.schema'
import { imgPath } from '../../../config'

export class Media implements MediaRepository {
    mediaClass: string
    module: HTMLElement | Element
    elements: HTMLElement[] | Element[] = []
    type: MediaTypes
    extension: string
    ui?: VideoUIConfig
    private classes: Set<string> = new Set()
    private mediaSeoAttributes = new Map<string, string[]>()
    private animationTimeouts = new Map<string, number>()

    constructor({ module, extension, mediaClass, type, ui }: MediaCreationOptions) {
        this.module = module
        this.mediaClass = mediaClass
        const formattedModuleID = this.getFormattedModuleId()
        const formattedMediaClass = handler.formatSelector(this.mediaClass, 'class')
        const media = handler.listItems(`${formattedModuleID} ${formattedMediaClass}`, 'all')
        if (!media) {
            throw new ApplicationError(`O elemento "${formattedMediaClass}" não foi encontrado`)
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

    private getFormattedModuleId(): string {
        const moduleId = this.module.getAttribute('id')
        if (!moduleId) {
            throw new ApplicationError('O módulo de imagem deve obrigatoriamente ter um ID')
        }
        return handler.formatSelector(moduleId, 'id')
    }

    private getElementId(element: HTMLElement | Element): string {
        const id = element.getAttribute('id')
        if (!id) {
            throw new ApplicationError('A div contendo a classe "electrolux-create-image" deve também conter um ID.')
        }
        return id
    }

    private validateSeoAttributes(element: HTMLElement | Element): string[] {
        const _alt = element.getAttribute('alt')
        if (!_alt) {
            throw new ApplicationError(`O elemento "${element.getAttribute('id')}" deve ter um atributo alt=""`) 
        }
        const _title = element.getAttribute('title')
        if (!_title) {
            throw new ApplicationError(`O elemento "${element.getAttribute('id')}" deve ter um atributo title=""`) 
        }
        return [
            _alt,
            _title
        ]
    }

    private createAltAndTitleAttributes(image: HTMLImageElement, element: HTMLElement | Element): void {
        const isMediaFirstCreated = this.mediaSeoAttributes.size === 0
        if (isMediaFirstCreated) {
            const [ alt, title ] = this.validateSeoAttributes(element)
            this.mediaSeoAttributes.set(this.getElementId(element), [ alt, title ])
            image.alt = alt
            image.title = title
            element.removeAttribute('alt')
            element.removeAttribute('title')
        }
        const elementId = this.getElementId(element)
        const mediaSeoAttributesMap = this.mediaSeoAttributes.get(elementId)
        if (mediaSeoAttributesMap) {
            image.alt = mediaSeoAttributesMap[0]
            image.title = mediaSeoAttributesMap[1]
        }
    }

    private setControlledTimeout(key: string, callback: () => void, delay: number): void {
        const existingTimeout = this.animationTimeouts.get(key)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
        }
        const timeoutId = window.setTimeout(() => {
            this.animationTimeouts.delete(key)
            callback()
        }, delay)
        this.animationTimeouts.set(key, timeoutId)
    }

    async createMedia(): Promise<void> {
        let device
        this.elements.map(async (element) => {
            switch(application.device) {
                case 'desktop':
                    device = element.getAttribute('desktop')
                    if (!device) { throw new ApplicationError(`O elemento "${element.getAttribute('id')}" não possui o atributo "desktop"`) }
                break
                case 'mobile':
                    device = element.getAttribute('mobile')
                    if (!device) { throw new ApplicationError(`O elemento "${element.getAttribute('id')}" não possui o atributo "mobile"`) }
                break
            }
            if (this.type === 'image') {
                await this.generateImage(device, element)
            } else if (this.type === 'video') {
                await this.generateVideo(device, element)
            }
        })
    }

    async generateImage(device: string, element: HTMLElement | Element): Promise<void> {
        return new Promise((resolve) => {
            const imgURL = `${imgPath}/${device}.${this.extension}`
            const img = new Image()
            img.loading = 'eager'
            img.decoding = 'async' 
            img.src = imgURL
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            img.style.display = 'block'
            img.setAttribute('id', `electrolux-image-${handler.createRandomString(12)}`)
            const newClass = `electrolux-image-${this.module.id.slice(-2)}-container`
            if (!this.classes.has(newClass)) {
                this.addClass(newClass)
            }
            img.setAttribute('class', `electrolux-image-${this.module.id.slice(-2)}`)
            this.createAltAndTitleAttributes(img, element)
            img.onload = () => {
                this.setControlledTimeout(
                    `dim-opacity-for-${device}-${img.getAttribute('id')}`,
                    () => {
                        if (element instanceof HTMLElement) {
                            element.style.width = `100%`
                            element.style.height = `auto`
                        }
                        element.classList.add('opacity-0')
                        img.classList.add('opacity-0')
                    },
                    0
                )
                this.setControlledTimeout(
                    `add-media-content-for-${device}-${img.getAttribute('id')}`,
                    () => {
                        element.innerHTML = ''
                        element.appendChild(img)
                    },
                    50
                )
                this.setControlledTimeout(
                    `resolve-media-for-${device}-${img.getAttribute('id')}`,
                    () => {
                        element.classList.remove('opacity-0')
                        img.classList.remove('opacity-0')
                        resolve()
                    },
                    400
                )
            }
            img.onerror = (error) => {
                console.error(':: Erro ao carregar imagem ::', {
                    url: imgURL,
                    error: error
                })
                element.innerHTML = `<div class="media-placeholder">Imagem não disponível</div>`
                resolve()
            }
        })
    }

    async generateVideo(device: string, element: HTMLElement | Element): Promise<void> {
        return new Promise((resolve) => {
            const video = document.createElement('video')
            video.src = `${imgPath}/${device}.${this.extension}`
            video.setAttribute('id', `object-${handler.createRandomString(5)}-electrolux-video-${handler.createRandomString(8)}`)
            video.setAttribute('class', 'electrolux-video')
            video.controls = this.ui?.controls ?? false
            video.muted = this.ui?.muted ?? false
            video.playsInline = this.ui?.playsInline ?? false
            video.autoplay = this.ui?.autoplay ?? false
            video.loop = this.ui?.loop ?? false
            video.onloadeddata = () => {
                element.innerHTML = ''
                element.appendChild(video)
                resolve()
            }
            video.onerror = () => {
                element.innerHTML = `<div class="media-placeholder">Vídeo não disponível</div>`
                resolve()
            }
        })
    }

    async update(): Promise<void> {
        await this.createMedia()
    }
}
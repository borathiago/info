import { ApplicationError } from '../errors/application.error'
import { application } from '../../main'
import { handler } from '../utils/handler/handler'
import { MediaRepository } from '../repositories/media.repository'
import { MediaCreationOptions, MediaTypes, VideoUIConfig } from '../schemas/media.schema'
import { imgPath } from '../../config'

export class Media implements MediaRepository {
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
            throw new ApplicationError(`O elemento "${formattedMediaClass}" não foi encontrado`)
        }
        this.elements = media
        this.type = type
        this.extension = extension
        this.ui = ui ?? undefined
        this.initClasses()
        console.log(':: Media ::', this.module)
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

    async createMedia(): Promise<void> {
        let device
        this.elements.map(async (element) => {
            switch(application.device) {
                case 'desktop':
                    device = element.getAttribute('desktop')
                    if (!device) { throw new ApplicationError(`O elemento "${element}" não possui o atributo "desktop"`) }
                break
                case 'mobile':
                    device = element.getAttribute('mobile')
                    if (!device) { throw new ApplicationError(`O elemento "${element}" não possui o atributo "mobile"`) }
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
            console.log(`:: Media ::`, imgURL)
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            img.style.display = 'block'
            img.setAttribute('id', `object-${handler.createRandomString(12)}-electrolux-image-${handler.createRandomString(8)}`)
            const newClass = `electrolux-image-${this.module.id.slice(-2)}-container`
            if (!this.classes.has(newClass)) {
                this.addClass(newClass)
            }
            img.setAttribute('class', `electrolux-image-${this.module.id.slice(-2)}`)
            img.onload = () => {
                console.log(`:: Imagem carregada com sucesso ::`, imgURL)
                element.innerHTML = ''
                element.appendChild(img)
                resolve()
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

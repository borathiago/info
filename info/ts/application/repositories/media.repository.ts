export interface MediaRepository {
    createMedia(): Promise<void>
    generateImage(device: string, element: HTMLElement | Element): Promise<void>
    generateVideo(device: string, element: HTMLElement | Element): Promise<void>
}

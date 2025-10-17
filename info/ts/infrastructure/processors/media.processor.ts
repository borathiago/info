import { handler } from '../../application/utils/handler/handler'
import { startModuleEventsService } from '../../services/module/module.service'
import { createMediaService } from '../../services/media/media.service'

export const processLoadedMedia = async (): Promise<void> => {
    const loadedElements = handler.listItems('[loaded]', 'all')
    if (loadedElements.length > 0) {
        await Promise.all(
            loadedElements.map(async (content) => {
                await createMediaService(content)
                startModuleEventsService(content)
            }),
        )
    }
}
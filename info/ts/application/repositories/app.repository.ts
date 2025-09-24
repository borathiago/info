import { AppInstanceDetails, DeviceSchema, DevicesType } from '../schemas/app.schema'

export interface AppRepository {
    validateDevice(): DeviceSchema
    applyStyles(): void
    setModules(): Set<HTMLElement | Element>
    toggleLayoutDisplay(classToRemove: string): void
    observeSizeChanges(callback: (device: DevicesType) => void): void
    getInstanceData(): AppInstanceDetails
}

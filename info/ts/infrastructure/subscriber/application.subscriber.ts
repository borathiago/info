import { InstanceDataType } from '../../application/schemas/app.schema'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Callback = (prop: keyof InstanceDataType, value: any) => void

export const subscribers = new Set<Callback>()

export const subscribe = (callback: Callback) => {
    if (!subscribers.has(callback)) {
        subscribers.add(callback)
    }
}
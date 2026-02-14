export interface ISaveServices {
    save(key: string, data: unknown)
    load<T>(key: string, def: T): T
}
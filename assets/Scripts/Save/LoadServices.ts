import { sys } from "cc";
import { ISaveServices } from "./ISaveServices";

export class LoadServices implements ISaveServices {
    save(key: string, data: unknown) {
        sys.localStorage.setItem(key, JSON.stringify(data))
    }
    load<T>(key: string, def: T): T {
        const value = sys.localStorage.getItem(key)
        if (value === null) {
            return def
        }
        try {
            return JSON.parse(value) as T
        } catch (e) {
            console.warn(`[LocalService] load parse failed: ${key}`, e);
            return def
        }
    }
}



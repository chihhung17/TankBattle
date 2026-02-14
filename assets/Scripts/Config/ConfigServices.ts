import { JsonAsset, resources } from "cc";
import { ConfigTable } from "./ConfigTable";
import { WithID } from "./Config";
import { ConfigRegister } from "./ConfigRegister";

/**
 * 配置加载服务
 */
export class ConfigServices {
    private static _cache = new Map<string, ConfigTable<any>>() // 表内数据缓存
    private static _loading = new Map<string, Promise<ConfigTable<any>>>() // 是否加载中


    /** 预加载 */
    static async preload(names?: string[]): Promise<void> {
        const list = names ?? ConfigRegister.listName()
        await Promise.all(list.map(n => this.table(n)))
    }

    /** 加载表内json */
    static async table<T extends WithID>(name: string): Promise<ConfigTable<T>> {
        const cached = this._cache.get(name)
        if (cached) {
            return cached as ConfigTable<T>
        }
        const loading = this._loading.get(name)
        if (loading) {
            return loading as Promise<ConfigTable<any>>
        }
        const p = this.loadTableInternal<T>(name)
        this._loading.set(name, p as Promise<ConfigTable<any>>)
        try {
            const table = await p
            this._cache.set(name, table)
            return table
        } finally {
            this._loading.delete(name)
        }
    }

    /** 获取表的路径，加载表内数据后传给configtable */
    private static async loadTableInternal<T extends WithID>(name: string): Promise<ConfigTable<any>> {
        const def = ConfigRegister.getDef(name)
        const rowsUnknown = await this.loadJson(def.path)
        const rows = rowsUnknown as T[]
        return new ConfigTable<T>(rows)
    }


    /** 加载json数据 */
    private static loadJson<T>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, JsonAsset, (err, assert) => {
                if (err) {
                    console.error(`[configservices] 加载失败${path}`, err)
                    reject(err)
                    return
                }
                resolve(assert.json as T)
            })
        })
    }
    static clearCache() {
        this._cache.clear()
        this._loading.clear()
    }
}



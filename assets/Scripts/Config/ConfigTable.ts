import { WithID } from "./Config";

/**
 * 表内数据逐条存储
 */
export class ConfigTable<T extends WithID> {
    private _map = new Map<number, T>()

    constructor(rows: T[]) {
        for (const row of rows) {
            this._map.set(row.id, row)
        }
    }

    /** 获取数据 */
    mustGet(id: number): T {
        const row = this._map.get(id)
        if (!row) {
            throw new Error(`[configTable]中没有该条数据${id}`)
        }
        return row
    }

    /** 返回所有行数据 */
    values(): T[] {
        return Array.from(this._map.values())
    }

    /** 返回表内数据条数 */
    size():number{
        return this._map.size
    }
}



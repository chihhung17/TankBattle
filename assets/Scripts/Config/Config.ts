import { ConfigRegister } from "./ConfigRegister"
import { ConfigServices } from "./ConfigServices"
import { ConfigTable } from "./ConfigTable"

/**
 * 存储表名和内部数据
 * 外部调用文件
 */
export type WithID = { id: number }// 约定每条对象都要包含id
export class Config {
    private static _inited: boolean = false
    /** 存储所有的表数据 */
    private static _tables = new Map<string, ConfigTable<any>>()

    /**
     * 初始化
     * @param preLoadNames 
     */
    static async init(preLoadNames?: string[]): Promise<void> {
        if (this._inited) return
        await ConfigServices.preload(preLoadNames)

        const names = preLoadNames ?? ConfigRegister.listName()
        for (const name of names) {
            const table = await ConfigServices.table(name)
            this._tables.set(name, table)
        }
        this._inited = true
    }

    static get<T extends WithID>(name: string): ConfigTable<T> {
        if (!this._inited) {
            throw new Error("[config]未初始化")
        }
        const table = this._tables.get(name)
        if (!table) {
            throw new Error(`[config]没有这个表${name},检查是否初始化和注册`)
        }
        return table as ConfigTable<T>
    }
    /** 判断是否准备完毕（初始化完成） */
    static isReady(): boolean {
        return this._inited
    }
    static reset() {
        this._inited = false
        this._tables.clear()
        ConfigServices.clearCache()
    }
}




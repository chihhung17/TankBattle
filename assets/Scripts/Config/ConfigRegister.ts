import { WithID } from "./Config";

/**
 * 配置表注册管理
 */
/** 存储表名和路径 */
export type TableDef<T extends WithID> = {
    name: string;
    path: string
}
export class ConfigRegister {
    private static _def = new Map<string, TableDef<any>>()

    static register<T extends WithID>(def: TableDef<any>) {
        if (this._def.has(def.name)) {
            throw new Error(`[configregistry] 表名重复${def.name}`)
        }
        this._def.set(def.name, def)
    }

    /** 获取表名和路径 */
    static getDef(name: string): TableDef<any> {
        const def = this._def.get(name)
        if (!def) {
            throw new Error(`[configregistry] 没有这张表${name}`)
        }
        return def
    }
    /** 返回所有表名 */
    static listName(): string[] {
        return Array.from(this._def.keys())
    }
}



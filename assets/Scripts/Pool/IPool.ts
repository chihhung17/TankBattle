/** 对象池接口 */
export interface IPool {
    /** 取出 */
    onSpawn?(): void,
    /** 回收 */
    onDespawn?(): void
}

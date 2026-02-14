import { Node, Prefab, instantiate, Vec3, Quat, find } from 'cc';
import { PoolableBase } from './PoolableBase';

/**
 * 全局单例对象池管理
 */
export class PoolManager {
    // 通过数组方式存储整个对象池的可用节点 
    private static _free = new Map<string, Node[]>()
    // 回收对象池根节点
    private static _root: Node | null = null
    // 回收池 记录是否已经回收
    private static _inPool = new Set<string>()

    /** 设置回收节点 */
    static init() {
        this._root = find("Canvas/PlayingPanel/PoolRoot")
    }

    /** 预创建，创建就回收 */
    static warmUp(key: string, prefab: Prefab, count: number) {
        this._ensureRoot()
        const list = this._getList(key)
        for (let i = 0; i < count; i++) {
            const node = instantiate(prefab)
            this._despawnInternal(key, node, list)
        }
    }

    /**
     * 从列表生成对象
     * @param key 对象名称
     * @param prefab 对象预制体
     * @param parent 对象父节点
     * @returns 
     */
    static spawn(key: string, prefab: Prefab, parent?: Node): Node {
        this._ensureRoot()
        // 获取该对象列表
        const list = this._getList(key)
        let node = list.pop()
        // 若无则生成对象 若有则从回收池中删除
        if (!node) {
            node = instantiate(prefab)
        } else {
            this._inPool.delete(node.uuid)
        }
        const poolable = node.getComponent(PoolableBase)
        if (!poolable) {
            throw new Error(`[PoolManager]  "${key}" 没有poolablebase组件.`)
        }
        if (parent) {
            node.setParent(parent)
        } else {
            node.setParent(this._root!)
        }

        poolable.onSpawn()
        return node
    }

    /** 回收对象 */
    static despawn(key: string, node: Node) {
        if (!node || !node.isValid) return
        this._ensureRoot()
        const list = this._getList(key)
        // 防止重复回收
        if (this._inPool.has(node.uuid)) return
        this._despawnInternal(key, node, list)
    }


    /** 清空某个池 */
    static clear(key: string) {
        const list = this._free.get(key)
        if (!list) return
        for (const node of list) {
            if (node && node.isValid) node.destroy()
            if (node) this._inPool.delete(node.uuid)
        }
        list.length = 0
    }

    /** 清空所有池 */
    static clearAll() {
        for (const key of this._free.keys()) {
            this.clear(key)
        }
        this._free.clear()
        this._inPool.clear()
    }
    /** 对象池根节点是否存在 */
    private static _ensureRoot() {
        if (!this._root || !this._root.isValid) {
            throw new Error('[PoolManager] 没有设置回收池根节点.');
        }
    }
    /** 取出列表 */
    private static _getList(key: string): Node[] {
        let list = this._free.get(key)
        if (!list) {
            list = []
            this._free.set(key, list)
        }
        return list
    }
    /**
     * 回收对象
     * @param key 对象名称
     * @param node  回收的对象节点
     * @param list  对象名称对应的数组
     */
    private static _despawnInternal(key: string, node: Node, list: Node[]) {
        // 判断回收的对象是否有poolable
        const poolable = node.getComponent(PoolableBase)
        if (!poolable) {
            throw new Error(`[PoolManager] "${key}"没有poolableBase组件.`)
        }
        poolable.onDespawn()
        // 放回回收对象池
        node.setParent(this._root!)
        // 初始化
        node.setPosition(Vec3.ZERO)
        node.setRotation(Quat.IDENTITY)
        node.setScale(Vec3.ONE)
        // 放入回收池
        this._inPool.add(node.uuid)
        list.push(node)

    }
}
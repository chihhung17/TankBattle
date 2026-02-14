/** 定时器约束 */
export class TimerTask {
    id: number
    interval: number // 间隔时间
    callBack: Function // 回调函数
    loop: boolean // 是否循环
    remin: number //剩余时间
    paused = false //是否暂停
    constructor(
        id: number,
        interval: number,
        callBack: Function,
        loop: boolean
    ) {
        this.id = id
        this.interval = interval
        this.callBack = callBack
        this.loop = loop
        this.remin = interval
    }
}
/** 定时器管理 */
export class TimerManager {
    private static _id = 0
    private static _map = new Map<number, TimerTask>()
    private static _paused = false

    static update(dt: number) {
        if (this._paused) return
        this._map.forEach(task => {
            if (task.paused) return
            task.remin -= dt
            if (task.remin <= 0) {
                task.callBack()
                if (task.loop) {
                    task.remin = task.interval
                } else {
                    this._map.delete(task.id)
                }
            }
        })
    }

    /**
     * 添加到map中
     * @param interval 延时执行时间 
     * @param callBack  回调函数
     * @param loop  是否循环
     * @returns 
     */
    private static _add(interval: number, callBack: Function, loop: boolean): number {
        const id = ++this._id
        const task = new TimerTask(
            id, interval, callBack, loop
        )
        this._map.set(id, task)
        return id
    }
    /** 延时执行一次 */
    static once(delay: number, callBack: Function): number {
        return this._add(delay, callBack, false)
    }
    /** 循环时间执行 */
    static loop(interval: number, callBack: Function): number {
        return this._add(interval, callBack, true)
    }

    /** 暂停与恢复 */
    static pauseAll() {
        this._paused = true
    }
    static resumeAll() {
        this._paused = false
    }
    /** 清除某个计时器 */
    static clear(id: number) {
        this._map.delete(id)
    }
}
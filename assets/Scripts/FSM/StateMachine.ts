import { ISate } from "./ISate";

/** 状态机管理 */
export class StateMachine {
    /** 当前状态、上一状态 */
    private current?: ISate
    private last_state: ISate
    /** 状态切换 */
    change(next: ISate) {
        this.current?.exit()
        this.current = next
        this.current.enter()
    }
    update(dt: number) {
        this.current?.update(dt)
    }

    get state(): string | undefined {
        return this.current?.name
    }
}



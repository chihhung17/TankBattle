import { GameManager } from "../../Manager/GameManager";
import { ISate } from "../ISate";
/**
 * 游戏中状态
 */
export class PlayingState implements ISate {
    name = "Playing";
    constructor(private gm: GameManager) { }
    enter(): void {
        this.gm.showPanel(false, true)

    }
    exit(): void {
        // TODO 对所有物体进行回收
    }
    update(dt: number): void {

    }
}



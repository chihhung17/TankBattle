import { ISate } from '../ISate';
import { GameManager } from '../../Manager/GameManager';
import { Config } from '../../Config/Config';
import { EventBus } from '../../Events/EventBus';
import { GameEvents } from '../../Events/GameEvents';
import { SelectedPlayerModel } from '../../Model/SelectedPlayerModel';
/**
 * 进入游戏的瞬间状态，加载场景和资源
 */
export class BootState implements ISate {
    name = "Boot";
    constructor(private gm: GameManager) { }
    async enter() {
        this.gm.showPanel(false, false)
        // 加载数据 不初始化
        await Config.init() 
        // this.gm.init()
        await SelectedPlayerModel.init() 
        EventBus.emit(GameEvents.Flow.ToMenu)

        
    }
    exit(): void {

    }
    update(dt: number): void {

    }
}



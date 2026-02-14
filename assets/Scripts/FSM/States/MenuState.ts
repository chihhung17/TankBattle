import { GameManager } from "../../Manager/GameManager";
import { MenuUIPanel } from "../../UIPanel/MenuUIPanel";
import { ISate } from "../ISate";
/**
 * 菜单状态
 */
export class MenuState implements ISate {
    name = "Menu";
    constructor(private gm: GameManager) { }
    enter(): void {
        this.gm.showPanel(true, false)
        MenuUIPanel.getInstance().showOrHide(true, false)
    }
    exit(): void {
        
    }
    update(dt: number): void {

    }


}



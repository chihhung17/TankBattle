import { Config } from "../Config/Config"
import { PlayerConfig } from "../Config/ConfigType"
import { LoadAnything } from "../Tools/LoadAnything"
import { MenuUIPanel } from "../UIPanel/MenuUIPanel"

/**
 * 初始化生成玩家按钮
 */
export class SelectedPlayerModel {
    private static _inited = false

    /** 初始化玩家界面 */
    static async init() {
        if (this._inited) return
        const playerCount = Config.get<PlayerConfig>("Player").size()
        for (let i = 1; i <= playerCount; i++) {
            const path = await Config.get<PlayerConfig>("Player").mustGet(i).spf
            const spf = await LoadAnything.getSprie(path)
            MenuUIPanel.getInstance().setPlayerBtn(i, String(i), spf)
        }
        this._inited = true
    }
}



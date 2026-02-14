import { Config } from "../Config/Config"
import { SkillConfig } from "../Config/ConfigType"
import { PlayingUIPanel } from "../UIPanel/PlayingUIPanel"

/** 选择技能模块 */
export class SelectedSkillModel {
    /** 随机从skill中获取三个 */
    private static _inited = false
    private static count: number = 3 // 生成三个

    /** 随机生成按钮 */
    static async randomSkill() {
        PlayingUIPanel.getInstance().clearLayout()
        const playerCount = Config.get<SkillConfig>("Skills").size()
        const ids = this.randomUniqueNumber(playerCount, this.count)
        for (const i of ids) {
            const tips = await Config.get<SkillConfig>("Skills").mustGet(i).tips
            const add = await Config.get<SkillConfig>("Skills").mustGet(i).add
            PlayingUIPanel.getInstance().setSkillBtn(i, tips, add)
        }
    }

    /** 获取随机数字，不重复 */
    static randomUniqueNumber(max: number, count: number): number[] {
        if (count > max) {
            throw new Error("count 不能大于 max")
        }
        const set = new Set<number>()
        while (set.size < count) {
            const num = Math.floor(Math.random() * max) + 1
            set.add(num)
        }
        return Array.from(set)
    }
}



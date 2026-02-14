import { Config } from "../Config/Config";
import { LevelConfig, PlayerConfig, SkillConfig } from "../Config/ConfigType";
import { EventBus } from "../Events/EventBus";
import { GameEvents } from "../Events/GameEvents";
import { UIEvents } from "../Events/UIEvents";
import { ISaveServices } from "../Save/ISaveServices";
/**
 * 玩家数据
 */
export class PlayerData {

    private _currentPlayerId: number
    private _current_data = new Map<number, PlayerConfig>() // 当前玩家数据
    private _DATANAME: string
    private _LEVELDATANAME: string = "LEVEL"
    private _currentLevel: number // 默认关卡
    private _levelData = new Map<number, LevelConfig>()


    // 无尽模式参数

    private isLoopMode: boolean = false
    // 血量存储，用于死亡后重生设定
    private playerHPDefault: number

    constructor(private save: ISaveServices) { }

    setLoopMode(value: boolean) {
        this.isLoopMode = value
    }
    enable() {
        EventBus.on(UIEvents.Selected.onSelectedPlayer, this.onSelectedPlayer, this)
        EventBus.on(UIEvents.Click.onLoadGame, this.onLoadGame, this)
        EventBus.on(UIEvents.Click.onStartGame, this.onStartGame, this)
        EventBus.on(UIEvents.Click.onGetSkill, this.onGetSkill, this)
        EventBus.on(GameEvents.Player.GetDamage, this.getDamage, this)

    }
    disable() {
        EventBus.off(UIEvents.Selected.onSelectedPlayer, this.onSelectedPlayer, this)
        EventBus.off(UIEvents.Click.onLoadGame, this.onLoadGame, this)
        EventBus.off(UIEvents.Click.onStartGame, this.onStartGame, this)
        EventBus.off(UIEvents.Click.onGetSkill, this.onGetSkill, this)
        EventBus.off(GameEvents.Player.GetDamage, this.getDamage, this)
    }

    /** 点击加载游戏 */
    onLoadGame() {
        this.isLoopMode = false
        // todo 获取当前游戏id，游戏id通关后会+1，同时要判断id数量
        const saved = this.save.load<LevelConfig | null>(this._LEVELDATANAME, null)
        if (saved) {
            this._currentLevel = saved.id
            this._levelData.set(this._currentLevel, saved)
        } else {
            this.onStartGame()
        }
    }
    /** 点击开始游戏 */
    onStartGame() {
        this.isLoopMode = false
        this._currentLevel = 1
        const leveldata = Config.get<LevelConfig>("Level").mustGet(this._currentLevel)
        this._levelData.set(this._currentLevel, leveldata)
        this.save.save(this._LEVELDATANAME, leveldata)
    }
    /** 触发选择人物 */
    onSelectedPlayer = (customEventData) => {
        this._currentPlayerId = Number(customEventData)
        this._current_data.clear()
        const playerCfg = Config.get<PlayerConfig>("Player").mustGet(this._currentPlayerId)
        this._current_data.set(this._currentPlayerId, playerCfg)
        this._DATANAME = playerCfg.name

        const saved = this.save.load<PlayerConfig | null>(this._DATANAME, null)
        if (saved) {
            this._current_data.clear()
            this._current_data.set(this._currentPlayerId, saved)
            this.playerHPDefault = saved.HP
            EventBus.emit(GameEvents.Game.ReadyStart)
        } else {
            this.save.save(this._DATANAME, playerCfg)
            this.playerHPDefault = playerCfg.HP
            EventBus.emit(GameEvents.Game.ReadyStart)
        }

    }
    /** 加载下一关
     * gamemanager中调用该方法
     */
    onNext() {
        this._levelData.clear()
        this._currentLevel += 1
        if (this._currentLevel > Config.get<LevelConfig>("Level").size()) {
            EventBus.emit(GameEvents.Flow.ToMenu)
        }
        const leveldata = Config.get<LevelConfig>("Level").mustGet(this._currentLevel)
        this._levelData.set(this._currentLevel, leveldata)
        this.save.save(this._LEVELDATANAME, leveldata)
    }
    /**
     * 监听技能值
     */
    onGetSkill = (customEventData) => {
        const id = (Number(customEventData))
        const property = Config.get<SkillConfig>("Skills").mustGet(id).property
        const addForce = Config.get<SkillConfig>("Skills").mustGet(id).add
        const max = Config.get<SkillConfig>("Skills").mustGet(id).max
        const data = this.save.load<PlayerConfig | null>(this._DATANAME, null)
        
        // 判断property，然后进行不同数据的增加
        // playerspeed，HP，fireRate，fireRadius
        switch (property) {
            case "fireRadius":
                data.radius += addForce
                if (data.radius >= max) {
                    data.radius = max
                }
                break;
            case "fireRate":
                data.fireRate += addForce
                if (data.fireRate >= max) {
                    data.fireRate = max
                }
                break;
            case "playerHp":
                data.HP += addForce
                if (data.HP >= max) {
                    data.HP = max
                }
                this.playerHPDefault = data.HP
                break;
            case "playerSpeed":
                data.speed += addForce
                if (data.speed >= max) {
                    data.speed = max
                }
                break;
            case "bulletSpeed":
                data.bulletSpeed += addForce
                if (data.bulletSpeed >= max) {
                    data.bulletSpeed = max
                }
                break;
        }
        this.save.save(this._DATANAME, data)
        EventBus.emit(UIEvents.Click.onNext)
    }
    /** 玩家被攻击 */
    getDamage() {
        const data = this.save.load<PlayerConfig | null>(this._DATANAME, null)
        if (data) {
            data.HP -= 1
            if (data.HP <= 0) {
                // 死亡获取默认数据
                EventBus.emit(UIEvents.Refresh.refreshHP, 0)
                EventBus.emit(GameEvents.Death.PlayerDeath)
                data.HP = this.playerHPDefault // 血量回到默认用于重生
                this.save.save(this._DATANAME, data)
                return
            }
        }
        this.save.save(this._DATANAME, data)
        EventBus.emit(UIEvents.Refresh.refreshHP, data.HP)
    }

    getCurrentPlayerData() {
        const a = this._current_data.get(this._currentPlayerId)
        return this.save.load<PlayerConfig | PlayerConfig>(this._DATANAME, a)
    }
    getCurrentLevelData() {
        const a = this._levelData.get(this._currentLevel)
        return this.save.load<LevelConfig | LevelConfig>(this._LEVELDATANAME, a)
    }
}



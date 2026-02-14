import { _decorator, Component, director, math, Node, Prefab, SpriteFrame, TiledMapAsset, UITransform, Vec3 } from 'cc';
import { PoolManager } from '../Pool/PoolManager';
import { TimerManager } from '../Tools/TimerManager';
import { PlayingUIPanel } from '../UIPanel/PlayingUIPanel';
import { StateMachine } from '../FSM/StateMachine';
import { BootState } from '../FSM/States/BootState';
import { MenuState } from '../FSM/States/MenuState';
import { PlayingState } from '../FSM/States/PlayingState';
import { EventBus } from '../Events/EventBus';
import { GameEvents } from '../Events/GameEvents';
import { UIEvents } from '../Events/UIEvents';
import { BulletController } from '../Bullet/BulletController';
import { LoadServices } from '../Save/LoadServices';
import { PlayerData } from '../Player/PlayerData';
import { LoadManager } from './LoadManager';
import { SpawnPlayerManager } from './SpawnPlayerManager';
import { LevelManager } from './LevelManager';
import { EnemyBulletController } from '../Enemy/EnemyBulletController';
import { SelectedSkillModel } from '../Model/SelectedSkillModel';
import { PlayerMove } from '../Player/PlayerMove';
import { AudioManager } from './AudioManager';
import { PauseUIPanel } from '../UIPanel/PauseUIPanel';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    // UI面板
    @property(Node) playingUI: Node = null
    @property(Node) menuUI: Node = null
    // 物体节点
    @property(Node) menuPanel: Node | null = null
    @property(Node) playingPanel: Node | null = null
    @property(Node) map: Node | null = null
    // 对象池相关节点
    @property(Node) bulletRoot: Node | null = null // 玩家子弹对象池节点
    @property(Node) EnemyRoot: Node | null = null // 敌人对象池
    @property(Node) playerRoot: Node = null //玩家对象
    @property(Node) enemyBulletRoot: Node = null // 敌人子弹对象池

    @property(AudioManager) audio: AudioManager = null
    private _mapMin: Vec3
    private _mapMax: Vec3
    // json传参预制体 
    private levelName: string
    private enemyPrefab: Prefab
    private Timer: number = 0
    private enemySpeed: number = 0
    private spawnRate: number = 0
    private levelMap: TiledMapAsset
    // 玩家主节点
    private player: Node = null
    private playerSpeed: number // 玩家速度
    private fireRate: number // 攻击速度
    private radius: number // 攻击范围
    private bulletName: string // 子弹名称
    private playerHp: number
    private playerspf: SpriteFrame

    private _playing = false // 游戏中
    private _spawnEnemyTimerID = -1
    private _countDownID = -1;
    private playerSpawner: SpawnPlayerManager
    private levelSpawner: LevelManager
    loadManager: LoadManager

    fsm = new StateMachine()
    bootState: BootState
    menuState: MenuState
    playingState: PlayingState
    playdata: PlayerData


    onLoad() {
        const saveService = new LoadServices()
        this.playdata = new PlayerData(saveService)
        this.bootState = new BootState(this)
        this.menuState = new MenuState(this)
        this.playingState = new PlayingState(this)
        this.loadManager = new LoadManager(this.playdata)

        this.playerSpawner = new SpawnPlayerManager(this.playerRoot, (p) => {
            this.player = p
        })

        this.levelSpawner = new LevelManager(
            this.EnemyRoot,
            () => this.player,
            () => this.map
        )
    }

    /** 初始化 */
    async init() {
        // 1) 调用 LoadManager 统一加载
        const result = await this.loadManager.loadAll();

        // 2) 写回 GameManager 运行时需要的数据
        this.levelName = result.levelName
        this.enemyPrefab = result.enemyPrefab;
        this.Timer = result.timer;
        this.enemySpeed = result.enemySpeed;
        this.spawnRate = result.spawnRate;
        this.levelMap = result.mapAsset

        this.playerSpeed = result.playerSpeed
        this.fireRate = result.fireRate
        this.radius = result.radius
        this.bulletName = result.bulletName
        this.playerHp = result.playerHP
        this.playerspf = result.playerSpf
        this.cacheMapBounds()


        // ✅ 生成玩家：交给 SpawnPlayerManager（不改 player / playerRoot 变量名）
        this.spawnPlayer(result.playerPrefab);

        // 3) UI 刷新
        PlayingUIPanel.getInstance().refreshTimerLabel(this.Timer, this.levelName);
        PlayingUIPanel.getInstance().refreshHPLabel(this.playerHp)
        PlayingUIPanel.getInstance().setHpTankSprite(this.playerspf, this.levelName)
    }

    protected start(): void {
        this.fsm.change(this.bootState)
    }

    protected onEnable(): void {
        EventBus.on(GameEvents.Flow.ToMenu, this.onToMenu, this)
        EventBus.on(GameEvents.Game.ReadyStart, this.onReadyStart, this)
        EventBus.on(UIEvents.Click.onHome, this.onClickHome, this)
        EventBus.on(UIEvents.Click.onNext, this.onClickNext, this)

        EventBus.on(UIEvents.Refresh.refreshHP, this.onRefreshHp, this)
        EventBus.on(GameEvents.Player.GetDamage, this.getDamage, this)

        EventBus.on(GameEvents.Death.PlayerDeath, this.onPlayerDeath, this)
        EventBus.on(UIEvents.Click.onResetGame, this.onResetGame, this)
        this.playdata.enable()
    }

    protected onDisable(): void {
        EventBus.off(GameEvents.Flow.ToMenu, this.onToMenu, this)
        EventBus.off(GameEvents.Game.ReadyStart, this.onReadyStart, this)
        EventBus.off(UIEvents.Click.onHome, this.onClickHome, this)
        EventBus.off(UIEvents.Click.onNext, this.onClickNext, this)

        EventBus.off(UIEvents.Refresh.refreshHP, this.onRefreshHp, this)
        EventBus.off(GameEvents.Player.GetDamage, this.getDamage, this)

        EventBus.off(GameEvents.Death.PlayerDeath, this.onPlayerDeath, this)
        EventBus.off(UIEvents.Click.onResetGame, this.onResetGame, this)

        this.playdata.disable()
    }
    /** 回到菜单 */
    async onToMenu() {
        this.fsm.change(this.menuState)
        await this.audio.init()
        this.audio.onBgm()
    }
    /**
     * 准备开始 and 下一关
     */
    async onReadyStart() {
        await this.init()
        this.fsm.change(this.playingState)
        this.spawnEnemy()
        PlayingUIPanel.getInstance().onShowTimer(true)
        this._playing = true
        PlayingUIPanel.getInstance().refreshTimerLabel(this.Timer, this.levelName)
        PlayingUIPanel.getInstance().showResult(false)
        this.playerCTRL(true)
        this.startCountDown()
        PlayingUIPanel.getInstance().setJoyStick(true)
    }
    /** 点击回到菜单 */
    onClickHome() {
        this.stopSpawnEnemy()
        this.despawnAll()
        this.fsm.change(this.menuState)
    }
    /** 点击前往下一关 */
    onClickNext() {
        this.playdata.onNext()
        this.stopSpawnEnemy()
        this.despawnAll()
        this.onReadyStart()
    }
    /** 玩家被打 */
    getDamage() {
        PlayingUIPanel.getInstance().onPlayerDamage()
    }
    /** 玩家死亡 */
    onPlayerDeath() {
        // 爆炸动画
        this.playerSpawner.setPlayer(false) // 关闭玩家显示
        this.audio.onPlayerBomb()
        const player = this.playerRoot.getComponent(PlayerMove)
        player.setCollider(false)
        player.onPlayerDeath()

        PlayingUIPanel.getInstance().showPause(true)
        this.stopSpawnEnemy()
        this.despawnAll()

        this._playing = false
        PlayingUIPanel.getInstance().onShowTimer(false)
        this.playerCTRL(false)
        PlayingUIPanel.getInstance().setJoyStick(false)
    }
    /** 重新开始 */
    onResetGame() {
        PlayingUIPanel.getInstance().showPause(false)
        this.onReadyStart()
    }
    protected update(dt: number): void {
        if (!this._playing) return
        TimerManager.update(dt)
    }

    /** 刷新UI显示 */
    refreshTimerUI(): boolean {
        this.Timer -= 1
        PlayingUIPanel.getInstance().refreshTimerLabel(this.Timer)

        if (this.Timer <= 0) {
            this.onTimered()
            return false
        }
        return true
    }

    /** 生成玩家 */
    spawnPlayer(playerPrefab?: Prefab) {
        // 允许 init() 传 prefab，也保留你原本的空方法名
        if (!playerPrefab) return
        this.playerSpawner.spawnPlayer(playerPrefab, this.player)
        this.playerRoot.getComponent(PlayerMove).setCollider(true)

    }

    /** 生成敌人 */
    spawnEnemy() {
        this._spawnEnemyTimerID = 1
        this.levelSpawner.startSpawn(
            this.levelMap,
            this.enemyPrefab,
            this.enemySpeed,
            this.spawnRate,
            () => this.getRandomPositionAroundRoot()
        )
    }

    /** 停止生成敌人 */
    private stopSpawnEnemy() {
        this.levelSpawner.stopSpawn()
        this.stopCountDown()
        this._spawnEnemyTimerID = -1
    }
    /** 开始倒计时 */
    private startCountDown() {
        // 防止重复开启
        this.stopCountDown();

        this._countDownID = TimerManager.loop(1, () => {
            // 每秒扣 1
            const canContinue = this.refreshTimerUI();
            if (!canContinue) {
                // refreshTimerUI 里会 onTimered，这里只负责停掉计时器
                this.stopCountDown();
            }
        });
    }

    private stopCountDown() {
        if (this._countDownID !== -1) {
            TimerManager.clear(this._countDownID);
            this._countDownID = -1;
        }
    }
    /**  倒计时结束 */
    onTimered() {
        // 根据随机生成技能按钮
        SelectedSkillModel.randomSkill()
        this.stopSpawnEnemy()
        this._playing = false
        PlayingUIPanel.getInstance().onShowTimer(false)
        this.playerCTRL(false)
        this.despawnAll()
        PlayingUIPanel.getInstance().showResult(true)
        PlayingUIPanel.getInstance().setJoyStick(false)
    }
    /** 玩家控制，，生成玩家 */
    playerCTRL(value: boolean) {
        this.playerSpawner.playerCtrl(this.player, value, this.playerSpeed, this.fireRate, this.radius, this.bulletName)
    }

    /** 销毁所有敌人 */
    private despawnAll() {
        // ✅ 敌人清理：交给 SpawnEnemyManager（只改生成相关部分）
        this.levelSpawner.despawnAllEnemies()
        // 子弹清理保持原样
        const bullets = this.bulletRoot.children.slice()
        for (const node of bullets) {
            const ctrl = node.getComponent(BulletController)
            if (ctrl) {
                ctrl.stopForHit()
                ctrl.destoryNode()
            } else {
                PoolManager.despawn("BulletGreenL", node)
            }
        }

        const enemyBullets = this.enemyBulletRoot.children.slice()
        for (const node of enemyBullets) {
            const ctrl = node.getComponent(EnemyBulletController)
            if (ctrl) {
                ctrl.stopForHit()
                ctrl.destoryNode()
            } else {
                PoolManager.despawn("EnemyBullet", node)
            }
        }
    }

    /** 刷新显示玩家血量 */
    onRefreshHp = (hp: number) => {
        PlayingUIPanel.getInstance().refreshHPLabel(hp)
    }

    /**
     * 根据地图边缘生成
     */
    /**
  * 根据地图边缘生成（带 margin，刷在地图外一圈）
  */
    private getRandomPositionAroundRoot(): Vec3 {
        const margin = 40; // 👈 敌人生成在地图外多远（按敌人体型/速度调）
        const side = Math.floor(math.randomRange(0, 4)); // 0~3
        let x = 0, y = 0;

        switch (side) {
            case 0: // 上边
                x = math.randomRange(
                    this._mapMin.x + margin,
                    this._mapMax.x - margin
                );
                y = this._mapMax.y + margin;
                break;

            case 1: // 下边
                x = math.randomRange(
                    this._mapMin.x + margin,
                    this._mapMax.x - margin
                );
                y = this._mapMin.y - margin;
                break;

            case 2: // 左边
                x = this._mapMin.x - margin;
                y = math.randomRange(
                    this._mapMin.y + margin,
                    this._mapMax.y - margin
                );
                break;

            case 3: // 右边
                x = this._mapMax.x + margin;
                y = math.randomRange(
                    this._mapMin.y + margin,
                    this._mapMax.y - margin
                );
                break;
        }

        return new Vec3(x, y, this._mapMin.z);
    }

    private cacheMapBounds() {
        const worldPos = this.map.worldPosition
        const uiTransform = this.map.getComponentInChildren(UITransform)

        const halfW = uiTransform.width / 2
        const halfH = uiTransform.height / 2

        this._mapMin = new Vec3(
            worldPos.x - halfW,
            worldPos.y - halfH,
            worldPos.z
        )

        this._mapMax = new Vec3(
            worldPos.x + halfW,
            worldPos.y + halfH,
            worldPos.z
        )
    }

    // 显示指定节点
    showPanel(menu: boolean, playing: boolean) {
        this.menuPanel.active = menu
        this.menuUI.active = menu

        this.playingPanel.active = playing
        this.playingUI.active = playing
    }

    /** 点击显示暂停页面 */
    onClickPause() {
        this.audio.onClick()
        director.pause()
        PlayingUIPanel.getInstance().setJoyStick(false)
        PauseUIPanel.getInstance().showPause(true)
    }
}

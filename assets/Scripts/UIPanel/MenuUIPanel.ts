import { _decorator, Button, Component, EventHandler, find, instantiate, Layout, Node, Prefab, Sprite, SpriteFrame, sys } from 'cc';
import { EventBus } from '../Events/EventBus';
import { UIEvents } from '../Events/UIEvents';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;
/**
 * 菜单UI
 */
@ccclass('MenuUIPanel')
export class MenuUIPanel extends Component {
    private static instance: MenuUIPanel
    public static getInstance(): MenuUIPanel {
        return MenuUIPanel.instance
    }
    /** 选择玩家和开始页面，载入游戏和开始游戏 */
    @property(Node) selectPlayer: Node = null
    @property(Node) startGame: Node = null
    /** 玩家按钮父节点、玩家按钮预制体 */
    @property(Layout) playerLayout: Layout = null
    @property(Prefab) playerBtn: Prefab = null // 人物按钮预制体

    private audio: AudioManager = null
    private buttons: Button[] = []

    protected onLoad(): void {
        if (MenuUIPanel.getInstance()) {
            return
        }
        if (MenuUIPanel.instance === this) MenuUIPanel.instance = null
        MenuUIPanel.instance = this
        this.showOrHide(true, false)
        this.audio = find('Canvas/Audio').getComponent(AudioManager)
    }
    /** 开始游戏 */
    onClickStart() {
        this.audio.onClick()
        EventBus.emit(UIEvents.Click.onStartGame)
        this.showOrHide(false, true)
    }
    /** 加载游戏 */
    onClickLoading() {
        this.audio.onClick()
        EventBus.emit(UIEvents.Click.onLoadGame)
        this.showOrHide(false, true)
    }
    /** 无尽模式 */
    onClickLoop() {
        this.audio.onClick()
        this.onClear()
    }
    onClear() {
        console.log("缓存已清除")
        this.audio.onClick()
        sys.localStorage.clear()
    }
    /** 选择人物 */
    onSelectedPlayer(event: Event, customEventData: string) {
        EventBus.emit(UIEvents.Selected.onSelectedPlayer, customEventData)
    }
    /** 显示隐藏节点 */
    showOrHide(game: boolean, player: boolean,) {
        this.selectPlayer.active = player
        this.startGame.active = game
    }
    /** 设置玩家按钮 */
    setPlayerBtn(num: number, value: string, spf: SpriteFrame) {
        const playerNode = instantiate(this.playerBtn)
        playerNode.setParent(this.playerLayout.node)
        playerNode.name = String(num)

        const clickEventHandler = new EventHandler()
        clickEventHandler.target = this.node
        clickEventHandler.component = "MenuUIPanel"
        clickEventHandler.handler = "onSelectedPlayer"
        clickEventHandler.customEventData = value

        const btn = playerNode.getComponent(Button)
        btn.clickEvents.push(clickEventHandler)
        this.buttons.push(btn)

        const sp = playerNode.getComponent(Sprite)
        sp.spriteFrame = spf
    }
}



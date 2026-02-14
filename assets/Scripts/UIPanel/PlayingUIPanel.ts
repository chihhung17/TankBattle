import { _decorator, Animation, Button, Component, EventHandler, find, instantiate, Label, Layout, Node, Prefab, Sprite, SpriteFrame } from 'cc';
import { EventBus } from '../Events/EventBus';
import { UIEvents } from '../Events/UIEvents';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;
/**
 * 游戏中UI
 */
@ccclass('PlayingUIPanel')
export class PlayingUIPanel extends Component {
    private static instance: PlayingUIPanel
    public static getInstance(): PlayingUIPanel {
        return PlayingUIPanel.instance
    }

    @property(Node) joystick: Node = null

    @property(Animation) anim: Animation = null

    @property(Label) timer: Label = null
    @property(Label) HP: Label = null
    @property(Sprite) hpSp: Sprite = null
    @property(Label) level: Label = null

    @property(Label) staticLevel: Label = null

    @property(Node) pause: Node = null
    @property(Node) resulet: Node = null
    @property(Prefab) skillBtn: Prefab = null
    @property(Layout) skillRoot: Layout = null

    private audio: AudioManager = null
    private buttons: Button[] = []
    protected onLoad(): void {
        if (PlayingUIPanel.getInstance()) {
            return
        }
        if (PlayingUIPanel.instance === this) PlayingUIPanel.instance = null
        PlayingUIPanel.instance = this

        this.audio = find('Canvas/Audio').getComponent(AudioManager)
        this.timer.node.active = true
        this.resulet.active = false
        this.pause.active = false
        this.level.node.active = true
    }
    protected start(): void {

    }
    /** 显示倒计时和关卡名称 */
    refreshTimerLabel(value: number, level?: string) {
        this.timer.string = `剩余时间: ${value} s`
        this.level.string = level
    }
    refreshHPLabel(value: number) {
        this.HP.string = `* ${value}`
    }
    /** 倒计时和关卡显示 */
    onShowTimer(value: boolean) {
        this.timer.node.active = value
        this.level.node.active = value
    }
    /** 结果节点 */
    showResult(value: boolean) {
        this.resulet.active = value
        if (value) this.resulet.setSiblingIndex(this.resulet.parent.children.length - 1);
    }
    /** 暂停菜单 */
    showPause(value: boolean) {
        this.pause.active = value
        if (value) this.pause.setSiblingIndex(this.pause.parent.children.length - 1);
    }
    onClickHome() {
        this.audio.onClick()
        EventBus.emit(UIEvents.Click.onHome)
        this.showPause(false)
    }
    /** 设置血量旁的坦克图标 */
    setHpTankSprite(value: SpriteFrame, level: string) {
        this.hpSp.spriteFrame = value
        this.staticLevel.string = level
    }
    /** 
     * 开启下一关
     */
    onClickNext() {
        this.audio.onClick()
        EventBus.emit(UIEvents.Click.onNext)
    }
    /**点击选择技能按钮 */
    onGetSkill(event: Event, customEventData: string) {
        this.audio.onClick()

        EventBus.emit(UIEvents.Click.onGetSkill, customEventData)
    }

    /** 点击重新开始 */
    onClickReset() {
        this.audio.onClick()
        EventBus.emit(UIEvents.Click.onResetGame)
    }

    onPlayerDamage() {
        this.anim.play()
    }

    /**
     * 设置技能按钮
     * @param id 技能id
     * @param tips 简介
     * @param add 属性增加值
     */
    setSkillBtn(id: number, tips: string, add: number) {
        const node = instantiate(this.skillBtn)
        node.name = String(id)
        node.getComponentInChildren(Label).string = `${tips}\n +${add}`
        node.setParent(this.skillRoot.node)
        // 点击事件
        const clickEventHandler = new EventHandler()
        clickEventHandler.target = this.node
        clickEventHandler.component = "PlayingUIPanel"
        clickEventHandler.handler = "onGetSkill"
        clickEventHandler.customEventData = String(id)

        const btn = node.getComponent(Button)
        btn.clickEvents.push(clickEventHandler)
        this.buttons.push(btn)
    }
    /** 清除生成的按钮 */
    clearLayout() {
        const nodes = this.skillRoot.node.children
        if (nodes) {
            for (const node of nodes) {
                node.destroy()
            }
        }
    }
    /** 设置摇杆隐藏显示 */
    setJoyStick(value: boolean) {
        this.joystick.active = value
    }



}



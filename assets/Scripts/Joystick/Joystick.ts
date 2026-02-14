import { _decorator, Component, EventTouch, Node, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 摇杆封装
 */
@ccclass('Joystick')
export class Joystick extends Component {

    @property(Node)
    bg: Node = null
    @property(Node)
    handle: Node = null

    //触碰获取的id
    private _touchId: number | null = null
    private _uiTransform: UITransform = null

    //最大移动范围像素
    @property
    radius: number = 80
    //死区
    @property
    deadArea: number = 5
    //当前摇杆方向
    private _dir: Vec2 = new Vec2()
    //触摸起点（世界坐标
    private _touchStart: Vec2 = new Vec2()
    // 使用touchLayer来作为触碰层
    protected onLoad(): void {
        this._uiTransform = this.node.getComponent(UITransform)
        const touchLayer = this.node.parent.getChildByName('TouchLayer')
        touchLayer.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        touchLayer.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        touchLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
        touchLayer.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)
    }

    /**
     * 返回当前摇杆方向
     * 防止外部修改，提供克隆向量
     */
    get direction(): Vec2 {
        return this._dir.clone()
    }

    private onTouchStart(event: EventTouch) {
        if (this._touchId !== null) return
        this._touchId = event.getID()
        //获取触摸位置
        const uiPos = event.getUILocation()
        const localPos = new Vec3()
        this._uiTransform.convertToNodeSpaceAR(
            new Vec3(uiPos.x, uiPos.y, 0),
            localPos
        )

        this._touchStart.set(localPos.x, localPos.y)
        //摇杆显示在触摸点
        this.bg.setPosition(localPos)
        this.handle.setPosition(Vec3.ZERO)
    }
    private onTouchMove(event: EventTouch) {
        if (event.getID() !== this._touchId) return
        const uiPos = event.getUILocation()
        const localPos = new Vec3()
        this._uiTransform.convertToNodeSpaceAR(
            new Vec3(uiPos.x, uiPos.y, 0),
            localPos
        )
        //偏移量，移动的减去初始的触摸位置
        const delta = new Vec2(
            localPos.x - this._touchStart.x,
            localPos.y - this._touchStart.y
        )
        //限制最大半径，multiplyScalar返回更改后的自身值
        if (delta.length() > this.radius) {
            delta.normalize().multiplyScalar(this.radius)
        }
        if (delta.length() < this.deadArea) {
            this._dir.set(0, 0);
            this.handle.setPosition(Vec3.ZERO)
            return;
        }
        //设置handle位置
        this.handle.setPosition(delta.x, delta.y, 0)//相对位置
        this._dir.set(delta.x / this.radius, delta.y / this.radius)
    }
    private onTouchEnd(event: EventTouch) {
        if (event.getID() !== this._touchId) return
        this._touchId = null
        this.handle.setPosition(Vec3.ZERO)//相对位置
        this._dir.set(0, 0)
    }
}



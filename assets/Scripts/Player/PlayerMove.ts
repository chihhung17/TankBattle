import { _decorator, Animation, Camera, Collider2D, Component, Contact2DType, director, Node, UITransform, Vec3 } from 'cc';
import { Joystick } from '../Joystick/Joystick';
import { RigidBody2D, Vec2 } from 'cc';

import { EventBus } from '../Events/EventBus';
import { GameEvents } from '../Events/GameEvents';
const { ccclass, property } = _decorator;

/**
 * 玩家移动（刚体 + 惯性）
 */
@ccclass('PlayerMove')
export class PlayerMove extends Component {
    private moveSpeed: number = 5;

    @property(Camera)
    mainCamera: Camera | null = null

    @property(Joystick)
    joystick: Joystick = null;

    @property(Animation) anima: Animation = null

    // ✅ 新增：把你的 map 节点拖进来（就是你 cacheMapBounds 用的那个 map）
    @property(Node)
    map: Node | null = null

    @property({ tooltip: "图片初始朝向修正，朝右为0，朝上为90" })
    angleOffset: number = 90;



    private _viewMin: Vec3 = new Vec3();
    private _viewMax: Vec3 = new Vec3();

    // ✅ 新增：地图边界（和你敌人生成用的一样）
    private _mapMin: Vec3 = new Vec3();
    private _mapMax: Vec3 = new Vec3();

    private _rb: RigidBody2D = null;
    private _vel: Vec2 = new Vec2();
    private collider: Collider2D
    private move: boolean = true


    protected onLoad(): void {
        this._rb = this.getComponent(RigidBody2D);
        this.collider = this.getComponent(Collider2D)
        if (!this._rb) return;
        this._rb.fixedRotation = true;
        this._rb.linearDamping = 6;

        // ✅ 初始化时缓存一次地图边界（地图不会变的话够用）
        this.cacheMapBounds()
    }

    protected update(dt: number): void {
        this.playerMove(dt, this.moveSpeed);
    }
    /** playerdeath */
    onPlayerDeath() {
        this.anima.play()
    }
    playerMove(dt: number, speed: number) {
        if (director.isPaused()) return;
        if (!this.joystick) return;
        if (!this._rb) return;
        if (!this.move) return;

        // ✅ 如果地图可能缩放/动态变化，你可以每帧更新一次（不想每帧算就注释掉）
        // this.cacheMapBounds()

        const dir = this.joystick.direction;

        // 没有输入时停下
        if (dir.length() === 0) {
            this._vel.set(0, 0);
            this._rb.linearVelocity = this._vel;
            return;
        }

        // 朝向
        const radian = Math.atan2(dir.y, dir.x);
        let anlge = radian * 180 / Math.PI;
        this.node.angle = anlge - this.angleOffset;

        // 目标速度（每秒）
        const desiredVx = dir.x * speed;
        const desiredVy = dir.y * speed;

        // 当前世界坐标
        const curr = this.node.worldPosition;

        // 预测下一帧世界坐标
        const predicted = new Vec3(
            curr.x + desiredVx * dt,
            curr.y + desiredVy * dt,
            curr.z
        );

        // ✅ clamp 到地图范围（UITransform 矩形内）
        const result = this.clampToMapBounds(predicted);

        // 如果撞边，把对应轴速度置 0
        this._vel.set(
            result.hitX ? 0 : desiredVx,
            result.hitY ? 0 : desiredVy
        );

        this._rb.linearVelocity = this._vel;

        // 若越界，夹回去（世界坐标）
        if (result.hitX || result.hitY) {
            this.node.setWorldPosition(result.pos);
        }
    }

    protected onEnable(): void {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onContact, this)
        this.collider.on(Contact2DType.END_CONTACT, this.onEnd, this)
    }
    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onContact, this)
        this.collider.off(Contact2DType.END_CONTACT, this.onEnd, this)
    }
    onContact(self: Collider2D, other: Collider2D) {
        EventBus.emit(GameEvents.Player.GetDamage)
    }
    onEnd(self: Collider2D, other: Collider2D) { }

    /** 运动限制 */
    canMove(value: boolean) {
        this.move = value
    }
    setSpeed(value: number) {
        this.moveSpeed = value
    }

    setCollider(value: boolean) {
        if (this.collider) this.collider.enabled = value
    }
    // ✅ 复用你现在敌人生成同款：用 UITransform 计算地图 world 边界
    private cacheMapBounds() {
        if (!this.map) return;

        const worldPos = this.map.worldPosition;
        const uiTransform = this.map.getComponentInChildren(UITransform);
        if (!uiTransform) return;

        const halfW = uiTransform.width / 2;
        const halfH = uiTransform.height / 2;

        this._mapMin.set(worldPos.x - halfW, worldPos.y - halfH, worldPos.z);
        this._mapMax.set(worldPos.x + halfW, worldPos.y + halfH, worldPos.z);
    }

    // ✅ 新增：玩家位置 clamp 到地图矩形内
    private clampToMapBounds(pos: Vec3): { pos: Vec3; hitX: boolean; hitY: boolean } {
        // 你按玩家大小调，防止半个身体出界
        const margin = 60;

        const minX = this._mapMin.x + margin;
        const maxX = this._mapMax.x - margin;
        const minY = this._mapMin.y + margin;
        const maxY = this._mapMax.y - margin;

        const clampedX = Math.max(minX, Math.min(maxX, pos.x));
        const clampedY = Math.max(minY, Math.min(maxY, pos.y));

        return {
            pos: new Vec3(clampedX, clampedY, pos.z),
            hitX: clampedX !== pos.x,
            hitY: clampedY !== pos.y
        };
    }
}

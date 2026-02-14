import { _decorator, Collider2D, Quat, RigidBody2D, Vec2, Vec3 } from 'cc';
import { PoolableBase } from '../Pool/PoolableBase';
import { TimerManager } from '../Tools/TimerManager';
import { PoolManager } from '../Pool/PoolManager';
import { BulletAnimation } from '../Animation/BulletAnimation';
const { ccclass, property } = _decorator;
/**
 * 子弹控制
 */
@ccclass('BulletController')
export class BulletController extends PoolableBase {

    private _dir = new Vec3(0, 1, 0)
    private _speed = 0
    private _timerId = -1
    private _poolKey = "BulletGreenL"
    private _rb: RigidBody2D | null = null
    private _vel = new Vec2();

    /** 生成节点 */
    override onSpawn(): void {
        super.onSpawn()
        this._clearTimer()
        this._speed = 0
        this._dir.set(0, 1, 0)


        const anim = this.getComponent(BulletAnimation)
        if (anim) anim.resetForSpawn()

        const collider = this.getComponent(Collider2D)
        if (collider) {
            collider.enabled = true
        }

        this._rb = this.getComponent(RigidBody2D)
        if (this._rb) {
            this._rb.enabled = true
            this._rb.linearVelocity = Vec2.ZERO
            this._rb.angularVelocity = 0
            this._rb.wakeUp()
        }

    }
    /** 回收节点 */
    override onDespawn(): void {
        this._clearTimer()
        this._speed = 0
        if (this._rb) {
            this._rb.linearVelocity = Vec2.ZERO
            this._rb.angularVelocity = 0
        }
        super.onDespawn()
    }

    /**
     * 子弹发射代码
     * @param dir 子弹运行方向
     * @param speed 子弹速度
     * @param maxLife 子弹生命
     */
    fire(dir: Vec3, speed: number, maxLife: number) {
        this._dir.set(dir).normalize();
        this._speed = speed
        const q = new Quat();
        Quat.rotationTo(q, Vec3.UP, this._dir);
        this.node.setWorldRotation(q);

        if (this._rb) {
            this._rb.linearVelocity = new Vec2(this._dir.x * this._speed, this._dir.y * this._speed)
            this._rb.angularVelocity = 0
            this._rb.wakeUp()
        }

        this._timerId = TimerManager.once(maxLife, () => {
            PoolManager.despawn(this._poolKey, this.node)
        })
    }

    protected update(dt: number): void {
        if (this._speed <= 0 || !this._rb) return;

        this._vel.set(this._dir.x * this._speed, this._dir.y * this._speed);
        this._rb.linearVelocity = this._vel;
        this._rb.wakeUp();
    }

    // 清理定时器
    private _clearTimer() {
        if (this._timerId !== -1) {
            TimerManager.clear(this._timerId)
            this._timerId = -1
        }
    }

    /** 命中后停止移动，并取消寿命回收 */
    public stopForHit(): void {
        this._speed = 0        // 停止 update 里的兜底逻辑
        this._clearTimer()     // 取消寿命定时器，避免动画没播完就被回收

        // ✅ 同时停止刚体速度
        if (this._rb) {
            this._rb.linearVelocity = Vec2.ZERO
            this._rb.angularVelocity = 0
        }
    }

    destoryNode() {
        PoolManager.despawn(this._poolKey, this.node)
    }

}

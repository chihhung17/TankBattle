import { _decorator, Collider2D, Node, RigidBody2D, Vec2, Vec3 } from 'cc';
import { PoolableBase } from '../Pool/PoolableBase';
import { PoolManager } from '../Pool/PoolManager';
import { TimerManager } from '../Tools/TimerManager';
import { TankAnimation } from '../Animation/TankAnimation';
import { FirePointAnimation } from '../Animation/FirePointAnimation';
import { EnemyGunAttack } from './EnemyGunAttack';
const { ccclass, property } = _decorator;
/**
 * 敌人控制器
 */
@ccclass('EnemyController')
export class EnemyController extends PoolableBase {

    private _speed: number = 100
    private _dir = new Vec3(0, 1, 0)
    private _poolKey = "Enemy"
    private _target: Node | null = null // 跟踪对象
    private _rb: RigidBody2D | null = null
    private _timerId = -1
    @property
    radius: number = 200 // 暂停运动半径

    override onSpawn(): void {
        super.onSpawn()
        this._speed = 0
        this._dir.set(0, 1, 0)
        this._rb = this.getComponent(RigidBody2D)
        const cols = this.getComponent(Collider2D);
        cols.enabled = true;

        const gunCtrl = this.getComponentInChildren(EnemyGunAttack)
        gunCtrl.canFire(true)

        const anim = this.getComponentInChildren(TankAnimation)
        const pointAnim = this.getComponentInChildren(FirePointAnimation)
        if (anim) anim.resetForSpawn()
        if (pointAnim) pointAnim.resetForSpawn()

        if (this._rb) {
            this._rb.enabled = true
            this._rb.linearVelocity = Vec2.ZERO
            this._rb.angularVelocity = 0
            this._rb.wakeUp()
        }
    }
    override onDespawn(): void {
        this._speed = 0
        if (this._rb) {
            this._rb.linearVelocity = Vec2.ZERO
            this._rb.angularVelocity = 0
        }
        super.onDespawn()
    }
    // 通过刚体来控制移动
    protected update(dt: number): void {
        if (this._speed <= 0) return
        if (!this._target || !this._target.active) return
        if (!this._rb) return
        // 敌人-》玩家的方向
        const dx = this._target.worldPosition.x - this.node.worldPosition.x
        const dy = this._target.worldPosition.y - this.node.worldPosition.y

        const len = Math.hypot(dx, dy)
        if (len < 0.001) {
            this._rb.linearVelocity = Vec2.ZERO
            return
        }
        // 当距离小于等于指定半径,跟随方向转动，但是不移动
        if (len <= this.radius) {
            const dirToTarget = new Vec2(dx / len, dy / len)
            const rad = Math.atan2(dirToTarget.y, dirToTarget.x)
            const deg = rad * 180 / Math.PI - 90
            this.node.angle = deg
            return
        }
        const dirToTarget = new Vec2(dx / len, dy / len)
        // 位移
        const v = new Vec2(dirToTarget.x * this._speed, dirToTarget.y * this._speed)
        this._rb.linearVelocity = v

        // 对准方向
        const rad = Math.atan2(dirToTarget.y, dirToTarget.x)
        const deg = rad * 180 / Math.PI - 90
        this.node.angle = deg

        this._rb.wakeUp()
    }

    /**
     * 敌人跟踪设置
     * @param speed 速度
     * @param target 目标（player）
     */
    move(speed: number, target: Node) {
        this._target = target
        this._speed = speed
    }

    /** 回收敌人节点 死亡调用 */
    destoryNode() {
        PoolManager.despawn(this._poolKey, this.node)
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
        // this._clearTimer()     // 取消寿命定时器，避免动画没播完就被回收

        // ✅ 同时停止刚体速度
        if (this._rb) {
            this._rb.linearVelocity = Vec2.ZERO
            this._rb.angularVelocity = 0
        }
    }
}



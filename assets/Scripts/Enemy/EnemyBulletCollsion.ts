import { _decorator, Collider2D, Component, Contact2DType } from 'cc';
import { TimerManager } from '../Tools/TimerManager';
import { BulletAnimation } from '../Animation/BulletAnimation';
import { PoolManager } from '../Pool/PoolManager';
import { EnemyBulletController } from './EnemyBulletController';
import { PhysicsCollisionGroup } from '../Tools/PhysicsCollisionGroup';
const { ccclass } = _decorator;
/**
 * 敌人子弹碰撞
 */
@ccclass('EnemyBulletCollsion')
export class EnemyBulletCollsion extends Component {
    private collider: Collider2D
    private _poolKey = "EnemyBullet"
    private _timerId = -1
    private _hasHit = false // 防止多次碰撞

    protected onLoad(): void {
        this.collider = this.getComponent(Collider2D)
    }

    protected onEnable(): void {
        this._hasHit = false
        if (this.collider) {
            this.collider.enabled = true
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this)
        }
    }
    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this)
        if (this._timerId !== -1) {
            TimerManager.clear(this._timerId)
            this._timerId = -1
        }
        this._hasHit = false
    }
    onCollision(self: Collider2D, other: Collider2D) {

        if (other.group !== PhysicsCollisionGroup.player &&
            other.group !== PhysicsCollisionGroup.playerbullet) {
            return
        }
        if (this._hasHit) return
        this._hasHit = true
        if (this.collider) this.collider.enabled = false
        const bullet = this.getComponent(EnemyBulletController)
        if (bullet) bullet.stopForHit?.()
        if (this._timerId !== -1) {
            TimerManager.clear(this._timerId)
            this._timerId = -1
        }
        this._timerId = TimerManager.once(0, () => {
            const anima = this.getComponent(BulletAnimation)
            anima.playBoom(() => {

                PoolManager.despawn(this._poolKey, this.node);
            })
        })
    }
}



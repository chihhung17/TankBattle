import { _decorator, Collider2D, Component, Contact2DType, find } from 'cc';
import { PoolManager } from '../Pool/PoolManager';
import { BulletAnimation } from '../Animation/BulletAnimation';
import { BulletController } from './BulletController';
import { TimerManager } from '../Tools/TimerManager';
import { PhysicsCollisionGroup } from '../Tools/PhysicsCollisionGroup';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;
/**
 * 子弹碰撞
 */
@ccclass('BulletCollision')
export class BulletCollision extends Component {
    private collider: Collider2D
    private _poolKey = "BulletGreenL"
    private _timerId = -1
    private _hasHit = false // 防止多次碰撞

    private audio: AudioManager = null
    protected onLoad(): void {
        this.collider = this.getComponent(Collider2D)
        this.audio = find('Canvas/Audio').getComponent(AudioManager)
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
        if (other.group !== PhysicsCollisionGroup.enemy &&
            other.group !== PhysicsCollisionGroup.EnemyBullet) {
            return
        }
        if (this._hasHit) return
        this._hasHit = true
        if (this.collider) this.collider.enabled = false
        this.audio.onEnemyBomb()
        const bullet = this.getComponent(BulletController)
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



import { _decorator, Collider2D, Component, Contact2DType } from 'cc';
import { PhysicsCollisionGroup } from '../Tools/PhysicsCollisionGroup';
import { TimerManager } from '../Tools/TimerManager';
import { TankAnimation } from '../Animation/TankAnimation';
import { PoolManager } from '../Pool/PoolManager';
import { EnemyController } from './EnemyController';
const { ccclass, property } = _decorator;
/**
 * 敌人（小黑坦克）碰撞脚本
 */
@ccclass('EnemySDarkCollision')
export class EnemySDarkCollision extends Component {
    @property(Collider2D)
    collider: Collider2D = null
    @property(TankAnimation)
    anima: TankAnimation = null

    private _timerId = -1
    private _poolKey = "Enemy"

    private _hasHit = false // 防止多次碰撞

    protected onEnable(): void {
        this._hasHit = false
        if (this.collider) {
            this.collider.enabled = true
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onContact, this)
        }
    }
    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onContact, this)
        if (this._timerId !== -1) {
            TimerManager.clear(this._timerId)
            this._timerId = -1
        }
        this._hasHit = false
    }

    onContact(self: Collider2D, other: Collider2D) {
        // ✅ 不是玩家子弹就直接忽略（千万别在这里关 collider）
        if (other.group !== PhysicsCollisionGroup.playerbullet) {
            return
        }
        if (this._hasHit) return
        this._hasHit = true
        // 关闭碰撞用于动画
        if (this.collider) this.collider.enabled = false
        const enemtCtrl = this.getComponent(EnemyController)
        if (other.group === PhysicsCollisionGroup.playerbullet) {
            enemtCtrl.stopForHit()
            if (this._timerId !== -1) {
                TimerManager.clear(this._timerId)
                this._timerId = -1
            }
            this._timerId = TimerManager.once(0, () => {
                this.anima.playBomb(() => {
                    PoolManager.despawn(this._poolKey, this.node)
                })
            })
        }
    }


}



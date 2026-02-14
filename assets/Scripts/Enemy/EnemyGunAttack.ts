import { _decorator, Component, find, Node, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../Pool/PoolManager';
import { FirePointAnimation } from '../Animation/FirePointAnimation';
import { EnemyBulletController } from './EnemyBulletController';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;
/**
 * 敌人自动攻击脚本
 */
@ccclass('EnemyGunAttack')
export class EnemyGunAttack extends Component {

    @property({ tooltip: '检测半径 ' })
    radius: number = 200;

    private _playerRoot: Node = null

    @property({ tooltip: '枪口节点 ', type: Node })
    muzzle: Node | null = null;

    // ✅ 新增：发射频率（发/秒）。例如 5 = 每秒5发
    @property({ tooltip: '发射频率（发/秒）。0=不发射' })
    fireRate: number = 5;

    @property(FirePointAnimation)
    fireAnima: FirePointAnimation = null

    @property(Node) firePoint: Node | null = null // 发射点
    private enemyBulletRoot: Node | null = null // 子弹对象池节点

    @property(Prefab)
    enemyBulletPrefab: Prefab = null //

    // ✅ 新增：开火冷却计时
    private _fireCd = 0;
    private fire: boolean = true

    private audio: AudioManager = null

    onLoad() {
        this._playerRoot = find("Canvas/PlayingPanel/Player")
        this.audio = find('Canvas/Audio').getComponent(AudioManager)
        this.enemyBulletRoot = find("Canvas/PlayingPanel/enemyBulletRoot")
    }

    update(dt: number) {
        if (!this._playerRoot || !this._playerRoot.isValid || !this._playerRoot.activeInHierarchy) return;
        if (!this.enemyBulletPrefab || !this.enemyBulletRoot || !this.firePoint || !this.fireAnima) return;
        if (!this.fire) return

        // ✅ 半径检测
        const a = this.node.worldPosition;
        const b = this._playerRoot.worldPosition;
        const dx = b.x - a.x;
        const dy = b.y - a.y;

        if (dx * dx + dy * dy > this.radius * this.radius) {
            return; // 不在检测半径内，不发射
        }

        // ✅ 在半径内 → 按 fireRate 自动发射
        this._fireCd -= dt;
        if (this.fireRate > 0 && this._fireCd <= 0) {
            const intervalSec = 1 / this.fireRate;
            this._fireCd += intervalSec;
            this._fireToTarget();
        }
    }

    /** 发射 */
    private _fireToTarget() {
        this.fireAnima.playFire()
        const node = PoolManager.spawn('EnemyBullet', this.enemyBulletPrefab!, this.enemyBulletRoot!)
        node.setWorldPosition(this.firePoint!.worldPosition)
        const bullet = node.getComponent(EnemyBulletController)
        if (!bullet) {
            throw new Error('[GameManager] 敌人子弹没有控制脚本.');
        }
        // 设定子弹飞行方向
        const dir = new Vec3();
        Vec3.transformQuat(dir, new Vec3(0, 1, 0), this.firePoint!.worldRotation);
        bullet.fire(dir, 6.5, 1); // 子弹速度
        this.audio.onEnemyShoot()
    }
    public canFire(value: boolean) {
        this.fire = value
    }
}



import { _decorator, Component, find, Node, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../Pool/PoolManager';
import { FirePointAnimation } from '../Animation/FirePointAnimation';
import { BulletController } from '../Bullet/BulletController';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;

/**
 * 自动瞄准
 */
@ccclass('GunBarrelLockByCircleNoCollider')
export class GunBarrelLockByCircleNoCollider extends Component {
  /** 编辑器传参 */
  @property({ tooltip: '贴图朝向修正：默认朝右=0，默认朝上=90' })
  angleOffset: number = 0;
  @property({ tooltip: '每隔多少帧扫描一次 ' })
  scanIntervalFrames: number = 3;
  @property({ tooltip: '目标切换阈值：新目标要比旧目标近多少(比例)才切。0.15=近15%才切' })
  switchHysteresis: number = 0.15;
  @property({ tooltip: '枪口节点 ', type: Node }) muzzle: Node | null = null;
  @property(Node) firePoint: Node | null = null // 发射点
  @property(FirePointAnimation) fireAnima: FirePointAnimation = null

  // 外界传入
  private radius: number = 300;
  private fireRate: number = 2;
  @property(Prefab) bulletPrefab: Prefab | null = null
  private bulletName: string = "BulletGreenL"

  private bulletRoot: Node = null
  private enemyRoot: Node = null
  private bulletSpeed: number = 20

  private _originWorldZ = 0;
  private _frameCount = 0;

  private _locked: Node | null = null;
  private _lockedD2 = Number.POSITIVE_INFINITY;

  private fire: boolean = true


  private audio: AudioManager = null
  // ✅ 新增：开火冷却计时
  private _fireCd = 0;

  onLoad() {
    this._originWorldZ = this.node.eulerAngles.z;
  }
  protected start(): void {
    this.enemyRoot = find("Canvas/PlayingPanel/EnemyRoot")
    this.bulletRoot = find("Canvas/PlayingPanel/BulletRoot")
    this.audio = find('Canvas/Audio').getComponent(AudioManager)
  }

  update(dt: number) {
    this._frameCount++;
    if (!this.fire) return

    // 1) 隔帧扫描更新锁定
    const interval = Math.max(1, this.scanIntervalFrames);
    if (this._frameCount % interval === 0) {
      this._updateLockTarget();
    }

    // 2) 朝向/回正（瞬间）
    if (this._locked && this._locked.isValid && this._locked.activeInHierarchy) {
      this._aimInstantToTarget(this._locked);

      // ✅ 3) 只要锁定到敌人，就按 fireRate 持续发射
      this._fireCd -= dt;
      if (this.fireRate > 0 && this._fireCd <= 0) {
        const intervalSec = 1 / this.fireRate;
        this._fireCd += intervalSec; // 用 += 抗抖（避免 dt 大导致丢频率）

        this._fireToTarget(this._locked);
      }
    } else {
      // 没目标：清锁 + 回正 + 重置冷却（可选：避免刚锁到立刻补发多次）
      this._clearLock();
      this._returnInstantToOrigin();
      this._fireCd = 0;
    }
  }

  private _clearLock() {
    this._locked = null;
    this._lockedD2 = Number.POSITIVE_INFINITY;
  }

  /** 更新锁定目标：半径内最近 + 滞回防抖 */
  private _updateLockTarget() {
    if (!this.enemyRoot) {
      this._clearLock();
      return;
    }

    const myPos = this.node.worldPosition;
    const r2 = this.radius * this.radius;

    let best: Node | null = null;
    let bestD2 = Number.POSITIVE_INFINITY;

    const enemies = this.enemyRoot.children;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e || !e.isValid || !e.activeInHierarchy) continue;

      const p = e.worldPosition;
      const dx = p.x - myPos.x;
      const dy = p.y - myPos.y;
      const d2 = dx * dx + dy * dy;

      if (d2 <= r2 && d2 < bestD2) {
        bestD2 = d2;
        best = e;
      }
    }

    if (!best) {
      this._clearLock();
      return;
    }

    // ✅ 滞回：新目标必须明显更近才切换
    if (this._locked && this._locked.isValid) {
      const needBetter = this._lockedD2 * (1 - this.switchHysteresis);
      if (best !== this._locked && bestD2 > needBetter) {
        return;
      }
    }

    this._locked = best;
    this._lockedD2 = bestD2;
  }

  /** 发射 */
  private _fireToTarget(target: Node) {
    this.fireAnima.playFire()
    const node = PoolManager.spawn(this.bulletName, this.bulletPrefab!, this.bulletRoot!)
    node.setWorldPosition(this.firePoint!.worldPosition)
    const bullet = node.getComponent(BulletController)
    if (!bullet) {
      throw new Error('[GunBarrelLockByCircleNoCollider] 子弹没有控制脚本.');
    }
    // 设定子弹飞行方向
    const dir = new Vec3();
    Vec3.transformQuat(dir, new Vec3(0, 1, 0), this.firePoint!.worldRotation);
    bullet.fire(dir, this.bulletSpeed, 1);
    this.audio.onShoot()
  }

  /** 枪管瞬间朝向目标  */
  private _aimInstantToTarget(target: Node) {
    const a = this.node.worldPosition;
    const b = target.worldPosition;

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const desiredWorldZ = (Math.atan2(dy, dx) * 180) / Math.PI - this.angleOffset;
    this.node.setWorldRotationFromEuler(0, 0, desiredWorldZ);
  }

  private _returnInstantToOrigin() {
    this.node.setWorldRotationFromEuler(0, 0, this._originWorldZ);
  }

  /** 可以射击 */
  public canFire(value: boolean) {
    this.fire = value
  }
  /** 初始化，选定人物后传参 */
  init(radius: number, fireRate: number, bulletName: string) {
    this.setRadius(radius)
    this.setFireRate(fireRate)
    this.setBulletName(bulletName)
  }
  /** 设置攻击半径 */
  public setRadius(value: number) {
    this.radius = value
  }
  /** 设置攻击频率 */
  public setFireRate(value: number) {
    this.fireRate = value
  }
  public setBulletName(value: string) {
    this.bulletName = value
  }
  public setBulletSpeed(value: number) {
    this.bulletSpeed = value
  }
}

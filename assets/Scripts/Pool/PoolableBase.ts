import { _decorator, Animation, AudioSource, Collider2D, Component, Node, ParticleSystem2D, RigidBody2D, Tween } from 'cc';
import { IPool } from './IPool';
const { ccclass } = _decorator;
/**
 * 通用处理 停止特效等
 */
@ccclass('PoolableBase')
export class PoolableBase extends Component implements IPool {
    // 生成
    onSpawn(): void {
        Tween.stopAllByTarget(this.node)
        this.unscheduleAllCallbacks()
        this.node.active = true

        this._stopAllParticales(this.node)
        this._stopAllAnimations(this.node)
        this._stopAllAudio(this.node)

        // ✅ 统一恢复碰撞与刚体（对象池复用的关键）
        const cols = this.node.getComponentsInChildren(Collider2D);
        for (const c of cols) c.enabled = true;

        const rbs = this.node.getComponentsInChildren(RigidBody2D);
        for (const rb of rbs) rb.enabled = true;
    }
    // 回收
    onDespawn(): void {
        Tween.stopAllByTarget(this.node)
        this.unscheduleAllCallbacks()

        this._stopAllParticales(this.node)
        this._stopAllAnimations(this.node)
        this._stopAllAudio(this.node)
        this.node.active = false
    }
    // 停止所有粒子、动画、音频
    private _stopAllParticales(root: Node) {
        if (!root || !root.isValid) return
        if (!ParticleSystem2D) return
        const ps = root.getComponentsInChildren(ParticleSystem2D)
        for (const p of ps) {
            p.stopSystem()
        }
    }
    private _stopAllAnimations(root: Node) {
        if (!root || !root.isValid) return
        const anim = root.getComponent(Animation)
        if (anim) {
            anim.stop()
        }
        const animas = root.getComponentsInChildren(Animation)
        for (const a of animas) {
            a.stop()
        }
    }
    private _stopAllAudio(root: Node) {
        if (!root || !root.isValid) return
        const audio = root.getComponent(AudioSource)
        if (audio) audio.stop()
        const audios = root.getComponentsInChildren(AudioSource)
        for (const a of audios) {
            a.stop()
        }
    }
}
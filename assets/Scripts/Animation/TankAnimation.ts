import { _decorator, Animation, AnimationClip, Component } from 'cc';
const { ccclass, property } = _decorator;
/**
 *  坦克爆炸动画 通用
 */
@ccclass('TankAnimation')
export class TankAnimation extends Component {
    @property(Animation)
    anima: Animation = null
    @property(AnimationClip)
    idle: AnimationClip = null

    private _tankBomb = "EnemyBomb"

    public resetForSpawn() {
        if (!this.anima) return
        this.anima.stop()
        if (this.anima.getState(this.idle.name)) {
            this.anima.play(this.idle.name)
        }
    }

    public Bomb() {
        this.anima.play(this._tankBomb)
    }
    public playBomb(onFinished?: () => void) {
        if (!this.anima) {
            onFinished?.()
            return
        }
        this.anima.stop()
        if (!onFinished) {
            this.anima.play(this._tankBomb)
            return
        }
        const handler = () => {
            this.anima?.off(Animation.EventType.FINISHED, handler)
            onFinished()
        }
        this.anima.on(Animation.EventType.FINISHED, handler)
        this.anima.play(this._tankBomb)
    }



}



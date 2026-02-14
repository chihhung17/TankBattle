import { _decorator, Component, Animation, AnimationClip } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 子弹动画，通用，爆炸动画、飞行动画
 */
@ccclass('BulletAnimation')
export class BulletAnimation extends Component {
    @property(Animation)
    anim: Animation | null = null;
    @property(AnimationClip)
    flyClip: AnimationClip = null;
    // 你的爆炸 clip 名
    private _boomClip = 'Bomb01';
    // 你的飞行 clip 名（如果没有飞行动画，就留空）


    /** 复位：生成时回到飞行状态，避免“带着爆炸动画飞出来” */
    public resetForSpawn(): void {
        if (!this.anim) return;

        // 先停掉一切（避免继承上次状态）
        this.anim.stop();

        // 如果你有飞行动画就播飞行；没有就不要播
        // 如果你不想子弹自带动画，把下面这行删掉即可
        if (this.anim.getState(this.flyClip.name)) {
            this.anim.play(this.flyClip.name);
        }
    }

    /** 播放爆炸，播完回调 */
    public playBoom(onFinished?: () => void): void {
        if (!this.anim) {
            onFinished?.();
            return;
        }

        // 停止飞行等其它动画
        this.anim.stop();

        if (!onFinished) {
            this.anim.play(this._boomClip);
            return;
        }

        const handler = () => {
            this.anim?.off(Animation.EventType.FINISHED, handler);
            onFinished();
        };

        // 先绑定，再播放，避免极短 clip 丢事件
        this.anim.on(Animation.EventType.FINISHED, handler);
        this.anim.play(this._boomClip);
    }
}

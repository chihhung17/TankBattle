import { _decorator, Animation, AnimationClip, Component} from 'cc';
const { ccclass, property } = _decorator;
/**
 * 枪口出膛发射动画
 * 搭载发射点 通用
 */
@ccclass('FirePointAnimation')
export class FirePointAnimation extends Component {

    @property(Animation)
    anima: Animation

    @property(AnimationClip)
    idleClip: AnimationClip = null
    // private fireClip = "EnemyFire"
    @property(AnimationClip)
    fireClip: AnimationClip = null
    protected onLoad(): void {
        this.anima = this.getComponent(Animation)
    }
    public resetForSpawn(): void {
        if (!this.anima) return;

        // 先停掉一切（避免继承上次状态）
        this.anima.stop();

        if (this.anima.getState(this.idleClip.name)) {
            this.anima.play(this.idleClip.name);
        }
    }

    playFire() {
        this.anima.play(this.fireClip.name)
    }
}



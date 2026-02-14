import { _decorator, Component, director, Node, Toggle, ToggleComponent } from 'cc';
import { AudioManager } from '../Manager/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('PauseUIPanel')
export class PauseUIPanel extends Component {
    private static instance: PauseUIPanel
    public static getInstance(): PauseUIPanel {
        return PauseUIPanel.instance
    }

    @property(AudioManager) audio: AudioManager = null;
    @property(ToggleComponent) toogle: ToggleComponent = null;
    @property(Node) joystick: Node = null;

    protected onLoad(): void {
        if (PauseUIPanel.getInstance()) {
            return
        }
        if (PauseUIPanel.instance === this) PauseUIPanel.instance = null
        PauseUIPanel.instance = this

    }
    protected start(): void {
        this.showPause(false)
        if (this.toogle) {
            this.applyMusicState(this.toogle);
        }
    }
    showPause(value: boolean) {
        this.node.active = value
        if (value) this.node.setSiblingIndex(this.node.parent.children.length - 1);
    }

    // Toggle 事件回调
    onToggleMusic(toggle: Toggle): void {
        this.applyMusicState(toggle);
    }

    private applyMusicState(toggle: Toggle): void {
        if (!this.toogle.isChecked) {
            this.audio?.closeAudio();
        } else {
            this.audio?.openAudio();
        }
    }

    onClickClose() {
        this.audio.onClick()
        director.resume();
        this.joystick.active = true;
        this.node.active = false;
    }

}



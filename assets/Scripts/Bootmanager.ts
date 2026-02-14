import { _decorator, Component, Game, game, Node, Scene, assetManager, director, Button, Label } from 'cc';
import { EventBus } from './Events/EventBus';
import { GameEvents } from './Events/GameEvents';
const { ccclass, property } = _decorator;

@ccclass('Bootmanager')
export class Bootmanager extends Component {

    private enterBtn: Button = null
    @property(Label)
    label: Label = null
    start() {
        this.label.string = "正在加载...请稍后"
        this.enterBtn = this.node.getComponent(Button)
        console.log(this.enterBtn.name)
        this.enterBtn.enabled = false
        this.loadMain()

    }


    onLoadAllResource() {
        this.label.string = "点击任意位置进入游戏"
        this.enterBtn.enabled = true
    }

    async loadMain() {
        await assetManager.loadBundle('remoteres', (err, bundle) => {
            if (err) { console.error(err); return; }

            // 如果 Game.scene 在 remoteres 里：
            bundle.loadScene('Game', (err, sceneAsset) => {
                if (err) { console.error(err); return; }
                director.runScene(sceneAsset);
            });
        });
        this.onLoadAllResource()
    }

}



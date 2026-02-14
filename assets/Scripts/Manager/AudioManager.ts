import { _decorator, AudioClip, AudioSource, Component } from 'cc';
import { Config } from '../Config/Config';
import { AudioConfig } from '../Config/ConfigType';
import { LoadAnything } from '../Tools/LoadAnything';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {

    @property(AudioSource)
    audio: AudioSource | null = null

    @property(AudioSource)
    bgmAudio: AudioSource | null = null
    // 配置表初始化后才进行加载

    private bomb1: AudioClip = null //1
    private bomb2: AudioClip = null //2
    private bgm1: AudioClip = null //3
    private shoot: AudioClip = null //6
    private click: AudioClip = null //7
    private enemyShoot: AudioClip = null //8

    /** 加载所有音频，后续直接调用播放 */
    async init() {
        const bomb1Path = await Config.get<AudioConfig>("Audio").mustGet(1).path
        this.bomb1 = await LoadAnything.loadSourceAudioClip(bomb1Path)
        const bomb2Path = await Config.get<AudioConfig>("Audio").mustGet(2).path
        this.bomb2 = await LoadAnything.loadSourceAudioClip(bomb2Path)
        const bgm1Path = await Config.get<AudioConfig>("Audio").mustGet(3).path
        this.bgm1 = await LoadAnything.loadSourceAudioClip(bgm1Path)
        const shootPath = await Config.get<AudioConfig>("Audio").mustGet(6).path
        this.shoot = await LoadAnything.loadSourceAudioClip(shootPath)
        const clickPath = await Config.get<AudioConfig>("Audio").mustGet(7).path
        this.click = await LoadAnything.loadSourceAudioClip(clickPath)
        const enemyShootPath = await Config.get<AudioConfig>("Audio").mustGet(8).path
        this.enemyShoot = await LoadAnything.loadSourceAudioClip(enemyShootPath)

    }


    closeAudio() {
        if (!this.bgmAudio) return
        this.bgmAudio.volume = 0
        this.audio.volume = 0
        this.bgmAudio.pause()
    }
    openAudio() {
        if (!this.bgmAudio) return
        this.bgmAudio.volume = 1
        this.audio.volume = 1
        if (!this.bgmAudio.clip) {
            this.bgmAudio.clip = this.bgm1;
            this.bgmAudio.loop = true;
        }
        this.bgmAudio.play();
    }
    /** 按钮点击声音 */
    onClick() {
        this.audio.stop()
        this.audio.playOneShot(this.click)
    }
    onBgm() {
        this.bgmAudio.stop()
        this.bgmAudio.clip = this.bgm1
        this.bgmAudio.loop = true
        this.bgmAudio.play()
    }

    onShoot() {
        this.audio.stop()
        this.audio.playOneShot(this.shoot)
    }

    onEnemyShoot() {
        this.audio.stop()
        this.audio.playOneShot(this.enemyShoot)
    }

    onEnemyBomb() {
        this.audio.stop()
        this.audio.playOneShot(this.bomb1)
    }
    onPlayerBomb() {
        this.audio.stop()
        this.audio.playOneShot(this.bomb2)
    }
}



import { Prefab, SpriteFrame, TiledMapAsset } from 'cc';
import { PlayerData } from '../Player/PlayerData';
import { PoolManager } from '../Pool/PoolManager';
import { LoadAnything } from '../Tools/LoadAnything';
/**
 * 加载管理
 * 从playData获取数据进行加载
 */

export type LoadResult = {
    levelName: string
    enemyPrefab: Prefab
    enemyBulletPrefab: Prefab
    mapAsset?: TiledMapAsset
    timer: number
    enemySpeed: number
    spawnRate: number

    playerPrefab: Prefab
    playerBulletPrefab: Prefab
    playerSpeed: number
    fireRate: number
    radius: number
    bulletName: string
    playerHP: number
    playerSpf: SpriteFrame
}
export class LoadManager {

    private _poolInited = false;
    constructor(private playerData: PlayerData) { }

    /**
     * 初始化对象池（只初始化一次）
     */
    initPoolOnce() {
        if (this._poolInited) return;
        PoolManager.clearAll();
        PoolManager.init();
        this._poolInited = true;
    }

    /**
     * 加载当前关卡 + 当前玩家需要的资源，并 warmUp
     * /tODO，对象池就一次，但是后续切换更换关卡还要加载玩家数据和
     */
    async loadAll(): Promise<LoadResult> {
        this.initPoolOnce();

        const levelData = this.playerData.getCurrentLevelData();

        const levelName = levelData.name
        const enemyPrefab = await LoadAnything.getPrefab(levelData.enemy1Prefab);
        const enemyBulletPrefab = await LoadAnything.getPrefab(levelData.enemy1Bullet);
        const mapAsset = (await LoadAnything.loadSourceAssert(levelData.map));
        const timer = levelData.Timer;
        const enemySpeed = levelData.enemySpeed;
        const spawnRate = levelData.spawnRate;


        const playerData = this.playerData.getCurrentPlayerData();
        const playerBulletPrefab = await LoadAnything.getPrefab(playerData.bulletPrefab);
        const playerSpeed = playerData.speed
        const fireRate = playerData.fireRate
        const radius = playerData.radius
        const bulletName = playerData.bulletName
        const playerHP = playerData.HP
        const playerSpfstr = playerData.spf
        const playerSpf = await LoadAnything.getSprie(playerSpfstr)

        // 玩家预制体
        const playerPrefab = await LoadAnything.getPrefab(playerData.prefab)

        PoolManager.warmUp("Enemy", enemyPrefab, 20);
        PoolManager.warmUp("EnemyBullet", enemyBulletPrefab, 20);
        PoolManager.warmUp("BulletGreenL", playerBulletPrefab, 20);

        return {
            enemyPrefab,
            enemyBulletPrefab,
            mapAsset,
            timer,
            enemySpeed,
            spawnRate,
            playerBulletPrefab,
            playerPrefab,
            playerSpeed,
            fireRate,
            radius,
            bulletName,
            playerHP,
            levelName,
            playerSpf
        };
    }
}



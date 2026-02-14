import { Node, math, Vec3, Prefab, TiledMap, Asset, TiledMapAsset } from "cc";
import { PoolManager } from "../Pool/PoolManager";
import { TimerManager } from "../Tools/TimerManager";
import { EnemyController } from "../Enemy/EnemyController";
/**
 * 关卡管理器
 */
export class LevelManager {
    private _timerID = -1;

    constructor(
        private EnemyRoot: Node | null,
        private getPlayer: () => Node | null, // 获取 GameManager 的 this.player
        private getMapNode: () => Node | null, // 获取gm 的map节点
    ) { }

    /** 开始生成敌人 */
    startSpawn(mapAsset: TiledMapAsset, enemyPrefab: Prefab, enemySpeed: number, spawnRate: number, getRandomPos: () => Vec3) {
        if (!this.EnemyRoot) return;
        const map = this.getMapNode().getComponentInChildren(TiledMap)
        map.tmxAsset = mapAsset
        // 防止重复 start
        this.stopSpawn();

        // ✅ spawnRate 表示 “每秒生成数量”
        let acc = 0; // 允许 spawnRate 为小数（可选）
        this._timerID = TimerManager.loop(1, () => {
            const player = this.getPlayer();
            if (!player || !player.isValid) return;

            acc += spawnRate;
            const n = Math.floor(acc);
            acc -= n;

            for (let i = 0; i < n; i++) {
                const node = PoolManager.spawn("Enemy", enemyPrefab, this.EnemyRoot);
                node.setWorldPosition(getRandomPos());

                const ctrl = node.getComponent(EnemyController);
                if (ctrl) {
                    ctrl.move(enemySpeed, player)
                }
            }
        });
    }

    /** 停止生成敌人 */
    stopSpawn() {
        if (this._timerID !== -1) {
            TimerManager.clear(this._timerID);
            this._timerID = -1;
        }
    }

    /** 清理敌人（敌人池回收/销毁逻辑） */
    despawnAllEnemies() {
        if (!this.EnemyRoot) return;
        const list = this.EnemyRoot.children.slice();
        for (const node of list) {
            const ctrl = node.getComponent(EnemyController);
            if (ctrl) {
                ctrl.stopForHit();
                ctrl.destoryNode();
            } else {
                PoolManager.despawn("Enemy", node);
            }
        }
    }
}

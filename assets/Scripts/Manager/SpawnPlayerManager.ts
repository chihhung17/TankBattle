import { instantiate, Node, Prefab } from "cc";
import { PlayerMove } from "../Player/PlayerMove";
import { GunBarrelLockByCircleNoCollider } from "../Player/GunBarrelLockByCircleNoCollider";
/**
 * 玩家管理
 */
export class SpawnPlayerManager {
    private playerNode: Node
    constructor(
        private playerRoot: Node,
        private onPlayerChanged: (player: Node) => void
    ) { }

    setPlayer(value: boolean) {
        this.playerNode.active = value
    }
    /** 生成玩家 */
    spawnPlayer(playerPrefab: Prefab, oldPlayer: Node | null): Node {
        if (this.playerNode) this.playerNode.active = true
        if (oldPlayer && oldPlayer.isValid) {
            oldPlayer.destroy()
        }

        this.playerNode = instantiate(playerPrefab)
        // const player = instantiate(playerPrefab)
        // player.setParent(this.playerRoot)
        // player.setWorldPosition(this.playerRoot.worldPosition)
        // this.onPlayerChanged(player)
        // return player
        this.playerNode.setParent(this.playerRoot)
        this.playerNode.setWorldPosition(this.playerRoot.worldPosition)
        this.onPlayerChanged(this.playerNode)
        return this.playerNode

    }

    /** 玩家控制 */
    playerCtrl(player: Node | null, value: boolean, speed: number,
        fireRate: number, radius: number, bulletName: string
    ) {
        if (!player || !player.isValid) return
        const move = this.playerRoot.getComponent(PlayerMove)

        if (move) {
            move.setSpeed(speed)
            move.canMove(value)
        }

        const gun = player.getComponentInChildren(GunBarrelLockByCircleNoCollider)
        if (gun) {
            gun.canFire(value)
            gun.init(radius, fireRate, bulletName)
        }
    }
}



/** json约束字段 */
// 技能属性约束，攻速、玩家移动、射程
export type SkillProperty = 'fireRate' | 'playerSpeed' | 'fireRadius' | 'playerHp' | 'bulletSpeed'
export interface LevelConfig {
    id: number,
    name: string,
    Timer: number,// 倒计时时间
    spawnRate?: number,// 敌人生成速度
    enemySpeed?: number,// 敌人速度
    enemy1Prefab: string, // 预制体路径
    enemy1Bullet: string,// 敌人子弹预制体
    map: string // 地图资源
}

export interface PlayerConfig {
    id: number,
    name: string,
    HP: number,
    prefab: string,
    speed: number, // 移动速度
    bulletPrefab: string, // 子弹预制体
    bulletName: string, // 子弹名称
    fireRate: number, // 射速
    radius: number,//检测半径
    bulletSpeed: number,
    spf: string
}
export interface SkillConfig {
    id: number,
    property: SkillProperty, // 技能所属属性
    tips: string, // 技能介绍
    add: number, // 增加的属性，+1%？
    prefabPath?: string, // 预制体（可能可以换子弹）
    max: number // 技能参数最大值
}
export interface AudioConfig {
    id: number,
    name: string,
    path: string
}
import { ConfigRegister } from "./ConfigRegister";
import { AudioConfig, LevelConfig, PlayerConfig, SkillConfig } from "./ConfigType";

/**
 * 注册表
 */
ConfigRegister.register<LevelConfig>({
    name: "Level",
    path: "JSON/Level"
})

ConfigRegister.register<PlayerConfig>({
    name: "Player",
    path: "JSON/Player"
})
ConfigRegister.register<SkillConfig>({
    name: "Skills",
    path: "JSON/Skills"
})
ConfigRegister.register<AudioConfig>({
    name: "Audio",
    path: "JSON/Audio"
})
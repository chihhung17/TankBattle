export const GameEvents = {
    Death: {
        EnemyDeath: "Game.Death.Enemy_Death",
        PlayerDeath: "Game.Death.Enemy_Death"
    },
    Flow: {
        ToMenu: "Game.Flow.To_Menu",
        ToPlaying: "Game.Flow.To_Playing"
    },
    Game: {
        ReadyStart: "Game.Game.Ready_Start",
        ReadyStartLoop: "Game.Game.Ready_Start_Loop"
    },
    Player: {
        GetDamage: "Game.Player.Get_Damage"
    }
} as const
export enum EnemyType {
    SOLDIER = "soldier",
    SNIPER = "sniper",
    KAMIKAZE = "kamikaze",
    JUGG = "juggernaut",
    BOMBER = "bomber",
}

export interface SpawnFrequency{
    spawnFrequency: number
}

export const EnemyConfig: Record<EnemyType,SpawnFrequency> = {
    [EnemyType.SOLDIER]: {spawnFrequency: 0.4},
    [EnemyType.SNIPER]: {spawnFrequency: 0.1},
    [EnemyType.KAMIKAZE]: {spawnFrequency: 0.1},
    [EnemyType.JUGG]: {spawnFrequency: 0.2},
    [EnemyType.BOMBER]: {spawnFrequency: 0.2},
    // It has to sum up to 1
}

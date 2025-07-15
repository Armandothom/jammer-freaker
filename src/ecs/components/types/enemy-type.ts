export enum EnemyType {
    SOLDIER = "soldier",
    SNIPER = "sniper",
    KAMIKAZE = "kamikaze",
    JUGG = "juggernaut",
    BOMBER = "bomber",
}

export interface PropertiesTable {
    spawnFrequency: number,
    hp: number,
    damage: number,
    attackCooldownInSeconds: number, // In seconds
    attackRange: number,
    movementRadius: number, // used to adjust movement Behavior -- distance from the player
    velocity: number,
}

export const EnemyConfig: Record<EnemyType, PropertiesTable> = {
    [EnemyType.SOLDIER]: {
        spawnFrequency: 0.4,
        hp: 100,
        damage: 10,
        attackCooldownInSeconds: 1,
        attackRange: 640,
        movementRadius: 320,
        velocity: 1,
    },
    [EnemyType.SNIPER]: {
        spawnFrequency: 0.1,
        hp: 100,
        damage: 10,
        attackCooldownInSeconds: 1,
        attackRange: 640,
        movementRadius: 320,
        velocity: 1,
    },
    [EnemyType.KAMIKAZE]: {
        spawnFrequency: 0.1,
        hp: 100,
        damage: 10,
        attackCooldownInSeconds: 1,
        attackRange: 640,
        movementRadius: 320,
        velocity: 1,
    },
    [EnemyType.JUGG]: {
        spawnFrequency: 0.2,
        hp: 100,
        damage: 10,
        attackCooldownInSeconds: 1,
        attackRange: 640,
        movementRadius: 320,
        velocity: 1,
    },
    [EnemyType.BOMBER]: {
        spawnFrequency: 0.2,
        hp: 100,
        damage: 10,
        attackCooldownInSeconds: 1,
        attackRange: 640,
        movementRadius: 320,
        velocity: 1,
    },
    // Spawn frequency has to sum up to 1, adjust the values when we implement the attack beha
}

export enum WeaponType {
    PISTOL = "pistol",
    SMG = "smg",
    RIFLE = "rifle",
    AWP = "awp",
    KNIFE = "knife",
    GRANADE = "granade",
}

export interface PropertiesTable {
    shootingCooldown: number,
    damage: number,
    maxBullets: number,
}

export const WeaponConfig: Record<WeaponType, PropertiesTable> = {
    [WeaponType.PISTOL]: {
        shootingCooldown: 0.5, // in seconds
        damage: 20,
        maxBullets: 10,
    },
    [WeaponType.SMG]: {
        shootingCooldown: 0.2, // in seconds
        damage: 20,
        maxBullets: 30,
    },
    [WeaponType.RIFLE]: {
        shootingCooldown: 0.5, // in seconds
        damage: 34,
        maxBullets: 20,
    },
    [WeaponType.AWP]: {
        shootingCooldown: 1, // in seconds
        damage: 1000,
        maxBullets: 5,
    },
    [WeaponType.KNIFE]: {
        shootingCooldown: 0.1, // in seconds
        damage: 50,
        maxBullets: 5, // use this as the knife "breaking"
    },
    [WeaponType.GRANADE]: {
        shootingCooldown: 0.2, // in seconds
        damage: 100,
        maxBullets: 3,
    },
}
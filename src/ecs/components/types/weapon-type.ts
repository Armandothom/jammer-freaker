export enum WeaponType {
    PISTOL = "pistol",
    SMG = "smg",
    RIFLE = "rifle",
    AWP = "awp",
    KNIFE = "knife",
    GRENADE = "grenade",
}

export interface PropertiesTable {
    shootingCooldown: number,
    damage: number,
    maxBullets: number,
    reloadTime: number,
    explosionRadius: number,
    fuseTimer: number,
}

export const WeaponConfig: Record<WeaponType, PropertiesTable> = {
    [WeaponType.PISTOL]: {
        shootingCooldown: 0.5, // in seconds
        damage: 20,
        maxBullets: 10,
        reloadTime: 0.5,
        explosionRadius: 0,
        fuseTimer: 0,
    },
    [WeaponType.SMG]: {
        shootingCooldown: 0.2, // in seconds
        damage: 20,
        maxBullets: 30,
        reloadTime: 1,
        explosionRadius: 0,
        fuseTimer: 0,
    },
    [WeaponType.RIFLE]: {
        shootingCooldown: 0.5, // in seconds
        damage: 34,
        maxBullets: 10,
        reloadTime: 2,
        explosionRadius: 0,
        fuseTimer: 0,
    },
    [WeaponType.AWP]: {
        shootingCooldown: 1, // in seconds
        damage: 1000,
        maxBullets: 5,
        reloadTime: 3,
        explosionRadius: 0,
        fuseTimer: 0,
    },
    [WeaponType.KNIFE]: {
        shootingCooldown: 0.3, // in seconds
        damage: 50,
        maxBullets: 5, // use this as the knife "breaking"
        reloadTime: 0,
        explosionRadius: 0,
        fuseTimer: 0,
    },
    [WeaponType.GRENADE]: {
        shootingCooldown: 2, // in seconds
        damage: 150,
        maxBullets: 3,
        reloadTime: 0,
        explosionRadius: 192,
        fuseTimer: 2,
    },
}
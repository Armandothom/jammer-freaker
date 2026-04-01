import { AnimationName } from "../../../game/asset-manager/types/animation-map.js"
import { SpriteName } from "../../../game/world/types/sprite-name.enum.js"

export enum WeaponType {
    PISTOL = "pistol",
    SMG = "smg",
    RIFLE = "rifle",
    SNIPER = "sniper",
    KNIFE = "knife",
    GRENADE = "grenade",
    SHIELD = "shield"
}

export interface WeaponConfig {
    damage: number,
    maxBullets: number,
    reloadTime: number,
    explosionRadius: number,
    fuseTimer: number,
    animation: AnimationName,
    spriteName: SpriteName,
    pivotPointSprite: number,
    fireRate: number,
}

export const WeaponConfig: Record<WeaponType, WeaponConfig> = {
    [WeaponType.PISTOL]: {
        damage: 20,
        maxBullets: 10,
        reloadTime: 0.5,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_PISTOL,
        spriteName: SpriteName.PISTOL,
        pivotPointSprite: 3,
        fireRate: 100,
    },
    [WeaponType.SMG]: {
        damage: 20,
        maxBullets: 30,
        reloadTime: 1,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_SMG,
        spriteName: SpriteName.SMG,
        pivotPointSprite: 6,
        fireRate: 100,
    },
    [WeaponType.RIFLE]: {
        damage: 34,
        maxBullets: 10,
        reloadTime: 2,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_RIFLE,
        spriteName: SpriteName.RIFLE,
        pivotPointSprite: 6,
        fireRate: 100,
    },
    [WeaponType.SNIPER]: {
        damage: 1000,
        maxBullets: 5,
        reloadTime: 3,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_RIFLE,
        spriteName: SpriteName.RIFLE,
        pivotPointSprite: 6,
        fireRate: 100,
    },
    [WeaponType.KNIFE]: {
        damage: 50,
        maxBullets: 5, // use this as the knife "breaking"
        reloadTime: 0,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_KNIFE,
        spriteName: SpriteName.KNIFE,
        pivotPointSprite: 1,
        fireRate: 100,
    },
    [WeaponType.GRENADE]: {
        damage: 150,
        maxBullets: 3,
        reloadTime: 0,
        explosionRadius: 192,
        fuseTimer: 2,
        animation: AnimationName.GRENADE_FIRED,
        spriteName: SpriteName.GRENADE_1,
        pivotPointSprite: 0,
        fireRate: 100,
    },
    [WeaponType.SHIELD]: {
        damage: 150,
        maxBullets: 3,
        reloadTime: 0,
        explosionRadius: 192,
        fuseTimer: 2,
        animation: AnimationName.WEAPON_SHIELD,
        spriteName: SpriteName.SHIELD,
        pivotPointSprite: 0,
        fireRate: 100,
    },
}
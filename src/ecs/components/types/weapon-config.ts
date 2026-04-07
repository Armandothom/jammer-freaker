import { AnimationName } from "../../../game/asset-manager/types/animation-map.js";
import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import { GRENADE_CONFIG } from "./grenade-config.js";
import { KNIFE_CONFIG } from "./knife-config.js";

export enum WeaponType {
    PISTOL = "pistol",
    SMG = "smg",
    RIFLE = "rifle",
    SNIPER = "sniper",
    KNIFE = "knife",
    GRENADE = "grenade",
    SHIELD = "shield",
}

export interface WeaponConfig {
    damage: number;
    maxBullets: number;
    reloadTime: number;
    explosionRadius: number;
    fuseTimer: number;
    animation: AnimationName;
    spriteName: SpriteName;
    pivotPointSprite: number;
    fireRate: number;
    maxedOut: boolean;
}

const SHIELD_CONFIG: WeaponConfig = {
    damage: 0,
    maxBullets: 0,
    reloadTime: 0,
    explosionRadius: 0,
    fuseTimer: 0,
    animation: AnimationName.WEAPON_SHIELD,
    spriteName: SpriteName.SHIELD,
    pivotPointSprite: 0,
    fireRate: 0,
    maxedOut: false,
};

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
        maxedOut: false,
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
        maxedOut: false,
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
        maxedOut: false,
    },
    [WeaponType.SNIPER]: {
        damage: 100,
        maxBullets: 5,
        reloadTime: 3,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_SNIPER,
        spriteName: SpriteName.SNIPER,
        pivotPointSprite: 6,
        fireRate: 100,
        maxedOut: false,
    },
    [WeaponType.KNIFE]: KNIFE_CONFIG,
    [WeaponType.GRENADE]: GRENADE_CONFIG,
    [WeaponType.SHIELD]: SHIELD_CONFIG,
};

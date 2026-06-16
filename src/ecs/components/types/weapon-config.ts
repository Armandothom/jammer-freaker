import { AnimationName } from "../../../game/asset-manager/types/animation-map.js";
import { SpriteName } from "../../../game/world-map/types/sprite-name.enum.js";

export enum WeaponType {
    PISTOL = "pistol",
    SMG = "smg",
    RIFLE = "rifle",
    SNIPER = "sniper",
    KNIFE = "knife",
    GRENADE = "grenade",
    SHIELD = "shield",
    SHOTGUN = "shotgun",
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
    spreadAngle: number | null;
    projectilesFired: number | null;
    projectileVelocity: number | null; // px/s
    spreadMinRadius: number | null;
    spreadMaxRadius: number | null;
    walkingRecoil: number | null; // px
    shootingRecoil: number | null; // px
    //walking recoil and shooting recoil adds X px per second walking or shooting - caps at spreadMaxRadius
    focusFireTime: number | null;
    // time standing still to start recovering recoil
    recoilRecoverVelocity: number | null; // px/s
    // recover velocity  when focus fired mode
    bleedingChance: number | null;
    maxedOut: boolean;
}


export const WeaponConfig: Record<WeaponType, WeaponConfig> = {
    [WeaponType.PISTOL]: {
        damage: 20,
        maxBullets: 10,
        reloadTime: 1,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_PISTOL,
        spriteName: SpriteName.PISTOL,
        pivotPointSprite: 3,
        fireRate: 100,
        spreadAngle: null,
        projectilesFired: 1,
        projectileVelocity: 720,
        spreadMinRadius: 8,
        spreadMaxRadius: 32,
        walkingRecoil: 0.5,
        shootingRecoil: 8, // p
        focusFireTime: 1,
        recoilRecoverVelocity: 24,
        bleedingChance: 0.1,
        maxedOut: false,
    },
    [WeaponType.SMG]: {
        damage: 20,
        maxBullets: 35,
        reloadTime: 1.25,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_SMG,
        spriteName: SpriteName.SMG,
        pivotPointSprite: 6,
        fireRate: 800,
        spreadAngle: null,
        projectilesFired: 1,
        projectileVelocity: 720,
        spreadMinRadius: 12,
        spreadMaxRadius: 64,
        walkingRecoil: 0.2,
        shootingRecoil: 4, // px
        focusFireTime: 2,
        recoilRecoverVelocity: 12,
        bleedingChance: 0.05,
        maxedOut: false,
    },
    [WeaponType.RIFLE]: {
        damage: 34,
        maxBullets: 30,
        reloadTime: 2.5,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_RIFLE,
        spriteName: SpriteName.RIFLE,
        pivotPointSprite: 5,
        fireRate: 600,
        spreadAngle: null,
        projectilesFired: 1,
        projectileVelocity: 720,
        spreadMinRadius: 8,
        spreadMaxRadius: 48,
        walkingRecoil: 0.5,
        shootingRecoil: 6, // px
        focusFireTime: 1,
        recoilRecoverVelocity: 32,
        bleedingChance: 0.2,
        maxedOut: false,
    },
    [WeaponType.SNIPER]: {
        damage: 100,
        maxBullets: 5,
        reloadTime: 3.5,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_SNIPER,
        spriteName: SpriteName.SNIPER,
        pivotPointSprite: 7,
        fireRate: 100,
        spreadAngle: null,
        projectilesFired: 1,
        projectileVelocity: 720,
        spreadMinRadius: 6,
        spreadMaxRadius: 64,
        walkingRecoil: 2,
        shootingRecoil: 64, // px
        focusFireTime: 2,
        recoilRecoverVelocity: 48,
        bleedingChance: 0.5,
        maxedOut: false,
    },
    [WeaponType.KNIFE]: {
        damage: 50,
        maxBullets: 5,
        reloadTime: 0,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_KNIFE,
        spriteName: SpriteName.KNIFE,
        pivotPointSprite: 1,
        fireRate: 100,
        spreadAngle: null,
        projectilesFired: null,
        projectileVelocity: null,
        spreadMinRadius: null,
        spreadMaxRadius: null,
        walkingRecoil: null,
        shootingRecoil: null,
        focusFireTime: null,
        recoilRecoverVelocity: null,
        bleedingChance: 1,
        maxedOut: false,
    },
    [WeaponType.GRENADE]: {
        damage: 50,
        maxBullets: 3,
        reloadTime: 0,
        explosionRadius: 192,
        fuseTimer: 2,
        animation: AnimationName.GRENADE_FIRED,
        spriteName: SpriteName.GRENADE_1,
        pivotPointSprite: 0,
        fireRate: 100,
        spreadAngle: null,
        projectilesFired: null,
        projectileVelocity: null,
        spreadMinRadius: null,
        spreadMaxRadius: null,
        walkingRecoil: null,
        shootingRecoil: null,
        focusFireTime: null,
        recoilRecoverVelocity: null,
        bleedingChance: 0.75,
        maxedOut: false,
    },
    [WeaponType.SHIELD]: {
        damage: 0,
        maxBullets: 0,
        reloadTime: 0,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_SHIELD,
        spriteName: SpriteName.SHIELD,
        pivotPointSprite: 0,
        fireRate: 0,
        spreadAngle: null,
        projectilesFired: null,
        projectileVelocity: null,
        spreadMinRadius: null,
        spreadMaxRadius: null,
        walkingRecoil: null,
        shootingRecoil: null,
        focusFireTime: null,
        recoilRecoverVelocity: null,
        bleedingChance: null,
        maxedOut: false,
    },
    [WeaponType.SHOTGUN]: {
        damage: 100,
        maxBullets: 5,
        reloadTime: 0.56,
        explosionRadius: 0,
        fuseTimer: 0,
        animation: AnimationName.WEAPON_SHOTGUN,
        spriteName: SpriteName.SHOTGUN,
        pivotPointSprite: 6,
        fireRate: 100,
        spreadAngle: 25 * Math.PI / 180,
        projectilesFired: 9,
        projectileVelocity: 640,
        spreadMinRadius: 32,
        spreadMaxRadius: 32,
        walkingRecoil: 0,
        shootingRecoil: 0,
        focusFireTime: 0,
        recoilRecoverVelocity: 0,
        bleedingChance: 0.02,
        maxedOut: false,
    },
};

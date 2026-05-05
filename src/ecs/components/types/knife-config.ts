import { AnimationName } from "../../../game/asset-manager/types/animation-map.js";
import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import type { WeaponConfig } from "./weapon-config.js";

export const KNIFE_CONFIG: WeaponConfig = {
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
    maxedOut: false,
};

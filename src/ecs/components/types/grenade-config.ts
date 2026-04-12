import { AnimationName } from "../../../game/asset-manager/types/animation-map.js";
import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import type { WeaponConfig } from "./weapon-config.js";

export const GRENADE_CONFIG: WeaponConfig = {
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
    maxedOut: false,
};

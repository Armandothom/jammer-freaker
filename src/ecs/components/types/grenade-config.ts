import { AnimationName } from "../../../game/asset-manager/types/animation-map.js";
import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import type { WeaponConfig } from "./weapon-type.js";

export const GRENADE_CONFIG: WeaponConfig = {
    damage: 150,
    maxBullets: 3,
    reloadTime: 0,
    explosionRadius: 192,
    fuseTimer: 2,
    animation: AnimationName.GRENADE_FIRED,
    spriteName: SpriteName.GRENADE_1,
    pivotPointSprite: 0,
    fireRate: 100,
    maxedOut: false,
};

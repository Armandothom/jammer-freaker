import { SpriteName } from "../../../game/world-map/types/sprite-name.enum.js";
import { WeaponType } from "./weapon-config.js";

export const GunsShopWeaponItemType = {
    WEAPON_1: "weapon_1",
    WEAPON_2: "weapon_2",
    WEAPON_3: "weapon_3",
    WEAPON_4: "weapon_4",
} as const;

export type GunsShopWeaponItemType =
    typeof GunsShopWeaponItemType[keyof typeof GunsShopWeaponItemType];

export type GunsShopWeaponItemConfig = {
    name: string,
    price: number;
    weaponType: WeaponType;
    spriteName: SpriteName;
    width: number;
    height: number;
    order: number;
};

export const GUNS_SHOP_WEAPON_ITEM_CONFIG: Record<GunsShopWeaponItemType, GunsShopWeaponItemConfig> = {
    [GunsShopWeaponItemType.WEAPON_1]: {
        name: "Submachine Gun",
        price: 900,
        weaponType: WeaponType.SMG,
        spriteName: SpriteName.SMG,
        width: 48,
        height: 26,
        order: 0,
    },
    [GunsShopWeaponItemType.WEAPON_2]: {
        name: "Assault Rifle",
        price: 1500,
        weaponType: WeaponType.RIFLE,
        spriteName: SpriteName.RIFLE,
        width: 56,
        height: 26,
        order: 1,
    },
    [GunsShopWeaponItemType.WEAPON_3]: {
        name: "Shotgun",
        price: 2500,
        weaponType: WeaponType.SHOTGUN,
        spriteName: SpriteName.SHOTGUN,
        width: 56,
        height: 26,
        order: 2,
    },
    [GunsShopWeaponItemType.WEAPON_4]: {
        name: "Precision Rifle",
        price: 2500,
        weaponType: WeaponType.SNIPER,
        spriteName: SpriteName.SNIPER,
        width: 56,
        height: 26,
        order: 3,
    },

};

export const GUNS_SHOP_WEAPON_ITEMS_ORDER: GunsShopWeaponItemType[] = (
    Object.keys(GUNS_SHOP_WEAPON_ITEM_CONFIG) as GunsShopWeaponItemType[]
).sort((a, b) => {
    return GUNS_SHOP_WEAPON_ITEM_CONFIG[a].order - GUNS_SHOP_WEAPON_ITEM_CONFIG[b].order;
});

export function isGunsShopWeaponItemType(value: string): value is GunsShopWeaponItemType {
    return Object.prototype.hasOwnProperty.call(GUNS_SHOP_WEAPON_ITEM_CONFIG, value);
}

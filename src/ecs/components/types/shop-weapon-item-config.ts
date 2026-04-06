import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import { WeaponType } from "./weapon-type.js";

export const ShopWeaponItemType = {
    WEAPON_1: "weapon_1",
    WEAPON_2: "weapon_2",
    WEAPON_3: "weapon_3",
} as const;

export type ShopWeaponItemType =
    typeof ShopWeaponItemType[keyof typeof ShopWeaponItemType];

export type ShopWeaponItemConfig = {
    name: string,
    price: number;
    weaponType: WeaponType;
    spriteName: SpriteName;
    width: number;
    height: number;
    order: number;
};

export const SHOP_WEAPON_ITEM_CONFIG: Record<ShopWeaponItemType, ShopWeaponItemConfig> = {
    [ShopWeaponItemType.WEAPON_1]: {
        name: "Submachine Gun",
        price: 900,
        weaponType: WeaponType.SMG,
        spriteName: SpriteName.SMG,
        width: 48,
        height: 26,
        order: 0,
    },
    [ShopWeaponItemType.WEAPON_2]: {
        name: "Assault Rifle",
        price: 1500,
        weaponType: WeaponType.RIFLE,
        spriteName: SpriteName.RIFLE,
        width: 56,
        height: 26,
        order: 1,
    },
    [ShopWeaponItemType.WEAPON_3]: {
        name: "Precision Rifle",
        price: 2500,
        weaponType: WeaponType.SNIPER,
        spriteName: SpriteName.SNIPER,
        width: 56,
        height: 26,
        order: 2,
    },
};

export const SHOP_WEAPON_ITEMS_ORDER: ShopWeaponItemType[] = (
    Object.keys(SHOP_WEAPON_ITEM_CONFIG) as ShopWeaponItemType[]
).sort((a, b) => {
    return SHOP_WEAPON_ITEM_CONFIG[a].order - SHOP_WEAPON_ITEM_CONFIG[b].order;
});

export function isShopWeaponItemType(value: string): value is ShopWeaponItemType {
    return Object.prototype.hasOwnProperty.call(SHOP_WEAPON_ITEM_CONFIG, value);
}

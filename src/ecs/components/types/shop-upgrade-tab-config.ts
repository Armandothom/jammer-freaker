import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import { WeaponType } from "./weapon-config.js";
import type { UpgradableWeaponType } from "./weapon-upgrade-config.js";

export const ShopUpgradeTabType = {
    PISTOL: WeaponType.PISTOL,
    SMG: WeaponType.SMG,
    RIFLE: WeaponType.RIFLE,
    SNIPER: WeaponType.SNIPER,
    SHOTGUN: WeaponType.SHOTGUN,
} as const;

export type ShopUpgradeTabType =
    typeof ShopUpgradeTabType[keyof typeof ShopUpgradeTabType];

export type ShopUpgradeTabConfig = {
    tabType: ShopUpgradeTabType;
    weaponType: UpgradableWeaponType;
    weaponSprite: SpriteName;
    order: number;
    spriteName: SpriteName;
    spriteActiveName?: SpriteName;
    width: number;
    height: number;
};

export const SHOP_UPGRADE_TAB_CONFIG: Record<ShopUpgradeTabType, ShopUpgradeTabConfig> = {
    [ShopUpgradeTabType.PISTOL]: {
        tabType: ShopUpgradeTabType.PISTOL,
        weaponType: WeaponType.PISTOL,
        weaponSprite: SpriteName.PISTOL,
        order: 3,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [ShopUpgradeTabType.SMG]: {
        tabType: ShopUpgradeTabType.SMG,
        weaponType: WeaponType.SMG,
        weaponSprite: SpriteName.SMG,
        order: 2,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [ShopUpgradeTabType.RIFLE]: {
        tabType: ShopUpgradeTabType.RIFLE,
        weaponType: WeaponType.RIFLE,
        weaponSprite: SpriteName.RIFLE,
        order: 1,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [ShopUpgradeTabType.SNIPER]: {
        tabType: ShopUpgradeTabType.SNIPER,
        weaponType: WeaponType.SNIPER,
        weaponSprite: SpriteName.SNIPER,
        order: 0,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [ShopUpgradeTabType.SHOTGUN]: {
        tabType: ShopUpgradeTabType.SHOTGUN,
        weaponType: WeaponType.SHOTGUN,
        weaponSprite: SpriteName.SHOTGUN,
        order: 0,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
};

export const SHOP_UPGRADE_TABS_ORDER: ShopUpgradeTabType[] = (
    Object.keys(SHOP_UPGRADE_TAB_CONFIG) as ShopUpgradeTabType[]
).sort((a, b) => {
    return SHOP_UPGRADE_TAB_CONFIG[a].order - SHOP_UPGRADE_TAB_CONFIG[b].order;
});

export function isShopUpgradeTabType(value: string): value is ShopUpgradeTabType {
    return Object.prototype.hasOwnProperty.call(SHOP_UPGRADE_TAB_CONFIG, value);
}

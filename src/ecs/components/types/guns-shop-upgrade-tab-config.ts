import { SpriteName } from "../../../game/world-map/types/sprite-name.enum.js";
import { WeaponType } from "./weapon-config.js";
import type { UpgradableWeaponType } from "./weapon-upgrade-config.js";

export const GunsShopUpgradeTabType = {
    PISTOL: WeaponType.PISTOL,
    SMG: WeaponType.SMG,
    RIFLE: WeaponType.RIFLE,
    SNIPER: WeaponType.SNIPER,
    SHOTGUN: WeaponType.SHOTGUN,
} as const;

export type GunsShopUpgradeTabType =
    typeof GunsShopUpgradeTabType[keyof typeof GunsShopUpgradeTabType];

export type GunsShopUpgradeTabConfig = {
    tabType: GunsShopUpgradeTabType;
    weaponType: UpgradableWeaponType;
    weaponSprite: SpriteName;
    order: number;
    spriteName: SpriteName;
    spriteActiveName?: SpriteName;
    width: number;
    height: number;
};

export const GUNS_SHOP_UPGRADE_TAB_CONFIG: Record<GunsShopUpgradeTabType, GunsShopUpgradeTabConfig> = {
    [GunsShopUpgradeTabType.PISTOL]: {
        tabType: GunsShopUpgradeTabType.PISTOL,
        weaponType: WeaponType.PISTOL,
        weaponSprite: SpriteName.PISTOL,
        order: 3,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [GunsShopUpgradeTabType.SMG]: {
        tabType: GunsShopUpgradeTabType.SMG,
        weaponType: WeaponType.SMG,
        weaponSprite: SpriteName.SMG,
        order: 2,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [GunsShopUpgradeTabType.RIFLE]: {
        tabType: GunsShopUpgradeTabType.RIFLE,
        weaponType: WeaponType.RIFLE,
        weaponSprite: SpriteName.RIFLE,
        order: 1,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [GunsShopUpgradeTabType.SNIPER]: {
        tabType: GunsShopUpgradeTabType.SNIPER,
        weaponType: WeaponType.SNIPER,
        weaponSprite: SpriteName.SNIPER,
        order: 0,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
    [GunsShopUpgradeTabType.SHOTGUN]: {
        tabType: GunsShopUpgradeTabType.SHOTGUN,
        weaponType: WeaponType.SHOTGUN,
        weaponSprite: SpriteName.SHOTGUN,
        order: 0,
        spriteName: SpriteName.BUTTON_4,
        spriteActiveName: SpriteName.BUTTON_4_SELECTED,
        width: 96,
        height: 32,
    },
};

export const GUNS_SHOP_UPGRADE_TABS_ORDER: GunsShopUpgradeTabType[] = (
    Object.keys(GUNS_SHOP_UPGRADE_TAB_CONFIG) as GunsShopUpgradeTabType[]
).sort((a, b) => {
    return GUNS_SHOP_UPGRADE_TAB_CONFIG[a].order - GUNS_SHOP_UPGRADE_TAB_CONFIG[b].order;
});

export function isGunsShopUpgradeTabType(value: string): value is GunsShopUpgradeTabType {
    return Object.prototype.hasOwnProperty.call(GUNS_SHOP_UPGRADE_TAB_CONFIG, value);
}

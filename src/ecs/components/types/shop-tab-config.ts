import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";

export const ShopTabType = {
    WEAPONS: "weapons",
    RESOURCES: "resources",
    UPGRADES: "upgrades",
} as const;

export type ShopTabType =
    typeof ShopTabType[keyof typeof ShopTabType];

export type ShopTabConfig = {
    tabType: ShopTabType,
    label: string;
    order: number;
    spriteName: SpriteName;
    spriteActiveName?: SpriteName;
    width: number;
    height: number;
};

export const SHOP_TAB_CONFIG: Record<ShopTabType, ShopTabConfig> = {
    [ShopTabType.WEAPONS]: {
        tabType: ShopTabType.WEAPONS,
        label: "Weapons",
        order: 2,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
    [ShopTabType.RESOURCES]: {
        tabType: ShopTabType.RESOURCES,
        label: "Resources",
        order: 1,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
    [ShopTabType.UPGRADES]: {
        tabType: ShopTabType.UPGRADES,
        label: "Upgrades",
        order: 0,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
};

export const SHOP_TABS_ORDER: ShopTabType[] = (
    Object.keys(SHOP_TAB_CONFIG) as ShopTabType[]
).sort((a, b) => {
    return SHOP_TAB_CONFIG[a].order - SHOP_TAB_CONFIG[b].order;
});
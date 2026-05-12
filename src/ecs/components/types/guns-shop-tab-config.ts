import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";

export const GunsShopTabType = {
    WEAPONS: "weapons",
    RESOURCES: "resources",
    UPGRADES: "upgrades",
} as const;

export type GunsShopTabType =
    typeof GunsShopTabType[keyof typeof GunsShopTabType];

export type GunsShopTabConfig = {
    tabType: GunsShopTabType,
    label: string;
    order: number;
    spriteName: SpriteName;
    spriteActiveName?: SpriteName;
    width: number;
    height: number;
};

export const GUNS_SHOP_TAB_CONFIG: Record<GunsShopTabType, GunsShopTabConfig> = {
    [GunsShopTabType.WEAPONS]: {
        tabType: GunsShopTabType.WEAPONS,
        label: "Weapons",
        order: 2,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
    [GunsShopTabType.RESOURCES]: {
        tabType: GunsShopTabType.RESOURCES,
        label: "Resources",
        order: 1,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
    [GunsShopTabType.UPGRADES]: {
        tabType: GunsShopTabType.UPGRADES,
        label: "Upgrades",
        order: 0,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
};

export const GUNS_SHOP_TABS_ORDER: GunsShopTabType[] = (
    Object.keys(GUNS_SHOP_TAB_CONFIG) as GunsShopTabType[]
).sort((a, b) => {
    return GUNS_SHOP_TAB_CONFIG[a].order - GUNS_SHOP_TAB_CONFIG[b].order;
});

export function isGunsShopTabType(value: string): value is GunsShopTabType {
    return Object.prototype.hasOwnProperty.call(GUNS_SHOP_TAB_CONFIG, value);
}

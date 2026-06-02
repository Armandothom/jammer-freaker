import { SpriteName } from "../../../game/world-map/types/sprite-name.enum.js";

export const CombatShopTabType = {
    UPGRADES: "upgrades",
} as const;

export type CombatShopTabType =
    typeof CombatShopTabType[keyof typeof CombatShopTabType];

export type CombatShopTabConfig = {
    tabType: CombatShopTabType,
    label: string;
    order: number;
    spriteName: SpriteName;
    spriteActiveName?: SpriteName;
    width: number;
    height: number;
};

export const COMBAT_SHOP_TAB_CONFIG: Record<CombatShopTabType, CombatShopTabConfig> = {
    [CombatShopTabType.UPGRADES]: {
        tabType: CombatShopTabType.UPGRADES,
        label: "Upgrades",
        order: 0,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
};

export const COMBAT_SHOP_TABS_ORDER: CombatShopTabType[] = (
    Object.keys(COMBAT_SHOP_TAB_CONFIG) as CombatShopTabType[]
).sort((a, b) => {
    return COMBAT_SHOP_TAB_CONFIG[a].order - COMBAT_SHOP_TAB_CONFIG[b].order;
});

export function isCombatShopTabType(value: string): value is CombatShopTabType {
    return Object.prototype.hasOwnProperty.call(COMBAT_SHOP_TAB_CONFIG, value);
}

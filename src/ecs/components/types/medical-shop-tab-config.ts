import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";

export const MedicalShopTabType = {
    RESOURCES: "resources",
    UPGRADES: "upgrades",
} as const;

export type MedicalShopTabType =
    typeof MedicalShopTabType[keyof typeof MedicalShopTabType];

export type MedicalShopTabConfig = {
    tabType: MedicalShopTabType,
    label: string;
    order: number;
    spriteName: SpriteName;
    spriteActiveName?: SpriteName;
    width: number;
    height: number;
};

export const MEDICAL_SHOP_TAB_CONFIG: Record<MedicalShopTabType, MedicalShopTabConfig> = {
    [MedicalShopTabType.RESOURCES]: {
        tabType: MedicalShopTabType.RESOURCES,
        label: "Resources",
        order: 1,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
    [MedicalShopTabType.UPGRADES]: {
        tabType: MedicalShopTabType.UPGRADES,
        label: "Upgrades",
        order: 0,
        spriteName: SpriteName.BUTTON_2,
        spriteActiveName: SpriteName.BUTTON_2_SELECTED,
        width: 96,
        height: 32,
    },
};

export const MEDICAL_SHOP_TABS_ORDER: MedicalShopTabType[] = (
    Object.keys(MEDICAL_SHOP_TAB_CONFIG) as MedicalShopTabType[]
).sort((a, b) => {
    return MEDICAL_SHOP_TAB_CONFIG[a].order - MEDICAL_SHOP_TAB_CONFIG[b].order;
});

export function isMedicalShopTabType(value: string): value is MedicalShopTabType {
    return Object.prototype.hasOwnProperty.call(MEDICAL_SHOP_TAB_CONFIG, value);
}

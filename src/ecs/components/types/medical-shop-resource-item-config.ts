import { SpriteName } from "../../../game/world-map/types/sprite-name.enum.js";
import {
    InventoryResourceType
} from "./inventory-resource-type.js";

export const MedicalShopResourceItemType = {
    HEALPACK: "healpack",
    BANDAGE: "bandage",
    COMBAT_STIM: "combat_stim",
    EPIPEN: "epipen",
} as const;

export type MedicalShopResourceItemType =
    typeof MedicalShopResourceItemType[keyof typeof MedicalShopResourceItemType];

export type MedicalShopResourceItemConfig = {
    name: string,
    description: string,
    price: number;
    availableQuantity: number;
    resourceType: InventoryResourceType;
    resourceAmount: number;
    spriteName: SpriteName;
    width: number;
    height: number;
    order: number;
};

export const MEDICAL_SHOP_RESOURCE_ITEM_CONFIG: Record<
    MedicalShopResourceItemType,
    MedicalShopResourceItemConfig
> = {
    [MedicalShopResourceItemType.HEALPACK]: {
        name: "Field Dressing",
        description: "Heals 50 life.",
        price: 200,
        availableQuantity: 2,
        resourceType: InventoryResourceType.Healpack,
        resourceAmount: 1,
        spriteName: SpriteName.BLANK,
        width: 24,
        height: 24,
        order: 0,
    },
    [MedicalShopResourceItemType.BANDAGE]: {
        name: "Bandage",
        description: "Stops bleeding",
        price: 200,
        availableQuantity: 3,
        resourceType: InventoryResourceType.Bandage,
        resourceAmount: 1,
        spriteName: SpriteName.BLANK,
        width: 24,
        height: 24,
        order: 1,
    },
    [MedicalShopResourceItemType.COMBAT_STIM]: {
        name: "Military Enhancer",
        description: "Improves weapon spread recovery.",
        price: 500,
        availableQuantity: 3,
        resourceType: InventoryResourceType.CombatStim,
        resourceAmount: 1,
        spriteName: SpriteName.BLANK,
        width: 24,
        height: 24,
        order: 2,
    },
    [MedicalShopResourceItemType.EPIPEN]: {
        name: "Adrenaline Injection",
        description: "Deters staggers when hit. Increases movement speed.",
        price: 500,
        availableQuantity: 3,
        resourceType: InventoryResourceType.Epipen,
        resourceAmount: 1,
        spriteName: SpriteName.BLANK,
        width: 24,
        height: 24,
        order: 3,
    },
};

export const MEDICAL_SHOP_RESOURCE_ITEMS_ORDER: MedicalShopResourceItemType[] = (
    Object.keys(MEDICAL_SHOP_RESOURCE_ITEM_CONFIG) as MedicalShopResourceItemType[]
).sort((a, b) => {
    return MEDICAL_SHOP_RESOURCE_ITEM_CONFIG[a].order - MEDICAL_SHOP_RESOURCE_ITEM_CONFIG[b].order;
});

export function isMedicalShopResourceItemType(value: string): value is MedicalShopResourceItemType {
    return Object.prototype.hasOwnProperty.call(MEDICAL_SHOP_RESOURCE_ITEM_CONFIG, value);
}

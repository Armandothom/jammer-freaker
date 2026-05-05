import { InventoryResourceType } from "./inventory-resource-type.js";

export type MedicalItemType =
    | InventoryResourceType.Epipen
    | InventoryResourceType.CombatStim
    | InventoryResourceType.Healpack
    | InventoryResourceType.Bandage;

export type MedicalItemConfig = {
    useTime: number;
    healingQuantity: number;
    velocityIncreaseFactor: number;
    focusTimeReduceFactor: number;
    duration: number;
    maxSimultaneous: number;
};

export const MEDICAL_ITEM_CONFIG: Record<MedicalItemType, MedicalItemConfig> = {
    [InventoryResourceType.Epipen]: {
        useTime: 1,
        healingQuantity: 0,
        velocityIncreaseFactor: 1.5,
        focusTimeReduceFactor: 0,
        duration: 60,
        maxSimultaneous: 3,
    },
    [InventoryResourceType.CombatStim]: {
        useTime: 1,
        healingQuantity: 0,
        velocityIncreaseFactor: 0,
        focusTimeReduceFactor: 1.5,
        duration: 60,
        maxSimultaneous: 2,
    },
    [InventoryResourceType.Healpack]: {
        useTime: 3,
        healingQuantity: 50,
        velocityIncreaseFactor: 0,
        focusTimeReduceFactor: 0,
        duration: 0,
        maxSimultaneous: 0,
    },
    [InventoryResourceType.Bandage]: {
        useTime: 2,
        healingQuantity: 10,
        velocityIncreaseFactor: 0,
        focusTimeReduceFactor: 0,
        duration: 0,
        maxSimultaneous: 0,
    },
};

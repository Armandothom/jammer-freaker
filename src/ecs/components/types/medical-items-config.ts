import { InventoryResourceType } from "./inventory-resource-type.js";

export type MedicalItemType =
    | InventoryResourceType.Epipen
    | InventoryResourceType.CombatStim
    | InventoryResourceType.Healpack
    | InventoryResourceType.Bandage;

export type MedicalActiveEffectConfig = {
    maxDuration?: number;
    time?: number;
    runnningPrecision?: boolean;
    focusFireImprovement?: number;
    velocityIncreaseFactor?: number;
    undyingEffect?: boolean;
};

export type CombatStimEffectConfig = MedicalActiveEffectConfig;

export type EpipenEffectConfig = MedicalActiveEffectConfig;

export type MedicalItemConfig = {
    useTime: number;
    healingQuantity: number;
    velocityIncreaseFactor: number;
    focusTimeReduceFactor: number;
    duration: number;
    maxSimultaneous: number;
    effect?: MedicalActiveEffectConfig;
};

export const MEDICAL_ITEM_CONFIG: Record<MedicalItemType, MedicalItemConfig> = {
    [InventoryResourceType.Epipen]: {
        useTime: 1,
        healingQuantity: 0,
        velocityIncreaseFactor: 1.5,
        focusTimeReduceFactor: 0,
        duration: 60,
        maxSimultaneous: 3,
        effect: {
            velocityIncreaseFactor: 1.5,
            undyingEffect: true,
        },
    },
    [InventoryResourceType.CombatStim]: {
        useTime: 1,
        healingQuantity: 0,
        velocityIncreaseFactor: 0,
        focusTimeReduceFactor: 1.5,
        duration: 60,
        maxSimultaneous: 3,
        effect: {
            runnningPrecision: false,
            focusFireImprovement: 1.5,
        },
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

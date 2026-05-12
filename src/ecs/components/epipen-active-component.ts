import { InventoryResourceType } from "./types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG, type EpipenEffectConfig } from "./types/medical-items-config.js";

export type EpipenActiveEffect = {
    maxDuration: number;
    time: number;
    velocityIncreaseFactor: number;
    undyingEffect: boolean;
};

export class EpipenActiveComponent implements EpipenActiveEffect {
    public maxDuration: number;
    public time: number;
    public velocityIncreaseFactor: number;
    public undyingEffect: boolean;

    constructor(
        public activeSimultaneous: number,
        effect?: EpipenEffectConfig,
    ) {
        const config = MEDICAL_ITEM_CONFIG[InventoryResourceType.Epipen];
        const configuredEffect = effect ?? config.effect ?? {};

        this.maxDuration = configuredEffect.maxDuration ?? config.duration;
        this.time = configuredEffect.time ?? 0;
        this.velocityIncreaseFactor = configuredEffect.velocityIncreaseFactor ?? config.velocityIncreaseFactor;
        this.undyingEffect = configuredEffect.undyingEffect ?? config.effect?.undyingEffect ?? false;
    }
}

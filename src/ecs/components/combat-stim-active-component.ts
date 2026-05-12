import { InventoryResourceType } from "./types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG, type CombatStimEffectConfig } from "./types/medical-items-config.js";

export type CombatStimActiveEffect = {
    maxDuration: number;
    time: number;
    runnningPrecision: boolean;
    focusFireImprovement: number;
};

export class CombatStimActiveComponent implements CombatStimActiveEffect {
    public maxDuration: number;
    public time: number;
    public runnningPrecision: boolean;
    public focusFireImprovement: number;

    constructor(
        public activeSimultaneous: number,
        effect?: CombatStimEffectConfig,
    ) {
        const config = MEDICAL_ITEM_CONFIG[InventoryResourceType.CombatStim];
        const configuredEffect = effect ?? config.effect ?? {};

        this.maxDuration = configuredEffect.maxDuration ?? config.duration;
        this.time = configuredEffect.time ?? 0;
        this.runnningPrecision = configuredEffect.runnningPrecision ?? false;
        this.focusFireImprovement = configuredEffect.focusFireImprovement ?? config.focusTimeReduceFactor;
    }
}

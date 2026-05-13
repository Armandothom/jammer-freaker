import { InventoryResourceType } from "./types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG, type CombatStimEffectConfig } from "./types/medical-items-config.js";

export type CombatStimActiveEffect = {
    maxDuration: number;
    time: number;
    runnningPrecision: boolean;
    runAndGunCrosshairFollowFactor: number;
    runAndGunCameraLeadFactor: number;
    focusFireImprovement: number;
};

export class CombatStimActiveComponent implements CombatStimActiveEffect {
    public maxDuration: number;
    public time: number;
    public runnningPrecision: boolean;
    public runAndGunCrosshairFollowFactor: number;
    public runAndGunCameraLeadFactor: number;
    public focusFireImprovement: number;

    constructor(
        public activeSimultaneous: number,
        effect?: CombatStimEffectConfig,
    ) {
        const config = MEDICAL_ITEM_CONFIG[InventoryResourceType.CombatStim];
        const configuredEffect = {
            ...(config.effect ?? {}),
            ...(effect ?? {}),
        };

        this.maxDuration = configuredEffect.maxDuration ?? config.duration;
        this.time = configuredEffect.time ?? 0;
        this.runnningPrecision = configuredEffect.runnningPrecision ?? false;
        this.runAndGunCrosshairFollowFactor = configuredEffect.runAndGunCrosshairFollowFactor ?? (this.runnningPrecision ? 1 : 0);
        this.runAndGunCameraLeadFactor = configuredEffect.runAndGunCameraLeadFactor ?? (this.runnningPrecision ? 1 : 0);
        this.focusFireImprovement = configuredEffect.focusFireImprovement ?? config.focusTimeReduceFactor;
    }
}

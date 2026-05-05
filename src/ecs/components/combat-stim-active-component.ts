import { InventoryResourceType } from "./types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG } from "./types/medical-items-config.js";

export type CombatStimActiveEffect = {
    maxDuration: number;
    time: number;
};

export class CombatStimActiveComponent {
    public effects: CombatStimActiveEffect[];
    public activeSimultaneous: number;

    constructor(activeSimultaneous: number, effects?: CombatStimActiveEffect[]) {
        const config = MEDICAL_ITEM_CONFIG[InventoryResourceType.CombatStim];

        this.effects = effects ?? [{
            maxDuration: config.duration,
            time: 0,
        }];
        this.activeSimultaneous = activeSimultaneous
    }
}

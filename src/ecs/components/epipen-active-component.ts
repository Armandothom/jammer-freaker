import { InventoryResourceType } from "./types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG } from "./types/medical-items-config.js";

export type EpipenActiveEffect = {
    maxDuration: number;
    time: number;
};

export class EpipenActiveComponent {
    public effects: EpipenActiveEffect[];
    public activeSimultaneous: number;

    constructor(activeSimultaneous: number, effects?: EpipenActiveEffect[]) {
        const config = MEDICAL_ITEM_CONFIG[InventoryResourceType.Epipen];

        this.effects = effects ?? [{
            maxDuration: config.duration,
            time: 0,
        }];
        this.activeSimultaneous = activeSimultaneous;
    }
}

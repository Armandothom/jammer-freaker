import { BackpackType } from "./types/backpack-config.js";

export class BackpackUpgradeIntentComponent {
    constructor(
        public readonly nextBackpackType: BackpackType,
    ) { }
}

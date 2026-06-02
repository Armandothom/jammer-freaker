import { LootContainerType } from "../../game/world-map/loot/loot-container-config.js";

export class LootContainerComponent {
    public lootContainerType: LootContainerType
    constructor(
        public lootContainer: LootContainerType
    ) {
        this.lootContainerType = lootContainer
    }
}
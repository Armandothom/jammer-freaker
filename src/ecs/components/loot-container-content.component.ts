import type { LootTableItemId } from "../../game/world-map/loot/loot-tables.js";

export interface LootContainerLootSlot {
    itemId: LootTableItemId;
    amount: number;
}

export class LootContainerContentComponent {
    public lootSlots: Array<LootContainerLootSlot | null>;
    public maxLootSlots: number;

    constructor(
        lootSlots: readonly LootContainerLootSlot[] = [],
        maxLootSlots: number = lootSlots.length,
    ) {
        this.lootSlots = lootSlots.map((lootSlot) => ({
            itemId: lootSlot.itemId,
            amount: lootSlot.amount,
        }));
        this.maxLootSlots = Math.max(0, Math.floor(maxLootSlots));
    }
}

import type { LootContainerLootSlot } from "../loot-container-content.component.js";

export class StorageSnapshot {
    public readonly lootSlots: ReadonlyArray<LootContainerLootSlot | null>;
    public readonly maxLootSlots: number;

    constructor(
        lootSlots: readonly (LootContainerLootSlot | null | undefined)[] = [],
        maxLootSlots: number = lootSlots.length,
    ) {
        this.maxLootSlots = Math.max(0, Math.floor(maxLootSlots));
        this.lootSlots = Array.from({ length: this.maxLootSlots }, (_value, slotIndex) => {
            const lootSlot = lootSlots[slotIndex] ?? null;

            return lootSlot
                ? {
                    amount: lootSlot.amount,
                    itemId: lootSlot.itemId,
                }
                : null;
        });
    }
}

import type { LootContainerLootSlot } from "../loot-container-content.component.js";
import type { QuestId } from "../types/quest-config.js";

export type QuestObjectiveProgressSnapshot = {
    completedQuantity: number;
    objectiveIndex: number;
    questId: QuestId;
};

export class QuestSnapshot {
    public readonly activeQuestIds: ReadonlyArray<QuestId>;
    public readonly completedQuestIds: ReadonlyArray<QuestId>;
    public readonly deliveryLootSlots: ReadonlyArray<LootContainerLootSlot | null>;
    public readonly objectiveProgress: ReadonlyArray<QuestObjectiveProgressSnapshot>;

    constructor(
        activeQuestIds: readonly QuestId[] = [],
        completedQuestIds: readonly QuestId[] = [],
        deliveryLootSlots: readonly (LootContainerLootSlot | null | undefined)[] = [],
        objectiveProgress: readonly QuestObjectiveProgressSnapshot[] = [],
    ) {
        this.activeQuestIds = [...activeQuestIds];
        this.completedQuestIds = [...completedQuestIds];
        this.deliveryLootSlots = deliveryLootSlots.map((lootSlot) => {
            return lootSlot
                ? {
                    amount: lootSlot.amount,
                    itemId: lootSlot.itemId,
                }
                : null;
        });
        this.objectiveProgress = objectiveProgress.map((progress) => ({
            completedQuantity: progress.completedQuantity,
            objectiveIndex: progress.objectiveIndex,
            questId: progress.questId,
        }));
    }
}

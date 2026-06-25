import {
    QuestSnapshot,
    type QuestObjectiveProgressSnapshot,
} from "./snapshots/quest-snapshot.js";
import type { LootContainerLootSlot } from "./loot-container-content.component.js";
import type { QuestObjectiveCompletedIntentComponent } from "./quest-objective-completed-intent.component.js";
import {
    QUEST_CONFIG,
    type QuestId,
} from "./types/quest-config.js";

export class ActiveQuestComponent {
    private activeQuestIds: QuestId[];
    private completedQuestIds: QuestId[];
    private deliveryLootSlots: Array<LootContainerLootSlot | null>;
    private objectiveProgressByQuestId = new Map<QuestId, number[]>();

    constructor(activeQuestIds: readonly QuestId[] = [], completedQuestIds: readonly QuestId[] = []) {
        this.activeQuestIds = normalizeQuestIds(activeQuestIds);
        this.completedQuestIds = normalizeQuestIds(completedQuestIds);
        this.deliveryLootSlots = [];
    }

    public applyQuestSnapshot(snapshot: QuestSnapshot | null): void {
        this.completedQuestIds = normalizeQuestIds(snapshot?.completedQuestIds ?? []);
        const completedQuestIds = new Set(this.completedQuestIds);
        this.activeQuestIds = normalizeQuestIds(snapshot?.activeQuestIds ?? [])
            .filter((questId) => !completedQuestIds.has(questId));
        this.deliveryLootSlots = (snapshot?.deliveryLootSlots ?? []).map((lootSlot) => {
            return lootSlot ? { ...lootSlot } : null;
        });
        this.objectiveProgressByQuestId = normalizeObjectiveProgress(snapshot?.objectiveProgress ?? []);
        this.clearCompletedQuestProgress();
    }

    public getActiveQuestIds(): readonly QuestId[] {
        return this.activeQuestIds;
    }

    public getCompletedQuestIds(): readonly QuestId[] {
        return this.completedQuestIds;
    }

    public getObjectiveProgress(questId: QuestId, objectiveIndex: number): number {
        return this.objectiveProgressByQuestId.get(questId)?.[objectiveIndex] ?? 0;
    }

    public applyObjectiveCompletedIntent(intent: QuestObjectiveCompletedIntentComponent): boolean {
        if (this.activeQuestIds.indexOf(intent.questId) === -1
            || this.completedQuestIds.indexOf(intent.questId) !== -1
        ) {
            return false;
        }

        const quest = QUEST_CONFIG[intent.questId];
        const objective = quest.objectives[intent.objectiveIndex];

        if (!objective) {
            return false;
        }

        const objectiveProgress = this.getMutableObjectiveProgress(intent.questId);
        const nextQuantity = Math.min(
            objective.quantity,
            Math.max(0, objectiveProgress[intent.objectiveIndex] ?? 0) + Math.max(0, intent.completedQuantity),
        );
        objectiveProgress[intent.objectiveIndex] = nextQuantity;

        if (this.isQuestComplete(intent.questId)) {
            this.completeQuest(intent.questId);
        }

        return true;
    }

    public createQuestSnapshot(): QuestSnapshot {
        return new QuestSnapshot(
            this.activeQuestIds,
            this.completedQuestIds,
            this.deliveryLootSlots,
            this.createObjectiveProgressSnapshot(),
        );
    }

    private getMutableObjectiveProgress(questId: QuestId): number[] {
        const existingProgress = this.objectiveProgressByQuestId.get(questId);

        if (existingProgress) {
            return existingProgress;
        }

        const progress = new Array(QUEST_CONFIG[questId].objectives.length).fill(0);
        this.objectiveProgressByQuestId.set(questId, progress);
        return progress;
    }

    private isQuestComplete(questId: QuestId): boolean {
        const quest = QUEST_CONFIG[questId];

        if (quest.objectives.length === 0) {
            return true;
        }

        const progress = this.objectiveProgressByQuestId.get(questId) ?? [];

        return quest.objectives.every((objective, objectiveIndex) => {
            return (progress[objectiveIndex] ?? 0) >= objective.quantity;
        });
    }

    private completeQuest(questId: QuestId): void {
        this.activeQuestIds = this.activeQuestIds.filter((activeQuestId) => activeQuestId !== questId);

        if (this.completedQuestIds.indexOf(questId) === -1) {
            this.completedQuestIds.push(questId);
        }

        this.objectiveProgressByQuestId.delete(questId);
    }

    private clearCompletedQuestProgress(): void {
        for (const questId of this.completedQuestIds) {
            this.objectiveProgressByQuestId.delete(questId);
        }
    }

    private createObjectiveProgressSnapshot(): QuestObjectiveProgressSnapshot[] {
        const snapshot: QuestObjectiveProgressSnapshot[] = [];

        for (const [questId, progressByObjective] of this.objectiveProgressByQuestId.entries()) {
            if (this.activeQuestIds.indexOf(questId) === -1) {
                continue;
            }

            progressByObjective.forEach((completedQuantity, objectiveIndex) => {
                if (completedQuantity <= 0) {
                    return;
                }

                snapshot.push({
                    completedQuantity,
                    objectiveIndex,
                    questId,
                });
            });
        }

        return snapshot;
    }
}

function normalizeQuestIds(questIds: readonly QuestId[]): QuestId[] {
    return questIds.filter((questId) => {
        return Object.prototype.hasOwnProperty.call(QUEST_CONFIG, questId);
    });
}

function normalizeObjectiveProgress(
    objectiveProgress: readonly QuestObjectiveProgressSnapshot[],
): Map<QuestId, number[]> {
    const progressByQuestId = new Map<QuestId, number[]>();

    for (const progress of objectiveProgress) {
        if (!Object.prototype.hasOwnProperty.call(QUEST_CONFIG, progress.questId)) {
            continue;
        }

        const quest = QUEST_CONFIG[progress.questId];

        if (!Number.isInteger(progress.objectiveIndex)
            || progress.objectiveIndex < 0
            || progress.objectiveIndex >= quest.objectives.length
        ) {
            continue;
        }

        const objective = quest.objectives[progress.objectiveIndex];
        const completedQuantity = Math.max(
            0,
            Math.min(objective.quantity, Math.floor(progress.completedQuantity)),
        );

        if (completedQuantity <= 0) {
            continue;
        }

        const questProgress = progressByQuestId.get(progress.questId)
            ?? new Array(quest.objectives.length).fill(0);
        questProgress[progress.objectiveIndex] = Math.max(
            questProgress[progress.objectiveIndex] ?? 0,
            completedQuantity,
        );
        progressByQuestId.set(progress.questId, questProgress);
    }

    return progressByQuestId;
}

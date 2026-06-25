import type { LootTableItemId } from "../../../game/world-map/loot/loot-tables.js";
import { InventoryManager } from "../../core/inventory-manager.js";
import { InventoryComponent } from "../inventory-component.js";
import type { LootContainerLootSlot } from "../loot-container-content.component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
import {
    QuestSnapshot,
    type QuestObjectiveProgressSnapshot,
} from "../snapshots/quest-snapshot.js";
import { StorageSnapshot } from "../snapshots/storage-snapshot.js";
import {
    clampInventoryResourceAmount,
    INVENTORY_RESOURCE_TYPES,
    InventoryResourceType,
    isInventoryResourceType,
} from "../types/inventory-resource-type.js";
import {
    clampMiscResourceAmount,
    isMiscResourceType,
    MISC_RESOURCE_TYPES,
} from "../types/misc-resource-type.js";
import { getLootItemCategory } from "../types/loot-item-category.js";
import {
    QUEST_CONFIG,
    QUEST_TRADER,
    QUEST_TRADER_QUEST_IDS,
    QuestType,
    type QuestConfigEntry,
    type QuestId,
    type QuestTrader,
} from "../types/quest-config.js";

export const QUEST_SOURCE_TAB = {
    BACKPACK: "backpack",
    CAMP_STORAGE: "camp_storage",
} as const;

export type QuestSourceTab = typeof QUEST_SOURCE_TAB[keyof typeof QUEST_SOURCE_TAB];
export type QuestItemPlacementSource = "storage" | "inventory" | "delivery";

export const QUEST_STORAGE_COLUMN_COUNT = 4;
export const QUEST_STORAGE_ROW_COUNT = 8;
export const QUEST_STORAGE_MAX_SLOTS = QUEST_STORAGE_COLUMN_COUNT * QUEST_STORAGE_ROW_COUNT;
export const QUEST_DELIVERY_COLUMN_COUNT = 2;
export const QUEST_DELIVERY_ROW_COUNT = 2;
export const QUEST_DELIVERY_SLOT_COUNT = QUEST_DELIVERY_COLUMN_COUNT * QUEST_DELIVERY_ROW_COUNT;

export type QuestItemDragState = {
    item: LootContainerLootSlot;
    pointerX: number;
    pointerY: number;
    source: QuestItemPlacementSource;
    slotIndex: number;
};

type QuestItemStack = {
    itemId: LootTableItemId;
    amount: number;
};

export class QuestState {
    private readonly inventoryManager = new InventoryManager();
    private workingInventory: InventoryComponent | null = null;
    private storageLootSlots: Array<LootContainerLootSlot | null> = this.createEmptyStorageSlots();
    private deliveryLootSlots: Array<LootContainerLootSlot | null> = this.createEmptyDeliverySlots();
    private backpackPlacementItemIds: Array<LootTableItemId | null> = [];
    private activeQuestIds = new Set<QuestId>();
    private completedQuestIds = new Set<QuestId>();
    private objectiveProgressByQuestId = new Map<QuestId, number[]>();
    private activeTrader: QuestTrader = QUEST_TRADER.DIGNITAS;
    private activeSourceTab: QuestSourceTab = QUEST_SOURCE_TAB.CAMP_STORAGE;
    private deliveryPopupOpen = false;
    private dragState: QuestItemDragState | null = null;
    private hoveredSource: QuestItemPlacementSource | null = null;
    private hoveredSlotIndex: number | null = null;
    private selectedSource: QuestItemPlacementSource | null = null;
    private selectedSlotIndex: number | null = null;

    public applyInventorySnapshot(snapshot: InventorySnapshot | null): void {
        this.workingInventory = snapshot
            ? InventoryComponent.fromSnapshot(snapshot)
            : null;
        this.normalizeBackpackPlacement(this.getBackpackMaxSlots());
    }

    public applyQuestSnapshot(snapshot: QuestSnapshot | null): void {
        this.completedQuestIds = new Set((snapshot?.completedQuestIds ?? []).filter(isQuestId));
        this.activeQuestIds = new Set((snapshot?.activeQuestIds ?? []).filter((questId) => {
            return isQuestId(questId) && !this.completedQuestIds.has(questId);
        }));
        this.objectiveProgressByQuestId = normalizeObjectiveProgress(snapshot?.objectiveProgress ?? []);
        this.clearCompletedQuestProgress();
        this.deliveryLootSlots = Array.from({ length: QUEST_DELIVERY_SLOT_COUNT }, (_value, slotIndex) => {
            return normalizeLootSlot(snapshot?.deliveryLootSlots[slotIndex] ?? null);
        });
    }

    public applyStorageSnapshot(snapshot: StorageSnapshot | null): void {
        const sourceSlots = snapshot?.lootSlots ?? [];
        this.storageLootSlots = Array.from({ length: QUEST_STORAGE_MAX_SLOTS }, (_value, slotIndex) => {
            return normalizeLootSlot(sourceSlots[slotIndex] ?? null);
        });
    }

    public beginItemDrag(
        source: QuestItemPlacementSource,
        slotIndex: number,
        pointerX: number,
        pointerY: number,
    ): boolean {
        const lootSlot = this.getSlotLootSlot(source, slotIndex);

        if (!lootSlot || !Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
            this.clearItemDrag();
            return false;
        }

        this.dragState = {
            item: {
                amount: lootSlot.amount,
                itemId: lootSlot.itemId,
            },
            pointerX,
            pointerY,
            source,
            slotIndex,
        };
        return true;
    }

    public clearItemDrag(): void {
        this.dragState = null;
    }

    public createInventorySnapshot(): InventorySnapshot | null {
        if (!this.workingInventory) {
            return null;
        }

        return this.inventoryManager.createSnapshot(this.workingInventory);
    }

    public createQuestSnapshot(): QuestSnapshot {
        return new QuestSnapshot(
            [...this.activeQuestIds],
            [...this.completedQuestIds],
            this.deliveryLootSlots,
            this.createObjectiveProgressSnapshot(),
        );
    }

    public createStorageSnapshot(): StorageSnapshot {
        return new StorageSnapshot(this.storageLootSlots, QUEST_STORAGE_MAX_SLOTS);
    }

    public finishDrag(
        targetSource: QuestItemPlacementSource,
        targetSlotIndex: number,
    ): boolean {
        const drag = this.dragState;

        if (!drag) {
            return false;
        }

        let moved = false;

        switch (targetSource) {
            case "delivery":
                moved = drag.source === "delivery"
                    ? this.moveDeliverySlot(drag.slotIndex, targetSlotIndex)
                    : this.moveSourceSlotToDeliverySlot(drag.source, drag.slotIndex, targetSlotIndex);
                break;

            case "storage":
                if (drag.source === "delivery") {
                    moved = this.takeDeliverySlotToStorageSlot(drag.slotIndex, targetSlotIndex);
                } else if (drag.source === "storage") {
                    moved = this.moveStorageSlot(drag.slotIndex, targetSlotIndex);
                }
                break;

            case "inventory":
                if (drag.source === "delivery") {
                    moved = this.takeDeliverySlotToInventorySlot(drag.slotIndex, targetSlotIndex);
                } else if (drag.source === "inventory") {
                    moved = this.moveBackpackSlot(drag.slotIndex, targetSlotIndex);
                }
                break;
        }

        this.clearItemDrag();
        return moved;
    }

    public getActiveItemDrag(): QuestItemDragState | null {
        if (!this.dragState) {
            return null;
        }

        return {
            item: {
                amount: this.dragState.item.amount,
                itemId: this.dragState.item.itemId,
            },
            pointerX: this.dragState.pointerX,
            pointerY: this.dragState.pointerY,
            source: this.dragState.source,
            slotIndex: this.dragState.slotIndex,
        };
    }

    public getActiveSourceTab(): QuestSourceTab {
        return this.activeSourceTab;
    }

    public getActiveTrader(): QuestTrader {
        return this.activeTrader;
    }

    public getBackpackMaxSlots(): number {
        if (!this.workingInventory) {
            return 0;
        }

        return this.inventoryManager.getBackpackMaxSlots(this.workingInventory);
    }

    public getBackpackSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
        const inventory = this.workingInventory;

        if (!inventory) {
            return null;
        }

        const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
        const itemStack = this.getBackpackSlotItemStackForInventory(
            inventory,
            slotIndex,
            backpackMaxSlots,
        );

        return itemStack
            ? {
                amount: itemStack.amount,
                itemId: itemStack.itemId,
            }
            : null;
    }

    public getCurrentQuest(): { id: QuestId; config: QuestConfigEntry } | null {
        const questId = this.getCurrentQuestId();

        return questId
            ? {
                config: QUEST_CONFIG[questId],
                id: questId,
            }
            : null;
    }

    public getObjectiveProgress(questId: QuestId, objectiveIndex: number): number {
        return this.objectiveProgressByQuestId.get(questId)?.[objectiveIndex] ?? 0;
    }

    public getDeliverySlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
        return this.getArraySlotLootSlot(this.deliveryLootSlots, slotIndex, QUEST_DELIVERY_SLOT_COUNT);
    }

    public getFinalPreviewQuest(): { id: QuestId; config: QuestConfigEntry } | null {
        const currentQuestId = this.getCurrentQuestId();
        const questIds = QUEST_TRADER_QUEST_IDS[this.activeTrader];

        if (!currentQuestId) {
            return null;
        }

        const currentIndex = questIds.indexOf(currentQuestId);
        const nextQuestId = currentIndex >= 0
            ? questIds[currentIndex + 1]
            : undefined;

        if (!nextQuestId || QUEST_CONFIG[nextQuestId].type !== QuestType.FINAL) {
            return null;
        }

        return {
            config: QUEST_CONFIG[nextQuestId],
            id: nextQuestId,
        };
    }

    public getHoveredItemName(): string {
        const source = this.hoveredSource ?? this.selectedSource;
        const slotIndex = this.hoveredSlotIndex ?? this.selectedSlotIndex;

        if (!source || slotIndex == null) {
            return "";
        }

        const lootSlot = this.getSlotLootSlot(source, slotIndex);

        return lootSlot ? formatLootItemName(lootSlot.itemId) : "";
    }

    public getStorageSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
        return this.getArraySlotLootSlot(this.storageLootSlots, slotIndex, QUEST_STORAGE_MAX_SLOTS);
    }

    public isCurrentQuestStarted(): boolean {
        const questId = this.getCurrentQuestId();

        return questId !== null && this.activeQuestIds.has(questId);
    }

    public isDeliveryPopupOpen(): boolean {
        return this.deliveryPopupOpen;
    }

    public isSourceSlotBeingDragged(
        source: QuestItemPlacementSource,
        slotIndex: number,
    ): boolean {
        return this.dragState?.source === source
            && this.dragState.slotIndex === slotIndex;
    }

    public openForTrader(trader: QuestTrader): void {
        this.activeTrader = trader;
        this.activeSourceTab = QUEST_SOURCE_TAB.CAMP_STORAGE;
        this.deliveryPopupOpen = false;
        this.clearTransientState();
    }

    public reset(): void {
        this.workingInventory = null;
        this.storageLootSlots = this.createEmptyStorageSlots();
        this.deliveryLootSlots = this.createEmptyDeliverySlots();
        this.backpackPlacementItemIds = [];
        this.activeQuestIds.clear();
        this.completedQuestIds.clear();
        this.objectiveProgressByQuestId.clear();
        this.activeTrader = QUEST_TRADER.DIGNITAS;
        this.activeSourceTab = QUEST_SOURCE_TAB.CAMP_STORAGE;
        this.deliveryPopupOpen = false;
        this.clearTransientState();
    }

    public selectSourceTab(tab: QuestSourceTab): void {
        this.activeSourceTab = tab;

        if (this.hoveredSource === "storage" && tab !== QUEST_SOURCE_TAB.CAMP_STORAGE) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.hoveredSource === "inventory" && tab !== QUEST_SOURCE_TAB.BACKPACK) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.selectedSource === "storage" && tab !== QUEST_SOURCE_TAB.CAMP_STORAGE) {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }

        if (this.selectedSource === "inventory" && tab !== QUEST_SOURCE_TAB.BACKPACK) {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }
    }

    public setHoveredSlot(
        source: QuestItemPlacementSource | null,
        slotIndex: number | null,
    ): void {
        if (!source || slotIndex == null || !this.isSlotIndexInRange(source, slotIndex)) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
            return;
        }

        this.hoveredSource = source;
        this.hoveredSlotIndex = slotIndex;
    }

    public setItemDragPointer(pointerX: number, pointerY: number): void {
        if (!this.dragState) {
            return;
        }

        this.dragState = {
            ...this.dragState,
            pointerX,
            pointerY,
        };
    }

    public submitCurrentQuestAction(): boolean {
        const currentQuest = this.getCurrentQuest();

        if (!currentQuest) {
            return false;
        }

        if (!this.activeQuestIds.has(currentQuest.id)) {
            this.activeQuestIds.add(currentQuest.id);
            return true;
        }

        if (currentQuest.config.type === QuestType.COLLECTOR) {
            this.deliveryPopupOpen = true;
            this.clearTransientState();
            return true;
        }

        return this.canCompleteProgressQuest(currentQuest.id, currentQuest.config)
            ? this.completeCurrentQuest()
            : false;
    }

    public submitDeliveryItems(): boolean {
        const currentQuest = this.getCurrentQuest();

        if (!currentQuest || !this.activeQuestIds.has(currentQuest.id)) {
            return false;
        }

        if (
            currentQuest.config.type === QuestType.COLLECTOR
            && !this.canCompleteCollectorQuest(currentQuest.config)
        ) {
            return false;
        }

        return this.completeCurrentQuest();
    }

    public transferSlot(source: QuestItemPlacementSource, slotIndex: number): boolean {
        if (source === "delivery") {
            return this.takeDeliverySlotToActiveSource(slotIndex);
        }

        return this.moveSourceSlotToFirstDeliverySlot(source, slotIndex);
    }

    private addLootItemToBackpackSlot(
        itemId: LootTableItemId,
        amount: number,
        targetSlotIndex: number,
    ): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);

        if (!this.isBackpackSlotIndexInRange(targetSlotIndex, backpackMaxSlots)
            || !this.isBackpackSlotEmptyForInventory(inventory, targetSlotIndex, backpackMaxSlots)) {
            return false;
        }

        if (!this.inventoryManager.addLootItem(inventory, itemId, amount)) {
            return false;
        }

        this.bindItemToBackpackSlot(itemId, targetSlotIndex, backpackMaxSlots);
        return true;
    }

    private bindItemToBackpackSlot(
        itemId: LootTableItemId,
        slotIndex: number,
        backpackMaxSlots: number,
    ): void {
        this.normalizeBackpackPlacement(backpackMaxSlots);

        for (let currentSlotIndex = 0; currentSlotIndex < backpackMaxSlots; currentSlotIndex++) {
            if (this.backpackPlacementItemIds[currentSlotIndex] !== itemId) {
                continue;
            }

            this.backpackPlacementItemIds[currentSlotIndex] = null;
        }

        this.backpackPlacementItemIds[slotIndex] = itemId;
    }

    private buildBackpackItemStacks(inventory: InventoryComponent): QuestItemStack[] {
        const itemStacks: QuestItemStack[] = [];

        for (const resourceType of INVENTORY_RESOURCE_TYPES) {
            if (resourceType === InventoryResourceType.Money) {
                continue;
            }

            const amount = this.inventoryManager.getResourceAmount(inventory, resourceType);

            if (amount > 0) {
                itemStacks.push({
                    amount,
                    itemId: resourceType,
                });
            }
        }

        for (const miscResourceType of MISC_RESOURCE_TYPES) {
            if (this.inventoryManager.resolveBackpackUpgradeType(miscResourceType) !== null) {
                continue;
            }

            const amount = this.inventoryManager.getMiscResourceAmount(inventory, miscResourceType);

            if (amount > 0) {
                itemStacks.push({
                    amount,
                    itemId: miscResourceType,
                });
            }
        }

        return itemStacks;
    }

    private buildPlacedBackpackItemStacks(
        inventory: InventoryComponent,
        backpackMaxSlots: number,
    ): Array<QuestItemStack | null> {
        const itemStacks = this.buildBackpackItemStacks(inventory);
        const itemStackById = new Map<LootTableItemId, QuestItemStack>();

        for (const itemStack of itemStacks) {
            itemStackById.set(itemStack.itemId, itemStack);
        }

        this.normalizeBackpackPlacement(backpackMaxSlots);

        const placedItemStacks = new Array<QuestItemStack | null>(backpackMaxSlots).fill(null);
        const placedItemIds = new Set<LootTableItemId>();

        for (let slotIndex = 0; slotIndex < backpackMaxSlots; slotIndex++) {
            const placedItemId = this.backpackPlacementItemIds[slotIndex] ?? null;

            if (placedItemId === null) {
                continue;
            }

            const itemStack = itemStackById.get(placedItemId) ?? null;

            if (!itemStack || placedItemIds.has(placedItemId)) {
                this.backpackPlacementItemIds[slotIndex] = null;
                continue;
            }

            placedItemStacks[slotIndex] = itemStack;
            placedItemIds.add(placedItemId);
        }

        for (const itemStack of itemStacks) {
            if (placedItemIds.has(itemStack.itemId)) {
                continue;
            }

            const emptySlotIndex = placedItemStacks.findIndex((slot) => slot === null);

            if (emptySlotIndex === -1) {
                break;
            }

            placedItemStacks[emptySlotIndex] = itemStack;
            this.backpackPlacementItemIds[emptySlotIndex] = itemStack.itemId;
            placedItemIds.add(itemStack.itemId);
        }

        return placedItemStacks;
    }

    private clearBackpackSlotBinding(slotIndex: number, backpackMaxSlots: number): void {
        if (!this.isBackpackSlotIndexInRange(slotIndex, backpackMaxSlots)) {
            return;
        }

        this.normalizeBackpackPlacement(backpackMaxSlots);
        this.backpackPlacementItemIds[slotIndex] = null;
    }

    private clearDeliverySlot(slotIndex: number): void {
        if (!this.isDeliverySlotIndexInRange(slotIndex)) {
            return;
        }

        this.deliveryLootSlots[slotIndex] = null;

        if (this.hoveredSource === "delivery" && this.hoveredSlotIndex === slotIndex) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.selectedSource === "delivery" && this.selectedSlotIndex === slotIndex) {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }
    }

    private clearStorageSlot(slotIndex: number): void {
        if (!this.isStorageSlotIndexInRange(slotIndex)) {
            return;
        }

        this.storageLootSlots[slotIndex] = null;

        if (this.hoveredSource === "storage" && this.hoveredSlotIndex === slotIndex) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.selectedSource === "storage" && this.selectedSlotIndex === slotIndex) {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }
    }

    private clearTransientState(): void {
        this.dragState = null;
        this.hoveredSource = null;
        this.hoveredSlotIndex = null;
        this.selectedSource = null;
        this.selectedSlotIndex = null;
    }

    private canCompleteCollectorQuest(quest: QuestConfigEntry): boolean {
        return quest.objectives.every((objective) => {
            if (!("item" in objective) && !("category" in objective)) {
                return true;
            }

            return this.getDeliveredObjectiveAmount(objective) >= objective.quantity;
        });
    }

    private canCompleteProgressQuest(questId: QuestId, quest: QuestConfigEntry): boolean {
        if (quest.objectives.length === 0) {
            return true;
        }

        const progress = this.objectiveProgressByQuestId.get(questId) ?? [];

        return quest.objectives.every((objective, objectiveIndex) => {
            return (progress[objectiveIndex] ?? 0) >= objective.quantity;
        });
    }

    private completeCurrentQuest(): boolean {
        const currentQuestId = this.getCurrentQuestId();

        if (!currentQuestId) {
            return false;
        }

        this.activeQuestIds.delete(currentQuestId);
        this.completedQuestIds.add(currentQuestId);
        this.objectiveProgressByQuestId.delete(currentQuestId);
        this.deliveryLootSlots = this.createEmptyDeliverySlots();
        this.deliveryPopupOpen = false;
        this.clearTransientState();
        return true;
    }

    private clearCompletedQuestProgress(): void {
        for (const questId of this.completedQuestIds) {
            this.objectiveProgressByQuestId.delete(questId);
        }
    }

    private createObjectiveProgressSnapshot(): QuestObjectiveProgressSnapshot[] {
        const snapshot: QuestObjectiveProgressSnapshot[] = [];

        for (const [questId, progressByObjective] of this.objectiveProgressByQuestId.entries()) {
            if (!this.activeQuestIds.has(questId)) {
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

    private createEmptyDeliverySlots(): Array<LootContainerLootSlot | null> {
        return new Array<LootContainerLootSlot | null>(QUEST_DELIVERY_SLOT_COUNT).fill(null);
    }

    private createEmptyStorageSlots(): Array<LootContainerLootSlot | null> {
        return new Array<LootContainerLootSlot | null>(QUEST_STORAGE_MAX_SLOTS).fill(null);
    }

    private findFirstEmptyDeliverySlotIndex(): number | null {
        const slotIndex = this.deliveryLootSlots.findIndex((lootSlot) => !lootSlot);

        return slotIndex === -1 ? null : slotIndex;
    }

    private findFirstEmptyStorageSlotIndex(): number | null {
        const slotIndex = this.storageLootSlots.findIndex((lootSlot) => !lootSlot);

        return slotIndex === -1 ? null : slotIndex;
    }

    private getArraySlotLootSlot(
        lootSlots: ReadonlyArray<LootContainerLootSlot | null>,
        slotIndex: number,
        maxSlots: number,
    ): LootContainerLootSlot | null {
        if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= maxSlots) {
            return null;
        }

        const lootSlot = lootSlots[slotIndex] ?? null;

        return lootSlot
            ? {
                amount: lootSlot.amount,
                itemId: lootSlot.itemId,
            }
            : null;
    }

    private getBackpackSlotItemStackForInventory(
        inventory: InventoryComponent,
        slotIndex: number,
        backpackMaxSlots: number,
    ): QuestItemStack | null {
        if (!this.isBackpackSlotIndexInRange(slotIndex, backpackMaxSlots)) {
            return null;
        }

        return this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots)[slotIndex] ?? null;
    }

    private getCurrentQuestId(): QuestId | null {
        const questIds = QUEST_TRADER_QUEST_IDS[this.activeTrader];

        for (const questId of questIds) {
            if (!this.completedQuestIds.has(questId)) {
                return questId;
            }
        }

        return null;
    }

    private getDeliveredObjectiveAmount(
        objective: QuestConfigEntry["objectives"][number],
    ): number {
        let amount = 0;

        for (const lootSlot of this.deliveryLootSlots) {
            if (!lootSlot || !this.isLootSlotMatchingObjective(lootSlot, objective)) {
                continue;
            }

            amount += lootSlot.amount;
        }

        return amount;
    }

    private getSlotLootSlot(
        source: QuestItemPlacementSource,
        slotIndex: number,
    ): LootContainerLootSlot | null {
        switch (source) {
            case "storage":
                return this.getStorageSlotLootSlot(slotIndex);

            case "inventory":
                return this.getBackpackSlotLootSlot(slotIndex);

            case "delivery":
                return this.getDeliverySlotLootSlot(slotIndex);
        }
    }

    private isBackpackSlotEmptyForInventory(
        inventory: InventoryComponent,
        slotIndex: number,
        backpackMaxSlots: number,
    ): boolean {
        return this.getBackpackSlotItemStackForInventory(
            inventory,
            slotIndex,
            backpackMaxSlots,
        ) === null;
    }

    private isBackpackSlotIndexInRange(slotIndex: number, backpackMaxSlots: number): boolean {
        return Number.isInteger(slotIndex)
            && slotIndex >= 0
            && slotIndex < backpackMaxSlots;
    }

    private isDeliverySlotIndexInRange(slotIndex: number): boolean {
        return Number.isInteger(slotIndex)
            && slotIndex >= 0
            && slotIndex < QUEST_DELIVERY_SLOT_COUNT;
    }

    private isLootSlotMatchingObjective(
        lootSlot: LootContainerLootSlot,
        objective: QuestConfigEntry["objectives"][number],
    ): boolean {
        if ("item" in objective) {
            return lootSlot.itemId === objective.item;
        }

        if ("category" in objective) {
            return getLootItemCategory(lootSlot.itemId) === objective.category;
        }

        return false;
    }

    private isSlotIndexInRange(
        source: QuestItemPlacementSource,
        slotIndex: number,
    ): boolean {
        switch (source) {
            case "storage":
                return this.isStorageSlotIndexInRange(slotIndex);

            case "inventory":
                return this.isBackpackSlotIndexInRange(slotIndex, this.getBackpackMaxSlots());

            case "delivery":
                return this.isDeliverySlotIndexInRange(slotIndex);
        }
    }

    private isStorageSlotIndexInRange(slotIndex: number): boolean {
        return Number.isInteger(slotIndex)
            && slotIndex >= 0
            && slotIndex < QUEST_STORAGE_MAX_SLOTS;
    }

    private moveBackpackSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);

        if (!this.isBackpackSlotIndexInRange(sourceSlotIndex, backpackMaxSlots)
            || !this.isBackpackSlotIndexInRange(targetSlotIndex, backpackMaxSlots)) {
            return false;
        }

        if (sourceSlotIndex === targetSlotIndex) {
            return true;
        }

        const sourceItemStack = this.getBackpackSlotItemStackForInventory(
            inventory,
            sourceSlotIndex,
            backpackMaxSlots,
        );

        if (!sourceItemStack
            || !this.isBackpackSlotEmptyForInventory(inventory, targetSlotIndex, backpackMaxSlots)) {
            return false;
        }

        this.clearBackpackSlotBinding(sourceSlotIndex, backpackMaxSlots);
        this.bindItemToBackpackSlot(sourceItemStack.itemId, targetSlotIndex, backpackMaxSlots);
        return true;
    }

    private moveDeliverySlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        return this.moveSlotWithinArray(this.deliveryLootSlots, sourceSlotIndex, targetSlotIndex, "delivery");
    }

    private moveSlotWithinArray(
        lootSlots: Array<LootContainerLootSlot | null>,
        sourceSlotIndex: number,
        targetSlotIndex: number,
        selectedSource: QuestItemPlacementSource,
    ): boolean {
        if (!Number.isInteger(sourceSlotIndex)
            || !Number.isInteger(targetSlotIndex)
            || sourceSlotIndex < 0
            || targetSlotIndex < 0
            || sourceSlotIndex >= lootSlots.length
            || targetSlotIndex >= lootSlots.length) {
            return false;
        }

        if (sourceSlotIndex === targetSlotIndex) {
            return !!lootSlots[sourceSlotIndex];
        }

        const sourceLootSlot = lootSlots[sourceSlotIndex] ?? null;

        if (!sourceLootSlot || lootSlots[targetSlotIndex]) {
            return false;
        }

        lootSlots[targetSlotIndex] = sourceLootSlot;
        lootSlots[sourceSlotIndex] = null;
        this.selectedSource = selectedSource;
        this.selectedSlotIndex = targetSlotIndex;
        this.hoveredSource = selectedSource;
        this.hoveredSlotIndex = targetSlotIndex;
        return true;
    }

    private moveSourceSlotToDeliverySlot(
        source: Extract<QuestItemPlacementSource, "storage" | "inventory">,
        sourceSlotIndex: number,
        targetDeliverySlotIndex: number,
    ): boolean {
        if (!this.isDeliverySlotIndexInRange(targetDeliverySlotIndex)
            || this.deliveryLootSlots[targetDeliverySlotIndex]) {
            return false;
        }

        const lootSlot = source === "storage"
            ? this.removeStorageSlotItem(sourceSlotIndex)
            : this.removeBackpackSlotItem(sourceSlotIndex);

        if (!lootSlot) {
            return false;
        }

        if (this.placeLootSlotInDelivery(targetDeliverySlotIndex, lootSlot)) {
            return true;
        }

        if (source === "storage") {
            this.restoreStorageSlotItem(lootSlot, sourceSlotIndex);
        } else {
            this.restoreBackpackSlotItem(lootSlot, sourceSlotIndex);
        }

        return false;
    }

    private moveSourceSlotToFirstDeliverySlot(
        source: Extract<QuestItemPlacementSource, "storage" | "inventory">,
        sourceSlotIndex: number,
    ): boolean {
        const targetSlotIndex = this.findFirstEmptyDeliverySlotIndex();

        if (targetSlotIndex == null) {
            return false;
        }

        return this.moveSourceSlotToDeliverySlot(source, sourceSlotIndex, targetSlotIndex);
    }

    private moveStorageSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        return this.moveSlotWithinArray(this.storageLootSlots, sourceSlotIndex, targetSlotIndex, "storage");
    }

    private normalizeBackpackPlacement(backpackMaxSlots: number): void {
        if (this.backpackPlacementItemIds.length > backpackMaxSlots) {
            this.backpackPlacementItemIds.length = backpackMaxSlots;
        }

        while (this.backpackPlacementItemIds.length < backpackMaxSlots) {
            this.backpackPlacementItemIds.push(null);
        }
    }

    private placeLootSlotInArray(
        lootSlots: Array<LootContainerLootSlot | null>,
        slotIndex: number,
        lootSlot: LootContainerLootSlot,
        selectedSource: QuestItemPlacementSource,
    ): boolean {
        if (!Number.isInteger(slotIndex)
            || slotIndex < 0
            || slotIndex >= lootSlots.length
            || lootSlots[slotIndex]) {
            return false;
        }

        const normalizedLootSlot = normalizeLootSlot(lootSlot);

        if (!normalizedLootSlot) {
            return false;
        }

        lootSlots[slotIndex] = normalizedLootSlot;
        this.selectedSource = selectedSource;
        this.selectedSlotIndex = slotIndex;
        this.hoveredSource = selectedSource;
        this.hoveredSlotIndex = slotIndex;
        return true;
    }

    private placeLootSlotInDelivery(slotIndex: number, lootSlot: LootContainerLootSlot): boolean {
        return this.placeLootSlotInArray(this.deliveryLootSlots, slotIndex, lootSlot, "delivery");
    }

    private placeLootSlotInStorage(slotIndex: number, lootSlot: LootContainerLootSlot): boolean {
        return this.placeLootSlotInArray(this.storageLootSlots, slotIndex, lootSlot, "storage");
    }

    private removeBackpackSlotItem(slotIndex: number): LootContainerLootSlot | null {
        const inventory = this.workingInventory;

        if (!inventory) {
            return null;
        }

        const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
        const itemStack = this.getBackpackSlotItemStackForInventory(
            inventory,
            slotIndex,
            backpackMaxSlots,
        );

        if (!itemStack || !this.removeLootItem(inventory, itemStack.itemId, itemStack.amount)) {
            return null;
        }

        this.clearBackpackSlotBinding(slotIndex, backpackMaxSlots);

        return {
            amount: itemStack.amount,
            itemId: itemStack.itemId,
        };
    }

    private removeLootItem(
        inventory: InventoryComponent,
        itemId: LootTableItemId,
        amount: number,
    ): boolean {
        if (isInventoryResourceType(itemId)) {
            return this.inventoryManager.removeResource(inventory, itemId, amount);
        }

        return this.inventoryManager.removeMiscResource(inventory, itemId, amount);
    }

    private removeStorageSlotItem(slotIndex: number): LootContainerLootSlot | null {
        const lootSlot = this.getStorageSlotLootSlot(slotIndex);

        if (!lootSlot) {
            return null;
        }

        this.clearStorageSlot(slotIndex);
        return lootSlot;
    }

    private restoreBackpackSlotItem(
        lootSlot: LootContainerLootSlot,
        preferredSlotIndex: number,
    ): void {
        if (this.addLootItemToBackpackSlot(
            lootSlot.itemId,
            lootSlot.amount,
            preferredSlotIndex,
        )) {
            return;
        }

        if (this.workingInventory) {
            this.inventoryManager.addLootItem(
                this.workingInventory,
                lootSlot.itemId,
                lootSlot.amount,
            );
        }
    }

    private restoreStorageSlotItem(
        lootSlot: LootContainerLootSlot,
        preferredSlotIndex: number,
    ): void {
        if (this.placeLootSlotInStorage(preferredSlotIndex, lootSlot)) {
            return;
        }

        const nextEmptySlotIndex = this.findFirstEmptyStorageSlotIndex();

        if (nextEmptySlotIndex != null) {
            this.placeLootSlotInStorage(nextEmptySlotIndex, lootSlot);
        }
    }

    private takeDeliverySlotToActiveSource(sourceSlotIndex: number): boolean {
        return this.activeSourceTab === QUEST_SOURCE_TAB.CAMP_STORAGE
            ? this.takeDeliverySlotToFirstStorageSlot(sourceSlotIndex)
            : this.takeDeliverySlotToFirstInventorySlot(sourceSlotIndex);
    }

    private takeDeliverySlotToFirstInventorySlot(sourceDeliverySlotIndex: number): boolean {
        const inventory = this.workingInventory;
        const lootSlot = this.getDeliverySlotLootSlot(sourceDeliverySlotIndex);

        if (!inventory || !lootSlot) {
            return false;
        }

        const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
        const targetSlotIndex = this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots)
            .findIndex((slot) => slot === null);

        if (targetSlotIndex === -1) {
            return false;
        }

        return this.takeDeliverySlotToInventorySlot(sourceDeliverySlotIndex, targetSlotIndex);
    }

    private takeDeliverySlotToFirstStorageSlot(sourceDeliverySlotIndex: number): boolean {
        const targetSlotIndex = this.findFirstEmptyStorageSlotIndex();

        if (targetSlotIndex == null) {
            return false;
        }

        return this.takeDeliverySlotToStorageSlot(sourceDeliverySlotIndex, targetSlotIndex);
    }

    private takeDeliverySlotToInventorySlot(
        sourceDeliverySlotIndex: number,
        targetInventorySlotIndex: number,
    ): boolean {
        const lootSlot = this.getDeliverySlotLootSlot(sourceDeliverySlotIndex);

        if (!lootSlot || !this.isDeliverySlotIndexInRange(sourceDeliverySlotIndex)) {
            return false;
        }

        this.clearDeliverySlot(sourceDeliverySlotIndex);

        if (this.addLootItemToBackpackSlot(
            lootSlot.itemId,
            lootSlot.amount,
            targetInventorySlotIndex,
        )) {
            return true;
        }

        this.placeLootSlotInDelivery(sourceDeliverySlotIndex, lootSlot);
        return false;
    }

    private takeDeliverySlotToStorageSlot(
        sourceDeliverySlotIndex: number,
        targetStorageSlotIndex: number,
    ): boolean {
        const lootSlot = this.getDeliverySlotLootSlot(sourceDeliverySlotIndex);

        if (!lootSlot || !this.isDeliverySlotIndexInRange(sourceDeliverySlotIndex)) {
            return false;
        }

        this.clearDeliverySlot(sourceDeliverySlotIndex);

        if (this.placeLootSlotInStorage(targetStorageSlotIndex, lootSlot)) {
            return true;
        }

        this.placeLootSlotInDelivery(sourceDeliverySlotIndex, lootSlot);
        return false;
    }
}

function formatLootItemName(itemId: LootTableItemId): string {
    return `${itemId}`
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isQuestId(value: unknown): value is QuestId {
    return typeof value === "string"
        && Object.prototype.hasOwnProperty.call(QUEST_CONFIG, value);
}

function normalizeLootSlot(
    lootSlot: LootContainerLootSlot | null | undefined,
): LootContainerLootSlot | null {
    if (!lootSlot) {
        return null;
    }

    if (isInventoryResourceType(lootSlot.itemId)) {
        const amount = clampInventoryResourceAmount(
            lootSlot.itemId,
            Math.floor(lootSlot.amount),
        );

        return amount > 0
            ? {
                amount,
                itemId: lootSlot.itemId,
            }
            : null;
    }

    if (isMiscResourceType(lootSlot.itemId)) {
        const amount = clampMiscResourceAmount(Math.floor(lootSlot.amount));

        return amount > 0
            ? {
                amount,
                itemId: lootSlot.itemId,
            }
            : null;
    }

    return null;
}

function normalizeObjectiveProgress(
    objectiveProgress: readonly QuestObjectiveProgressSnapshot[],
): Map<QuestId, number[]> {
    const progressByQuestId = new Map<QuestId, number[]>();

    for (const progress of objectiveProgress) {
        if (!isQuestId(progress.questId)) {
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

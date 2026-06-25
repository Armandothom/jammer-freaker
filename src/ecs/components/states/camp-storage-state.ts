import type { LootContainerLootSlot } from "../loot-container-content.component.js";
import { InventoryComponent } from "../inventory-component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
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
import type { LootTableItemId } from "../../../game/world-map/loot/loot-tables.js";
import { formatLootItemDetails } from "../../../game/world-map/loot/loot-item-display.js";
import { InventoryManager } from "../../core/inventory-manager.js";

export const CAMP_STORAGE_COLUMN_COUNT = 4;
export const CAMP_STORAGE_ROW_COUNT = 8;
export const CAMP_STORAGE_MAX_SLOTS = CAMP_STORAGE_COLUMN_COUNT * CAMP_STORAGE_ROW_COUNT;

export type CampStorageItemPlacementSource = "storage" | "inventory";

export type CampStorageItemDragState = {
    item: LootContainerLootSlot;
    pointerX: number;
    pointerY: number;
    source: CampStorageItemPlacementSource;
    slotIndex: number;
};

type CampStorageItemStack = {
    itemId: LootTableItemId;
    amount: number;
};

export class CampStorageState {
    private readonly inventoryManager = new InventoryManager();
    private workingInventory: InventoryComponent | null = null;
    private storageLootSlots: Array<LootContainerLootSlot | null> = this.createEmptyStorageSlots();
    private backpackPlacementItemIds: Array<LootTableItemId | null> = [];
    private dragState: CampStorageItemDragState | null = null;
    private hoveredSource: CampStorageItemPlacementSource | null = null;
    private hoveredSlotIndex: number | null = null;
    private selectedSource: CampStorageItemPlacementSource | null = null;
    private selectedSlotIndex: number | null = null;

    public initializeFromSnapshots(
        inventorySnapshot: InventorySnapshot | null,
        storageSnapshot: StorageSnapshot | null,
    ): void {
        this.applyInventorySnapshot(inventorySnapshot);
        this.applyStorageSnapshot(storageSnapshot);
        this.clearTransientState();
    }

    public applyInventorySnapshot(snapshot: InventorySnapshot | null): void {
        this.workingInventory = snapshot
            ? InventoryComponent.fromSnapshot(snapshot)
            : null;
        this.normalizeBackpackPlacement(this.getBackpackMaxSlots());
    }

    public applyStorageSnapshot(snapshot: StorageSnapshot | null): void {
        const sourceSlots = snapshot?.lootSlots ?? [];
        this.storageLootSlots = Array.from({ length: CAMP_STORAGE_MAX_SLOTS }, (_value, slotIndex) => {
            return normalizeStorageLootSlot(sourceSlots[slotIndex] ?? null);
        });
    }

    public reset(): void {
        this.workingInventory = null;
        this.storageLootSlots = this.createEmptyStorageSlots();
        this.backpackPlacementItemIds = [];
        this.clearTransientState();
    }

    public createInventorySnapshot(): InventorySnapshot | null {
        if (!this.workingInventory) {
            return null;
        }

        return this.inventoryManager.createSnapshot(this.workingInventory);
    }

    public createStorageSnapshot(): StorageSnapshot {
        return new StorageSnapshot(this.storageLootSlots, CAMP_STORAGE_MAX_SLOTS);
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

    public getStorageSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
        if (!this.isStorageSlotIndexInRange(slotIndex)) {
            return null;
        }

        const lootSlot = this.storageLootSlots[slotIndex] ?? null;

        return lootSlot
            ? {
                amount: lootSlot.amount,
                itemId: lootSlot.itemId,
            }
            : null;
    }

    public activateSlot(
        source: CampStorageItemPlacementSource,
        slotIndex: number,
    ): boolean {
        if (!this.isSlotIndexInRange(source, slotIndex)) {
            return false;
        }

        this.selectedSource = source;
        this.selectedSlotIndex = slotIndex;
        return true;
    }

    public beginItemDrag(
        source: CampStorageItemPlacementSource,
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

    public finishDrag(
        targetSource: CampStorageItemPlacementSource,
        targetSlotIndex: number,
    ): boolean {
        const drag = this.dragState;

        if (!drag) {
            return false;
        }

        let moved = false;

        if (targetSource === "storage") {
            moved = drag.source === "storage"
                ? this.moveStorageSlot(drag.slotIndex, targetSlotIndex)
                : this.stashInventorySlotToStorageSlot(drag.slotIndex, targetSlotIndex);
        } else {
            moved = drag.source === "storage"
                ? this.takeStorageSlotToInventorySlot(drag.slotIndex, targetSlotIndex)
                : this.moveBackpackSlot(drag.slotIndex, targetSlotIndex);
        }

        this.clearItemDrag();
        return moved;
    }

    public getActiveItemDrag(): CampStorageItemDragState | null {
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

    public getHoveredItemName(): string {
        const source = this.hoveredSource ?? this.selectedSource;
        const slotIndex = this.hoveredSlotIndex ?? this.selectedSlotIndex;

        if (!source || slotIndex == null) {
            return "";
        }

        const lootSlot = this.getSlotLootSlot(source, slotIndex);

        return lootSlot ? formatLootItemDetails(lootSlot.itemId) : "";
    }

    public isSourceSlotBeingDragged(
        source: CampStorageItemPlacementSource,
        slotIndex: number,
    ): boolean {
        return this.dragState?.source === source
            && this.dragState.slotIndex === slotIndex;
    }

    public setHoveredSlot(
        source: CampStorageItemPlacementSource | null,
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

    public transferSlot(source: CampStorageItemPlacementSource, slotIndex: number): boolean {
        if (source === "storage") {
            return this.takeStorageSlotToInventory(slotIndex);
        }

        return this.stashInventorySlotToFirstStorageSlot(slotIndex);
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

        if (!this.isBackpackSlotIndexInRange(targetSlotIndex, backpackMaxSlots)) {
            return false;
        }

        if (!this.isBackpackSlotEmptyForInventory(inventory, targetSlotIndex, backpackMaxSlots)) {
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

    private buildBackpackItemStacks(inventory: InventoryComponent): CampStorageItemStack[] {
        const itemStacks: CampStorageItemStack[] = [];

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
    ): Array<CampStorageItemStack | null> {
        const itemStacks = this.buildBackpackItemStacks(inventory);
        const itemStackById = new Map<LootTableItemId, CampStorageItemStack>();

        for (const itemStack of itemStacks) {
            itemStackById.set(itemStack.itemId, itemStack);
        }

        this.normalizeBackpackPlacement(backpackMaxSlots);

        const placedItemStacks = new Array<CampStorageItemStack | null>(backpackMaxSlots).fill(null);
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

    private createEmptyStorageSlots(): Array<LootContainerLootSlot | null> {
        return new Array<LootContainerLootSlot | null>(CAMP_STORAGE_MAX_SLOTS).fill(null);
    }

    private findFirstEmptyStorageSlotIndex(): number | null {
        const slotIndex = this.storageLootSlots.findIndex((lootSlot) => !lootSlot);

        return slotIndex === -1 ? null : slotIndex;
    }

    private getBackpackSlotItemStackForInventory(
        inventory: InventoryComponent,
        slotIndex: number,
        backpackMaxSlots: number,
    ): CampStorageItemStack | null {
        if (!this.isBackpackSlotIndexInRange(slotIndex, backpackMaxSlots)) {
            return null;
        }

        return this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots)[slotIndex] ?? null;
    }

    private getSlotLootSlot(
        source: CampStorageItemPlacementSource,
        slotIndex: number,
    ): LootContainerLootSlot | null {
        return source === "storage"
            ? this.getStorageSlotLootSlot(slotIndex)
            : this.getBackpackSlotLootSlot(slotIndex);
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

    private isSlotIndexInRange(
        source: CampStorageItemPlacementSource,
        slotIndex: number,
    ): boolean {
        return source === "storage"
            ? this.isStorageSlotIndexInRange(slotIndex)
            : this.isBackpackSlotIndexInRange(slotIndex, this.getBackpackMaxSlots());
    }

    private isStorageSlotIndexInRange(slotIndex: number): boolean {
        return Number.isInteger(slotIndex)
            && slotIndex >= 0
            && slotIndex < CAMP_STORAGE_MAX_SLOTS;
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

        if (!sourceItemStack) {
            return false;
        }

        if (!this.isBackpackSlotEmptyForInventory(inventory, targetSlotIndex, backpackMaxSlots)) {
            return false;
        }

        this.clearBackpackSlotBinding(sourceSlotIndex, backpackMaxSlots);
        this.bindItemToBackpackSlot(sourceItemStack.itemId, targetSlotIndex, backpackMaxSlots);
        return true;
    }

    private moveStorageSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        if (!this.isStorageSlotIndexInRange(sourceSlotIndex)
            || !this.isStorageSlotIndexInRange(targetSlotIndex)) {
            return false;
        }

        if (sourceSlotIndex === targetSlotIndex) {
            return !!this.storageLootSlots[sourceSlotIndex];
        }

        const sourceLootSlot = this.storageLootSlots[sourceSlotIndex] ?? null;

        if (!sourceLootSlot || this.storageLootSlots[targetSlotIndex]) {
            return false;
        }

        this.storageLootSlots[targetSlotIndex] = sourceLootSlot;
        this.storageLootSlots[sourceSlotIndex] = null;
        this.selectedSource = "storage";
        this.selectedSlotIndex = targetSlotIndex;
        this.hoveredSource = "storage";
        this.hoveredSlotIndex = targetSlotIndex;
        return true;
    }

    private normalizeBackpackPlacement(backpackMaxSlots: number): void {
        if (this.backpackPlacementItemIds.length > backpackMaxSlots) {
            this.backpackPlacementItemIds.length = backpackMaxSlots;
        }

        while (this.backpackPlacementItemIds.length < backpackMaxSlots) {
            this.backpackPlacementItemIds.push(null);
        }
    }

    private placeLootSlotInStorage(
        slotIndex: number,
        lootSlot: LootContainerLootSlot,
    ): boolean {
        if (!this.isStorageSlotIndexInRange(slotIndex) || this.storageLootSlots[slotIndex]) {
            return false;
        }

        const normalizedLootSlot = normalizeStorageLootSlot(lootSlot);

        if (!normalizedLootSlot) {
            return false;
        }

        this.storageLootSlots[slotIndex] = normalizedLootSlot;
        this.selectedSource = "storage";
        this.selectedSlotIndex = slotIndex;
        this.hoveredSource = "storage";
        this.hoveredSlotIndex = slotIndex;
        return true;
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

        if (!itemStack) {
            return null;
        }

        if (!this.removeLootItem(inventory, itemStack.itemId, itemStack.amount)) {
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

    private stashInventorySlotToFirstStorageSlot(sourceSlotIndex: number): boolean {
        const targetSlotIndex = this.findFirstEmptyStorageSlotIndex();

        if (targetSlotIndex == null) {
            return false;
        }

        return this.stashInventorySlotToStorageSlot(sourceSlotIndex, targetSlotIndex);
    }

    private stashInventorySlotToStorageSlot(
        sourceSlotIndex: number,
        targetSlotIndex: number,
    ): boolean {
        if (!this.isStorageSlotIndexInRange(targetSlotIndex)
            || this.storageLootSlots[targetSlotIndex]) {
            return false;
        }

        const removedLootSlot = this.removeBackpackSlotItem(sourceSlotIndex);

        if (!removedLootSlot) {
            return false;
        }

        if (this.placeLootSlotInStorage(targetSlotIndex, removedLootSlot)) {
            return true;
        }

        this.restoreBackpackSlotItem(removedLootSlot, sourceSlotIndex);
        return false;
    }

    private takeStorageSlotToInventory(sourceSlotIndex: number): boolean {
        const inventory = this.workingInventory;
        const lootSlot = this.getStorageSlotLootSlot(sourceSlotIndex);

        if (!inventory || !lootSlot || !this.isStorageSlotIndexInRange(sourceSlotIndex)) {
            return false;
        }

        this.clearStorageSlot(sourceSlotIndex);

        if (this.inventoryManager.addLootItem(inventory, lootSlot.itemId, lootSlot.amount)) {
            return true;
        }

        this.placeLootSlotInStorage(sourceSlotIndex, lootSlot);
        return false;
    }

    private takeStorageSlotToInventorySlot(
        sourceSlotIndex: number,
        targetSlotIndex: number,
    ): boolean {
        const lootSlot = this.getStorageSlotLootSlot(sourceSlotIndex);

        if (!lootSlot || !this.isStorageSlotIndexInRange(sourceSlotIndex)) {
            return false;
        }

        this.clearStorageSlot(sourceSlotIndex);

        if (this.addLootItemToBackpackSlot(
            lootSlot.itemId,
            lootSlot.amount,
            targetSlotIndex,
        )) {
            return true;
        }

        this.placeLootSlotInStorage(sourceSlotIndex, lootSlot);
        return false;
    }
}

function normalizeStorageLootSlot(
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

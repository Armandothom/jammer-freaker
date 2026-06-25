import type { LootContainerLootSlot } from "../loot-container-content.component.js";
import { InventoryComponent } from "../inventory-component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
import { StorageSnapshot } from "../snapshots/storage-snapshot.js";
import { getLootItemSellPrice, isLootItemSellable } from "../types/loot-item-sell-price-config.js";
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
import { InventoryManager } from "../../core/inventory-manager.js";

export const WARE_BUYER_SOURCE_TAB = {
    CAMP_STORAGE: "camp_storage",
    BACKPACK: "backpack",
} as const;

export type WareBuyerSourceTab = typeof WARE_BUYER_SOURCE_TAB[keyof typeof WARE_BUYER_SOURCE_TAB];

export const WARE_BUYER_COLUMN_COUNT = 4;
export const WARE_BUYER_ROW_COUNT = 8;
export const WARE_BUYER_MAX_SLOTS = WARE_BUYER_COLUMN_COUNT * WARE_BUYER_ROW_COUNT;

export type WareBuyerItemPlacementSource = "storage" | "inventory" | "sale";

export type WareBuyerItemDragState = {
    item: LootContainerLootSlot;
    pointerX: number;
    pointerY: number;
    source: WareBuyerItemPlacementSource;
    slotIndex: number;
};

type WareBuyerItemStack = {
    itemId: LootTableItemId;
    amount: number;
};

export class WareBuyerState {
    private readonly inventoryManager = new InventoryManager();
    private workingInventory: InventoryComponent | null = null;
    private storageLootSlots: Array<LootContainerLootSlot | null> = this.createEmptySlots();
    private saleLootSlots: Array<LootContainerLootSlot | null> = this.createEmptySlots();
    private backpackPlacementItemIds: Array<LootTableItemId | null> = [];
    private dragState: WareBuyerItemDragState | null = null;
    private hoveredSource: WareBuyerItemPlacementSource | null = null;
    private hoveredSlotIndex: number | null = null;
    private selectedSource: WareBuyerItemPlacementSource | null = null;
    private selectedSlotIndex: number | null = null;
    private activeSourceTab: WareBuyerSourceTab = WARE_BUYER_SOURCE_TAB.CAMP_STORAGE;

    public initializeFromSnapshots(
        inventorySnapshot: InventorySnapshot | null,
        storageSnapshot: StorageSnapshot | null,
        saleSnapshot: StorageSnapshot | null,
    ): void {
        this.applyInventorySnapshot(inventorySnapshot);
        this.applyStorageSnapshot(storageSnapshot);
        this.applySaleSnapshot(saleSnapshot);
        this.activeSourceTab = WARE_BUYER_SOURCE_TAB.CAMP_STORAGE;
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
        this.storageLootSlots = Array.from({ length: WARE_BUYER_MAX_SLOTS }, (_value, slotIndex) => {
            return normalizeLootSlot(sourceSlots[slotIndex] ?? null);
        });
    }

    public applySaleSnapshot(snapshot: StorageSnapshot | null): void {
        const sourceSlots = snapshot?.lootSlots ?? [];
        this.saleLootSlots = Array.from({ length: WARE_BUYER_MAX_SLOTS }, (_value, slotIndex) => {
            return normalizeLootSlot(sourceSlots[slotIndex] ?? null);
        });
    }

    public reset(): void {
        this.workingInventory = null;
        this.storageLootSlots = this.createEmptySlots();
        this.saleLootSlots = this.createEmptySlots();
        this.backpackPlacementItemIds = [];
        this.activeSourceTab = WARE_BUYER_SOURCE_TAB.CAMP_STORAGE;
        this.clearTransientState();
    }

    public createInventorySnapshot(): InventorySnapshot | null {
        if (!this.workingInventory) {
            return null;
        }

        return this.inventoryManager.createSnapshot(this.workingInventory);
    }

    public createStorageSnapshot(): StorageSnapshot {
        return new StorageSnapshot(this.storageLootSlots, WARE_BUYER_MAX_SLOTS);
    }

    public createSaleSnapshot(): StorageSnapshot {
        return new StorageSnapshot(this.saleLootSlots, WARE_BUYER_MAX_SLOTS);
    }

    public getActiveSourceTab(): WareBuyerSourceTab {
        return this.activeSourceTab;
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

    public getHoveredItemName(): string {
        const source = this.hoveredSource ?? this.selectedSource;
        const slotIndex = this.hoveredSlotIndex ?? this.selectedSlotIndex;

        if (!source || slotIndex == null) {
            return "";
        }

        const lootSlot = this.getSlotLootSlot(source, slotIndex);

        return lootSlot ? formatLootItemName(lootSlot.itemId) : "";
    }

    public getSaleSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
        return this.getArraySlotLootSlot(this.saleLootSlots, slotIndex);
    }

    public getStorageSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
        return this.getArraySlotLootSlot(this.storageLootSlots, slotIndex);
    }

    public getTotalSellValue(): number {
        return this.saleLootSlots.reduce((total, lootSlot) => {
            if (!lootSlot || !isLootItemSellable(lootSlot.itemId)) {
                return total;
            }

            return total + (getLootItemSellPrice(lootSlot.itemId) * lootSlot.amount);
        }, 0);
    }

    public activateSlot(
        source: WareBuyerItemPlacementSource,
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
        source: WareBuyerItemPlacementSource,
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
        targetSource: WareBuyerItemPlacementSource,
        targetSlotIndex: number,
    ): boolean {
        const drag = this.dragState;

        if (!drag) {
            return false;
        }

        let moved = false;

        switch (targetSource) {
            case "sale":
                moved = drag.source === "sale"
                    ? this.moveSaleSlot(drag.slotIndex, targetSlotIndex)
                    : this.moveSourceSlotToSaleSlot(drag.source, drag.slotIndex, targetSlotIndex);
                break;

            case "storage":
                if (drag.source === "sale") {
                    moved = this.takeSaleSlotToStorageSlot(drag.slotIndex, targetSlotIndex);
                } else if (drag.source === "storage") {
                    moved = this.moveStorageSlot(drag.slotIndex, targetSlotIndex);
                }
                break;

            case "inventory":
                if (drag.source === "sale") {
                    moved = this.takeSaleSlotToInventorySlot(drag.slotIndex, targetSlotIndex);
                } else if (drag.source === "inventory") {
                    moved = this.moveBackpackSlot(drag.slotIndex, targetSlotIndex);
                }
                break;
        }

        this.clearItemDrag();
        return moved;
    }

    public getActiveItemDrag(): WareBuyerItemDragState | null {
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

    public isSourceSlotBeingDragged(
        source: WareBuyerItemPlacementSource,
        slotIndex: number,
    ): boolean {
        return this.dragState?.source === source
            && this.dragState.slotIndex === slotIndex;
    }

    public selectSourceTab(tab: WareBuyerSourceTab): void {
        this.activeSourceTab = tab;

        if (this.hoveredSource === "storage" && tab !== WARE_BUYER_SOURCE_TAB.CAMP_STORAGE) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.hoveredSource === "inventory" && tab !== WARE_BUYER_SOURCE_TAB.BACKPACK) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.selectedSource === "storage" && tab !== WARE_BUYER_SOURCE_TAB.CAMP_STORAGE) {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }

        if (this.selectedSource === "inventory" && tab !== WARE_BUYER_SOURCE_TAB.BACKPACK) {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }
    }

    public sellItems(): boolean {
        const inventory = this.workingInventory;
        const totalSellValue = this.getTotalSellValue();

        if (!inventory || totalSellValue <= 0) {
            return false;
        }

        if (!this.inventoryManager.addResource(
            inventory,
            InventoryResourceType.Money,
            totalSellValue,
        )) {
            return false;
        }

        this.saleLootSlots = this.createEmptySlots();

        if (this.hoveredSource === "sale") {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.selectedSource === "sale") {
            this.selectedSource = null;
            this.selectedSlotIndex = null;
        }

        return true;
    }

    public setHoveredSlot(
        source: WareBuyerItemPlacementSource | null,
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

    public transferSlot(source: WareBuyerItemPlacementSource, slotIndex: number): boolean {
        if (source === "sale") {
            return this.takeSaleSlotToActiveSource(slotIndex);
        }

        return this.moveSourceSlotToFirstSaleSlot(source, slotIndex);
    }

    public canSellItems(): boolean {
        return this.getTotalSellValue() > 0;
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

    private buildBackpackItemStacks(inventory: InventoryComponent): WareBuyerItemStack[] {
        const itemStacks: WareBuyerItemStack[] = [];

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
    ): Array<WareBuyerItemStack | null> {
        const itemStacks = this.buildBackpackItemStacks(inventory);
        const itemStackById = new Map<LootTableItemId, WareBuyerItemStack>();

        for (const itemStack of itemStacks) {
            itemStackById.set(itemStack.itemId, itemStack);
        }

        this.normalizeBackpackPlacement(backpackMaxSlots);

        const placedItemStacks = new Array<WareBuyerItemStack | null>(backpackMaxSlots).fill(null);
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

    private clearTransientState(): void {
        this.dragState = null;
        this.hoveredSource = null;
        this.hoveredSlotIndex = null;
        this.selectedSource = null;
        this.selectedSlotIndex = null;
    }

    private clearSaleSlot(slotIndex: number): void {
        if (!this.isSaleSlotIndexInRange(slotIndex)) {
            return;
        }

        this.saleLootSlots[slotIndex] = null;

        if (this.hoveredSource === "sale" && this.hoveredSlotIndex === slotIndex) {
            this.hoveredSource = null;
            this.hoveredSlotIndex = null;
        }

        if (this.selectedSource === "sale" && this.selectedSlotIndex === slotIndex) {
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

    private createEmptySlots(): Array<LootContainerLootSlot | null> {
        return new Array<LootContainerLootSlot | null>(WARE_BUYER_MAX_SLOTS).fill(null);
    }

    private findFirstEmptySaleSlotIndex(): number | null {
        const slotIndex = this.saleLootSlots.findIndex((lootSlot) => !lootSlot);

        return slotIndex === -1 ? null : slotIndex;
    }

    private findFirstEmptyStorageSlotIndex(): number | null {
        const slotIndex = this.storageLootSlots.findIndex((lootSlot) => !lootSlot);

        return slotIndex === -1 ? null : slotIndex;
    }

    private getArraySlotLootSlot(
        lootSlots: ReadonlyArray<LootContainerLootSlot | null>,
        slotIndex: number,
    ): LootContainerLootSlot | null {
        if (!this.isSaleSlotIndexInRange(slotIndex)) {
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
    ): WareBuyerItemStack | null {
        if (!this.isBackpackSlotIndexInRange(slotIndex, backpackMaxSlots)) {
            return null;
        }

        return this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots)[slotIndex] ?? null;
    }

    private getSlotLootSlot(
        source: WareBuyerItemPlacementSource,
        slotIndex: number,
    ): LootContainerLootSlot | null {
        switch (source) {
            case "storage":
                return this.getStorageSlotLootSlot(slotIndex);

            case "inventory":
                return this.getBackpackSlotLootSlot(slotIndex);

            case "sale":
                return this.getSaleSlotLootSlot(slotIndex);
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

    private isSaleSlotIndexInRange(slotIndex: number): boolean {
        return Number.isInteger(slotIndex)
            && slotIndex >= 0
            && slotIndex < WARE_BUYER_MAX_SLOTS;
    }

    private isSlotIndexInRange(
        source: WareBuyerItemPlacementSource,
        slotIndex: number,
    ): boolean {
        switch (source) {
            case "storage":
                return this.isStorageSlotIndexInRange(slotIndex);

            case "inventory":
                return this.isBackpackSlotIndexInRange(slotIndex, this.getBackpackMaxSlots());

            case "sale":
                return this.isSaleSlotIndexInRange(slotIndex);
        }
    }

    private isStorageSlotIndexInRange(slotIndex: number): boolean {
        return Number.isInteger(slotIndex)
            && slotIndex >= 0
            && slotIndex < WARE_BUYER_MAX_SLOTS;
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

    private moveSaleSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        return this.moveSlotWithinArray(this.saleLootSlots, sourceSlotIndex, targetSlotIndex, "sale");
    }

    private moveSlotWithinArray(
        lootSlots: Array<LootContainerLootSlot | null>,
        sourceSlotIndex: number,
        targetSlotIndex: number,
        selectedSource: WareBuyerItemPlacementSource,
    ): boolean {
        if (!this.isSaleSlotIndexInRange(sourceSlotIndex)
            || !this.isSaleSlotIndexInRange(targetSlotIndex)) {
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

    private moveSourceSlotToFirstSaleSlot(
        source: Extract<WareBuyerItemPlacementSource, "storage" | "inventory">,
        sourceSlotIndex: number,
    ): boolean {
        const targetSlotIndex = this.findFirstEmptySaleSlotIndex();

        if (targetSlotIndex == null) {
            return false;
        }

        return this.moveSourceSlotToSaleSlot(source, sourceSlotIndex, targetSlotIndex);
    }

    private moveSourceSlotToSaleSlot(
        source: Extract<WareBuyerItemPlacementSource, "storage" | "inventory">,
        sourceSlotIndex: number,
        targetSaleSlotIndex: number,
    ): boolean {
        if (!this.isSaleSlotIndexInRange(targetSaleSlotIndex)
            || this.saleLootSlots[targetSaleSlotIndex]) {
            return false;
        }

        const lootSlot = source === "storage"
            ? this.removeStorageSlotItem(sourceSlotIndex)
            : this.removeBackpackSlotItem(sourceSlotIndex);

        if (!lootSlot || !isLootItemSellable(lootSlot.itemId)) {
            if (lootSlot) {
                if (source === "storage") {
                    this.restoreStorageSlotItem(lootSlot, sourceSlotIndex);
                } else {
                    this.restoreBackpackSlotItem(lootSlot, sourceSlotIndex);
                }
            }
            return false;
        }

        if (this.placeLootSlotInSale(targetSaleSlotIndex, lootSlot)) {
            return true;
        }

        if (source === "storage") {
            this.restoreStorageSlotItem(lootSlot, sourceSlotIndex);
        } else {
            this.restoreBackpackSlotItem(lootSlot, sourceSlotIndex);
        }

        return false;
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
        selectedSource: WareBuyerItemPlacementSource,
    ): boolean {
        if (!this.isSaleSlotIndexInRange(slotIndex) || lootSlots[slotIndex]) {
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

    private placeLootSlotInSale(slotIndex: number, lootSlot: LootContainerLootSlot): boolean {
        if (!isLootItemSellable(lootSlot.itemId)) {
            return false;
        }

        return this.placeLootSlotInArray(this.saleLootSlots, slotIndex, lootSlot, "sale");
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

    private takeSaleSlotToActiveSource(sourceSlotIndex: number): boolean {
        return this.activeSourceTab === WARE_BUYER_SOURCE_TAB.CAMP_STORAGE
            ? this.takeSaleSlotToFirstStorageSlot(sourceSlotIndex)
            : this.takeSaleSlotToFirstInventorySlot(sourceSlotIndex);
    }

    private takeSaleSlotToFirstInventorySlot(sourceSaleSlotIndex: number): boolean {
        const inventory = this.workingInventory;
        const lootSlot = this.getSaleSlotLootSlot(sourceSaleSlotIndex);

        if (!inventory || !lootSlot) {
            return false;
        }

        const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
        const targetSlotIndex = this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots)
            .findIndex((slot) => slot === null);

        if (targetSlotIndex === -1) {
            return false;
        }

        return this.takeSaleSlotToInventorySlot(sourceSaleSlotIndex, targetSlotIndex);
    }

    private takeSaleSlotToFirstStorageSlot(sourceSaleSlotIndex: number): boolean {
        const targetSlotIndex = this.findFirstEmptyStorageSlotIndex();

        if (targetSlotIndex == null) {
            return false;
        }

        return this.takeSaleSlotToStorageSlot(sourceSaleSlotIndex, targetSlotIndex);
    }

    private takeSaleSlotToInventorySlot(
        sourceSaleSlotIndex: number,
        targetInventorySlotIndex: number,
    ): boolean {
        const lootSlot = this.getSaleSlotLootSlot(sourceSaleSlotIndex);

        if (!lootSlot || !this.isSaleSlotIndexInRange(sourceSaleSlotIndex)) {
            return false;
        }

        this.clearSaleSlot(sourceSaleSlotIndex);

        if (this.addLootItemToBackpackSlot(
            lootSlot.itemId,
            lootSlot.amount,
            targetInventorySlotIndex,
        )) {
            return true;
        }

        this.placeLootSlotInSale(sourceSaleSlotIndex, lootSlot);
        return false;
    }

    private takeSaleSlotToStorageSlot(
        sourceSaleSlotIndex: number,
        targetStorageSlotIndex: number,
    ): boolean {
        const lootSlot = this.getSaleSlotLootSlot(sourceSaleSlotIndex);

        if (!lootSlot || !this.isSaleSlotIndexInRange(sourceSaleSlotIndex)) {
            return false;
        }

        this.clearSaleSlot(sourceSaleSlotIndex);

        if (this.placeLootSlotInStorage(targetStorageSlotIndex, lootSlot)) {
            return true;
        }

        this.placeLootSlotInSale(sourceSaleSlotIndex, lootSlot);
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

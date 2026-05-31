import { InventoryManager } from "../../core/inventory-manager.js";
import { InventoryComponent } from "../inventory-component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
import { InventoryResourceType } from "../types/inventory-resource-type.js";
import {
    MEDICAL_SHOP_RESOURCE_ITEM_CONFIG,
    type MedicalShopResourceItemType,
} from "../types/medical-shop-resource-item-config.js";
import {
    getNextMedicalShopUpgradeProgressLevel,
    getMedicalShopUpgradeItemPrice,
    getMedicalShopUpgradeLevelFromProgress,
    isMedicalShopUpgradeProgressMaxed,
    type MedicalShopUpgradeItemType,
} from "../types/medical-shop-upgrade-item-config.js";

export class MedicalShopInventoryState {
    private readonly inventoryManager = new InventoryManager();
    private workingInventory: InventoryComponent | null = null;
    private availableResourceItemStocks = this.createDefaultResourceItemStocks();

    public initializeFromSnapshot(snapshot: InventorySnapshot | null): void {
        this.applyInventorySnapshot(snapshot);
        this.availableResourceItemStocks = this.createDefaultResourceItemStocks();
    }

    public applyInventorySnapshot(snapshot: InventorySnapshot | null): void {
        this.workingInventory = snapshot
            ? InventoryComponent.fromSnapshot(snapshot)
            : null;
    }

    public reset(): void {
        this.workingInventory = null;
        this.availableResourceItemStocks = this.createDefaultResourceItemStocks();
    }

    public getMoney(): number {
        const inventory = this.workingInventory;

        if (!inventory) {
            return 0;
        }

        return this.inventoryManager.getResourceAmount(
            inventory,
            InventoryResourceType.Money,
        );
    }

    public getAvailableResourceItemStock(itemType: MedicalShopResourceItemType): number {
        return this.availableResourceItemStocks.get(itemType) ?? 0;
    }

    public getUpgradeItemLevel(upgradeType: MedicalShopUpgradeItemType): number {
        const inventory = this.workingInventory;

        if (!inventory) {
            return 0;
        }

        return this.inventoryManager.getMedicalUpgradeLevel(inventory, upgradeType);
    }

    public getUpgradeItemPrice(upgradeType: MedicalShopUpgradeItemType): number {
        const currentLevel = this.getUpgradeItemLevel(upgradeType);
        const nextUpgradeLevel = getMedicalShopUpgradeLevelFromProgress(currentLevel);

        return getMedicalShopUpgradeItemPrice(upgradeType, nextUpgradeLevel);
    }

    public canPurchaseUpgradeItem(upgradeType: MedicalShopUpgradeItemType): boolean {
        if (!this.workingInventory) {
            return false;
        }

        return !isMedicalShopUpgradeProgressMaxed(
            this.getUpgradeItemLevel(upgradeType),
        );
    }

    public tryPurchaseResourceItem(itemType: MedicalShopResourceItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const itemConfig = MEDICAL_SHOP_RESOURCE_ITEM_CONFIG[itemType];
        const currentStock = this.getAvailableResourceItemStock(itemType);

        if (currentStock <= 0) {
            return false;
        }

        if (!this.inventoryManager.canAddResource(
            inventory,
            itemConfig.resourceType,
            itemConfig.resourceAmount,
        )) {
            return false;
        }

        if (!this.trySpendMoney(itemConfig.price)) {
            return false;
        }

        this.availableResourceItemStocks.set(itemType, currentStock - 1);
        this.inventoryManager.addResource(
            inventory,
            itemConfig.resourceType,
            itemConfig.resourceAmount,
        );

        return true;
    }

    public tryPurchaseUpgradeItem(upgradeType: MedicalShopUpgradeItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        if (!this.canPurchaseUpgradeItem(upgradeType)) {
            return false;
        }

        if (!this.trySpendMoney(this.getUpgradeItemPrice(upgradeType))) {
            return false;
        }

        this.inventoryManager.setMedicalUpgradeLevel(
            inventory,
            upgradeType,
            getNextMedicalShopUpgradeProgressLevel(
                this.getUpgradeItemLevel(upgradeType),
            ),
        );

        return true;
    }

    public createSnapshot(): InventorySnapshot | null {
        if (!this.workingInventory) {
            return null;
        }

        return this.inventoryManager.createSnapshot(this.workingInventory);
    }

    private trySpendMoney(amount: number): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        return this.inventoryManager.removeResource(
            inventory,
            InventoryResourceType.Money,
            amount,
        );
    }

    private createDefaultResourceItemStocks(): Map<MedicalShopResourceItemType, number> {
        const stocks = new Map<MedicalShopResourceItemType, number>();

        for (const itemType of Object.keys(MEDICAL_SHOP_RESOURCE_ITEM_CONFIG) as MedicalShopResourceItemType[]) {
            stocks.set(itemType, MEDICAL_SHOP_RESOURCE_ITEM_CONFIG[itemType].availableQuantity);
        }

        return stocks;
    }
}

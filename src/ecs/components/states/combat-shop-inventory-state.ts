import { InventoryManager } from "../../core/inventory-manager.js";
import { InventoryComponent } from "../inventory-component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
import {
    getCombatShopUpgradeItemPrice,
    getCombatShopUpgradeLevelFromProgress,
    getNextCombatShopUpgradeProgressLevel,
    isCombatShopUpgradeProgressMaxed,
    type CombatShopUpgradeType,
} from "../types/combat-shop-upgrade-config.js";
import { InventoryResourceType } from "../types/inventory-resource-type.js";

export class CombatShopInventoryState {
    private readonly inventoryManager = new InventoryManager();
    private workingInventory: InventoryComponent | null = null;

    public initializeFromSnapshot(snapshot: InventorySnapshot | null): void {
        this.applyInventorySnapshot(snapshot);
    }

    public applyInventorySnapshot(snapshot: InventorySnapshot | null): void {
        this.workingInventory = snapshot
            ? InventoryComponent.fromSnapshot(snapshot)
            : null;
    }

    public reset(): void {
        this.workingInventory = null;
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

    public getUpgradeItemLevel(upgradeType: CombatShopUpgradeType): number {
        const inventory = this.workingInventory;

        if (!inventory) {
            return 0;
        }

        return this.inventoryManager.getCombatUpgradeLevel(inventory, upgradeType);
    }

    public getUpgradeItemPrice(upgradeType: CombatShopUpgradeType): number {
        const currentLevel = this.getUpgradeItemLevel(upgradeType);
        const nextUpgradeLevel = getCombatShopUpgradeLevelFromProgress(currentLevel);

        return getCombatShopUpgradeItemPrice(upgradeType, nextUpgradeLevel);
    }

    public canPurchaseUpgradeItem(upgradeType: CombatShopUpgradeType): boolean {
        if (!this.workingInventory) {
            return false;
        }

        return !isCombatShopUpgradeProgressMaxed(
            this.getUpgradeItemLevel(upgradeType),
        );
    }

    public tryPurchaseUpgradeItem(upgradeType: CombatShopUpgradeType): boolean {
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

        this.inventoryManager.setCombatUpgradeLevel(
            inventory,
            upgradeType,
            getNextCombatShopUpgradeProgressLevel(
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
}

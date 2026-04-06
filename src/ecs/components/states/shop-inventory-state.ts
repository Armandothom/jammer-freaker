import { InventoryComponent } from "../inventory-component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
import { InventoryResourceType } from "../types/inventory-resource-type.js";
import { SHOP_RESOURCE_ITEM_CONFIG, ShopResourceItemType } from "../types/shop-resource-item-config.js";
import { ShopWeaponItemType } from "../types/shop-weapon-item-config.js";
import { SHOP_WEAPON_ITEM_CONFIG } from "../types/shop-weapon-item-config.js";
import { WeaponConfig } from "../types/weapon-type.js";
import { InventoryManager } from "../../core/inventory-manager.js";

export class ShopInventoryState {
    private readonly inventoryManager = new InventoryManager();
    private workingInventory: InventoryComponent | null = null;
    private availableResourceItemStocks = this.createDefaultResourceItemStocks();

    public initializeFromSnapshot(snapshot: InventorySnapshot | null): void {
        this.workingInventory = snapshot
            ? InventoryComponent.fromSnapshot(snapshot)
            : null;
        this.availableResourceItemStocks = this.createDefaultResourceItemStocks();
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

    public isWeaponItemPurchased(itemType: ShopWeaponItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const weaponType = SHOP_WEAPON_ITEM_CONFIG[itemType].weaponType;
        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        return weaponState?.owned ?? false;
    }

    public tryPurchaseWeaponItem(itemType: ShopWeaponItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory || this.isWeaponItemPurchased(itemType)) {
            return false;
        }

        const itemConfig = SHOP_WEAPON_ITEM_CONFIG[itemType];
        if (!this.trySpendMoney(itemConfig.price)) {
            return false;
        }

        const weaponState = this.inventoryManager.getOrCreateWeaponState(
            inventory,
            itemConfig.weaponType,
        );

        weaponState.owned = true;
        weaponState.roundsInMag = Math.max(
            weaponState.roundsInMag,
            WeaponConfig[itemConfig.weaponType].maxBullets,
        );

        if (inventory.equippedWeaponType == null) {
            inventory.equippedWeaponType = itemConfig.weaponType;
        }

        return true;
    }

    public tryPurchaseResourceItem(itemType: ShopResourceItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const itemConfig = SHOP_RESOURCE_ITEM_CONFIG[itemType];
        const currentStock = this.getAvailableResourceItemStock(itemType);

        if (currentStock <= 0) {
            return false;
        }

        if (!this.trySpendMoney(itemConfig.price)) {
            return false;
        }

        this.availableResourceItemStocks.set(itemType, currentStock - 1);

        this.inventoryManager.addResource(
            inventory,
            itemConfig.resourceType,
            1,
        );

        return true;
    }

    public getAvailableResourceItemStock(itemType: ShopResourceItemType): number {
        return this.availableResourceItemStocks.get(itemType) ?? 0;
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

    private createDefaultResourceItemStocks(): Map<ShopResourceItemType, number> {
        const stocks = new Map<ShopResourceItemType, number>();

        for (const itemType of Object.keys(SHOP_RESOURCE_ITEM_CONFIG) as ShopResourceItemType[]) {
            stocks.set(itemType, SHOP_RESOURCE_ITEM_CONFIG[itemType].availableQuantity);
        }

        return stocks;
    }
}

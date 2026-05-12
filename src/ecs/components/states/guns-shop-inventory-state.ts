import { InventoryManager } from "../../core/inventory-manager.js";
import { InventoryComponent } from "../inventory-component.js";
import type { InventorySnapshot } from "../snapshots/inventory-snapshot.js";
import { InventoryResourceType } from "../types/inventory-resource-type.js";
import { GUNS_SHOP_RESOURCE_ITEM_CONFIG, GunsShopResourceItemType } from "../types/guns-shop-resource-item-config.js";
import { GUNS_SHOP_WEAPON_ITEM_CONFIG, GunsShopWeaponItemType } from "../types/guns-shop-weapon-item-config.js";
import { WeaponConfig, WeaponType } from "../types/weapon-config.js";
import {
    getNextWeaponUpgradeProgressLevel,
    getWeaponUpgradeLevelFromProgress,
    getWeaponUpgradePrice,
    isWeaponUpgradeProgressMaxed,
    normalizeStoredWeaponUpgradeLevel,
    type StoredWeaponUpgradeLevel,
    type UpgradableWeaponType,
    type UpgradeLevel,
    WeaponUpgradeType,
} from "../types/weapon-upgrade-config.js";
import type { OwnedWeaponState } from "./owned-weapon-state.js";

export class GunsShopInventoryState {
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
        this.syncAllWeaponUpgradeStates();
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

    public isWeaponItemPurchased(itemType: GunsShopWeaponItemType): boolean {
        const weaponType = GUNS_SHOP_WEAPON_ITEM_CONFIG[itemType].weaponType;
        return this.isWeaponOwned(weaponType);
    }

    public isWeaponOwned(weaponType: WeaponType): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        return weaponState?.owned ?? false;
    }

    public tryPurchaseWeaponItem(itemType: GunsShopWeaponItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory || this.isWeaponItemPurchased(itemType)) {
            return false;
        }

        const itemConfig = GUNS_SHOP_WEAPON_ITEM_CONFIG[itemType];
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

    public tryPurchaseResourceItem(itemType: GunsShopResourceItemType): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const itemConfig = GUNS_SHOP_RESOURCE_ITEM_CONFIG[itemType];
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
            itemConfig.resourceAmount,
        );

        return true;
    }

    public tryPurchaseWeaponUpgrade(
        weaponType: UpgradableWeaponType,
        upgradeType: WeaponUpgradeType,
    ): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        if (!weaponState?.owned) {
            return false;
        }

        if (upgradeType === WeaponUpgradeType.MAXED_OUT) {
            if (!this.areStandardWeaponUpgradesMaxed(weaponState) || weaponState.upgrades.maxedOut) {
                return false;
            }

            if (!this.trySpendMoney(getWeaponUpgradePrice(weaponType, upgradeType, 1))) {
                return false;
            }

            weaponState.upgrades.maxedOut = true;
            return true;
        }

        const currentProgressLevel = this.getStoredWeaponUpgradeLevel(weaponState, upgradeType);

        if (isWeaponUpgradeProgressMaxed(currentProgressLevel)) {
            return false;
        }

        const nextUpgradeLevel = getWeaponUpgradeLevelFromProgress(currentProgressLevel);
        const upgradePrice = getWeaponUpgradePrice(weaponType, upgradeType, nextUpgradeLevel);

        if (!this.trySpendMoney(upgradePrice)) {
            return false;
        }

        this.setStoredWeaponUpgradeLevel(
            weaponState,
            upgradeType,
            getNextWeaponUpgradeProgressLevel(currentProgressLevel),
        );

        return true;
    }

    public getAvailableResourceItemStock(itemType: GunsShopResourceItemType): number {
        return this.availableResourceItemStocks.get(itemType) ?? 0;
    }

    public canPurchaseWeaponUpgrade(
        weaponType: UpgradableWeaponType,
        upgradeType: WeaponUpgradeType,
    ): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        if (!weaponState?.owned) {
            return false;
        }

        if (upgradeType === WeaponUpgradeType.MAXED_OUT) {
            return this.areStandardWeaponUpgradesMaxed(weaponState)
                && !weaponState.upgrades.maxedOut;
        }

        return !isWeaponUpgradeProgressMaxed(
            this.getStoredWeaponUpgradeLevel(weaponState, upgradeType),
        );
    }

    public shouldShowWeaponMaxedOutUpgrade(
        weaponType: UpgradableWeaponType,
    ): boolean {
        const inventory = this.workingInventory;

        if (!inventory) {
            return false;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        if (!weaponState?.owned) {
            return false;
        }

        return this.areStandardWeaponUpgradesMaxed(weaponState);
    }

    public getWeaponUpgradeProgressLevel(
        weaponType: UpgradableWeaponType,
        upgradeType: WeaponUpgradeType,
    ): StoredWeaponUpgradeLevel {
        const inventory = this.workingInventory;

        if (!inventory) {
            return 0;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        if (!weaponState) {
            return 0;
        }

        return normalizeStoredWeaponUpgradeLevel(
            this.getStoredWeaponUpgradeLevel(weaponState, upgradeType),
        );
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

    private createDefaultResourceItemStocks(): Map<GunsShopResourceItemType, number> {
        const stocks = new Map<GunsShopResourceItemType, number>();

        for (const itemType of Object.keys(GUNS_SHOP_RESOURCE_ITEM_CONFIG) as GunsShopResourceItemType[]) {
            stocks.set(itemType, GUNS_SHOP_RESOURCE_ITEM_CONFIG[itemType].availableQuantity);
        }

        return stocks;
    }

    public getWeaponUpgradeLevel(
        weaponType: UpgradableWeaponType,
        upgradeType: WeaponUpgradeType,
    ): UpgradeLevel {
        const inventory = this.workingInventory;

        if (!inventory) {
            return 1;
        }

        const weaponState = this.inventoryManager.getWeaponState(inventory, weaponType);

        if (!weaponState) {
            return 1;
        }

        switch (upgradeType) {
            case WeaponUpgradeType.DAMAGE:
                return getWeaponUpgradeLevelFromProgress(weaponState.upgrades.damageLevel);

            case WeaponUpgradeType.FIRE_RATE:
                return getWeaponUpgradeLevelFromProgress(weaponState.upgrades.fireRateLevel);

            case WeaponUpgradeType.MAG_SIZE:
                return getWeaponUpgradeLevelFromProgress(weaponState.upgrades.magSizeLevel);

            case WeaponUpgradeType.MAXED_OUT:
                return 1;
        }
    }

    private getStoredWeaponUpgradeLevel(
        weaponState: OwnedWeaponState,
        upgradeType: WeaponUpgradeType,
    ): number {
        switch (upgradeType) {
            case WeaponUpgradeType.DAMAGE:
                return weaponState.upgrades.damageLevel;

            case WeaponUpgradeType.FIRE_RATE:
                return weaponState.upgrades.fireRateLevel;

            case WeaponUpgradeType.MAG_SIZE:
                return weaponState.upgrades.magSizeLevel;

            case WeaponUpgradeType.MAXED_OUT:
                return weaponState.upgrades.maxedOut ? 1 : 0;
        }
    }

    private setStoredWeaponUpgradeLevel(
        weaponState: OwnedWeaponState,
        upgradeType: WeaponUpgradeType,
        level: number,
    ): void {
        switch (upgradeType) {
            case WeaponUpgradeType.DAMAGE:
                weaponState.upgrades.damageLevel = level;
                return;

            case WeaponUpgradeType.FIRE_RATE:
                weaponState.upgrades.fireRateLevel = level;
                return;

            case WeaponUpgradeType.MAG_SIZE:
                weaponState.upgrades.magSizeLevel = level;
                return;

            case WeaponUpgradeType.MAXED_OUT:
                weaponState.upgrades.maxedOut = level >= 1;
                return;
        }
    }

    private areStandardWeaponUpgradesMaxed(weaponState: OwnedWeaponState): boolean {
        return isWeaponUpgradeProgressMaxed(weaponState.upgrades.damageLevel)
            && isWeaponUpgradeProgressMaxed(weaponState.upgrades.fireRateLevel)
            && isWeaponUpgradeProgressMaxed(weaponState.upgrades.magSizeLevel);
    }

    private syncAllWeaponUpgradeStates(): void {
        const inventory = this.workingInventory;

        if (!inventory) {
            return;
        }

        for (const weaponState of inventory.weapons.values()) {
            weaponState.upgrades.maxedOut = weaponState.upgrades.maxedOut === true;
        }
    }
}

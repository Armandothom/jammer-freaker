import { InventoryComponent } from "../components/inventory-component.js";
import { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { OwnedWeaponState } from "../components/states/owned-weapon-state.js";
import { WeaponUpgradeState } from "../components/states/weapon-upgrade-state.js";
import {
    clampInventoryResourceAmount,
    InventoryResourceType,
    isInventoryResourceType,
} from "../components/types/inventory-resource-type.js";
import {
    clampMiscResourceAmount,
    MiscResourceType,
} from "../components/types/misc-resource-type.js";
import {
    BackpackType,
    getBackpackLevel,
    getBackpackMaxSlots,
    getBackpackTypeForMiscResource,
    isBackpackMiscResourceType,
    normalizeBackpackType,
} from "../components/types/backpack-config.js";
import type { LootContainerContentComponent } from "../components/loot-container-content.component.js";
import type { LootTableItemId } from "../../game/world/loot/loot-tables.js";
import {
    getCombatShopUpgradeLevelConfig,
    normalizeStoredCombatShopUpgradeLevel,
    type CombatShopUpgradeDisplayValue,
    type CombatShopUpgradeLevel,
    type CombatShopUpgradeType,
    type StoredCombatShopUpgradeLevel,
} from "../components/types/combat-shop-upgrade-config.js";
import {
    getMedicalShopUpgradeLevelConfig,
    normalizeStoredMedicalShopUpgradeLevel,
    type MedicalShopUpgradeDisplayValue,
    type MedicalShopUpgradeItemType,
    type MedicalShopUpgradeLevel,
    type StoredMedicalShopUpgradeLevel,
} from "../components/types/medical-shop-upgrade-item-config.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-config.js";

export class InventoryManager {
    private static readonly DEBUG_RESOURCE_BUNDLE_AMOUNTS: ReadonlyArray<[InventoryResourceType, number]> = [
        [InventoryResourceType.PistolMag, 99],
        [InventoryResourceType.SmgMag, 99],
        [InventoryResourceType.RifleMag, 99],
        [InventoryResourceType.ShotgunShell, 99],
        [InventoryResourceType.SniperMag, 99],
        [InventoryResourceType.Grenade, 99],
        [InventoryResourceType.Epipen, 99],
        [InventoryResourceType.CombatStim, 99],
        [InventoryResourceType.Healpack, 99],
        [InventoryResourceType.Bandage, 99],
        [InventoryResourceType.Money, 99999],
    ];

    public createDefaultInventory(initialWeaponType: WeaponType): InventoryComponent {
        const inventory = new InventoryComponent();

        const initialWeaponConfig = WeaponConfig[initialWeaponType];

        const initialWeaponState = new OwnedWeaponState(
            true,
            initialWeaponConfig.maxBullets,
            new WeaponUpgradeState(),
        );

        inventory.weapons.set(initialWeaponType, initialWeaponState);
        inventory.equippedWeaponType = initialWeaponType;
        inventory.resources.set(InventoryResourceType.PistolMag, 3);

        return inventory;
    }

    public getBackpackType(inventory: InventoryComponent): BackpackType {
        return normalizeBackpackType(inventory.backpackType);
    }

    public getBackpackLevel(inventory: InventoryComponent): number {
        return getBackpackLevel(this.getBackpackType(inventory));
    }

    public getBackpackMaxSlots(inventory: InventoryComponent): number {
        return getBackpackMaxSlots(this.getBackpackType(inventory));
    }

    public getBackpackUsedSlots(inventory: InventoryComponent): number {
        let usedSlots = 0;

        for (const [resourceType, amount] of inventory.resources.entries()) {
            if (!this.isBackpackLimitedResourceType(resourceType)) {
                continue;
            }

            if (this.normalizeInventoryItemAmount(amount) > 0) {
                usedSlots += 1;
            }
        }

        for (const [miscResourceType, amount] of inventory.miscResources.entries()) {
            if (isBackpackMiscResourceType(miscResourceType)) {
                continue;
            }

            if (this.normalizeInventoryItemAmount(amount) > 0) {
                usedSlots += 1;
            }
        }

        return usedSlots;
    }

    public getBackpackAvailableSlots(inventory: InventoryComponent): number {
        return Math.max(
            0,
            this.getBackpackMaxSlots(inventory) - this.getBackpackUsedSlots(inventory),
        );
    }

    public canUpgradeBackpack(
        inventory: InventoryComponent,
        nextBackpackType: BackpackType,
    ): boolean {
        return getBackpackLevel(nextBackpackType) > this.getBackpackLevel(inventory);
    }

    public upgradeBackpack(
        inventory: InventoryComponent,
        nextBackpackType: BackpackType,
    ): boolean {
        const normalizedBackpackType = normalizeBackpackType(nextBackpackType);

        if (!this.canUpgradeBackpack(inventory, normalizedBackpackType)) {
            return false;
        }

        inventory.backpackType = normalizedBackpackType;
        return true;
    }

    public resolveBackpackUpgradeType(itemId: LootTableItemId): BackpackType | null {
        if (isInventoryResourceType(itemId)) {
            return null;
        }

        return getBackpackTypeForMiscResource(itemId);
    }

    public canCollectBackpackUpgradeItem(
        inventory: InventoryComponent,
        itemId: LootTableItemId,
    ): boolean {
        const backpackType = this.resolveBackpackUpgradeType(itemId);

        return backpackType !== null
            && this.canUpgradeBackpack(inventory, backpackType);
    }

    public logFailedToStash(
        inventory: InventoryComponent,
        itemId: LootTableItemId,
        amount: number,
    ): void {
        console.log(
            `Failed to stash (${this.normalizeInventoryItemAmount(amount)} ${itemId}), (${this.getBackpackAvailableSlots(inventory)} backpack spaces remaining)`,
        );
    }

    public getWeaponState(
        inventory: InventoryComponent,
        weaponType: WeaponType
    ): OwnedWeaponState | null {
        return inventory.weapons.get(weaponType) ?? null;
    }

    public getOrCreateWeaponState(
        inventory: InventoryComponent,
        weaponType: WeaponType
    ): OwnedWeaponState {
        let weaponState = inventory.weapons.get(weaponType);

        if (!weaponState) {
            weaponState = new OwnedWeaponState();
            inventory.weapons.set(weaponType, weaponState);
        }

        return weaponState;
    }

    public getResourceAmount(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType
    ): number {
        return inventory.resources.get(resourceType) ?? 0;
    }

    public setResourceAmount(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
        amount: number
    ): void {
        inventory.resources.set(
            resourceType,
            clampInventoryResourceAmount(resourceType, amount),
        );
    }

    public canAddResource(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
        amount: number
    ): boolean {
        const normalizedAmount = this.normalizeInventoryItemAmount(amount);

        if (normalizedAmount <= 0) {
            return false;
        }

        const addableAmount = this.getAddableResourceAmount(
            inventory,
            resourceType,
            normalizedAmount,
        );

        if (addableAmount < normalizedAmount) {
            return false;
        }

        return this.getResourceBackpackSlotCost(inventory, resourceType)
            <= this.getBackpackAvailableSlots(inventory);
    }

    public addResource(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
        amount: number
    ): boolean {
        const normalizedAmount = this.normalizeInventoryItemAmount(amount);

        if (!this.canAddResource(inventory, resourceType, normalizedAmount)) {
            this.logFailedToStash(inventory, resourceType, normalizedAmount);
            return false;
        }

        const current = this.getResourceAmount(inventory, resourceType);
        this.setResourceAmount(inventory, resourceType, current + normalizedAmount);
        return true;
    }

    public removeResource(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
        amount: number
    ): boolean {
        if (amount <= 0) {
            return false;
        }

        const current = this.getResourceAmount(inventory, resourceType);

        if (current < amount) {
            return false;
        }

        this.setResourceAmount(inventory, resourceType, current - amount);
        return true;
    }

    public getMiscResourceAmount(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType
    ): number {
        return inventory.miscResources.get(miscResourceType) ?? 0;
    }

    public setMiscResourceAmount(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType,
        amount: number
    ): void {
        inventory.miscResources.set(
            miscResourceType,
            clampMiscResourceAmount(amount),
        );
    }

    public canAddMiscResource(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType,
        amount: number
    ): boolean {
        const normalizedAmount = this.normalizeInventoryItemAmount(amount);

        if (normalizedAmount <= 0) {
            return false;
        }

        if (isBackpackMiscResourceType(miscResourceType)) {
            return false;
        }

        const addableAmount = this.getAddableMiscResourceAmount(
            inventory,
            miscResourceType,
            normalizedAmount,
        );

        if (addableAmount < normalizedAmount) {
            return false;
        }

        return this.getMiscResourceBackpackSlotCost(inventory, miscResourceType)
            <= this.getBackpackAvailableSlots(inventory);
    }

    public addMiscResource(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType,
        amount: number
    ): boolean {
        const normalizedAmount = this.normalizeInventoryItemAmount(amount);

        if (!this.canAddMiscResource(inventory, miscResourceType, normalizedAmount)) {
            this.logFailedToStash(inventory, miscResourceType, normalizedAmount);
            return false;
        }

        const current = this.getMiscResourceAmount(inventory, miscResourceType);
        this.setMiscResourceAmount(inventory, miscResourceType, current + normalizedAmount);
        return true;
    }

    public removeMiscResource(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType,
        amount: number
    ): boolean {
        if (amount <= 0) {
            return false;
        }

        const current = this.getMiscResourceAmount(inventory, miscResourceType);

        if (current < amount) {
            return false;
        }

        this.setMiscResourceAmount(inventory, miscResourceType, current - amount);
        return true;
    }

    public canAddLootItem(
        inventory: InventoryComponent,
        itemId: LootTableItemId,
        amount: number,
    ): boolean {
        if (isInventoryResourceType(itemId)) {
            return this.canAddResource(inventory, itemId, amount);
        }

        return this.canAddMiscResource(inventory, itemId, amount);
    }

    public addLootItem(
        inventory: InventoryComponent,
        itemId: LootTableItemId,
        amount: number,
    ): boolean {
        if (isInventoryResourceType(itemId)) {
            return this.addResource(inventory, itemId, amount);
        }

        return this.addMiscResource(inventory, itemId, amount);
    }

    public addLootContainerContent(
        inventory: InventoryComponent,
        lootContainerContent: LootContainerContentComponent,
    ): number {
        let addedItems = 0;

        for (const lootSlot of lootContainerContent.lootSlots) {
            if (!lootSlot) {
                continue;
            }

            if (this.addLootItem(inventory, lootSlot.itemId, lootSlot.amount)) {
                addedItems++;
            }
        }

        return addedItems;
    }

    public getMedicalUpgradeLevel(
        inventory: InventoryComponent,
        upgradeType: MedicalShopUpgradeItemType,
    ): StoredMedicalShopUpgradeLevel {
        return normalizeStoredMedicalShopUpgradeLevel(
            inventory.medicalUpgrades.get(upgradeType) ?? 0,
        );
    }

    public setMedicalUpgradeLevel(
        inventory: InventoryComponent,
        upgradeType: MedicalShopUpgradeItemType,
        level: number,
    ): void {
        inventory.medicalUpgrades.set(
            upgradeType,
            normalizeStoredMedicalShopUpgradeLevel(level),
        );
    }

    public getMedicalUpgradeValue(
        inventory: InventoryComponent,
        upgradeType: MedicalShopUpgradeItemType,
    ): MedicalShopUpgradeDisplayValue | null {
        const level = this.getMedicalUpgradeLevel(inventory, upgradeType);

        if (level <= 0) {
            return null;
        }

        return getMedicalShopUpgradeLevelConfig(
            upgradeType,
            level as MedicalShopUpgradeLevel,
        ).value;
    }

    public getMedicalUpgradeValueOrDefault(
        inventory: InventoryComponent,
        upgradeType: MedicalShopUpgradeItemType,
        defaultValue: MedicalShopUpgradeDisplayValue = 1,
    ): MedicalShopUpgradeDisplayValue {
        return this.getMedicalUpgradeValue(inventory, upgradeType) ?? defaultValue;
    }

    public getCombatUpgradeLevel(
        inventory: InventoryComponent,
        upgradeType: CombatShopUpgradeType,
    ): StoredCombatShopUpgradeLevel {
        return normalizeStoredCombatShopUpgradeLevel(
            inventory.combatUpgrades.get(upgradeType) ?? 0,
        );
    }

    public setCombatUpgradeLevel(
        inventory: InventoryComponent,
        upgradeType: CombatShopUpgradeType,
        level: number,
    ): void {
        inventory.combatUpgrades.set(
            upgradeType,
            normalizeStoredCombatShopUpgradeLevel(level),
        );
    }

    public getCombatUpgradeValue(
        inventory: InventoryComponent,
        upgradeType: CombatShopUpgradeType,
    ): CombatShopUpgradeDisplayValue | null {
        const level = this.getCombatUpgradeLevel(inventory, upgradeType);

        if (level <= 0) {
            return null;
        }

        return getCombatShopUpgradeLevelConfig(
            upgradeType,
            level as CombatShopUpgradeLevel,
        ).value;
    }

    public getCombatUpgradeValueOrDefault(
        inventory: InventoryComponent,
        upgradeType: CombatShopUpgradeType,
        defaultValue: CombatShopUpgradeDisplayValue = 1,
    ): CombatShopUpgradeDisplayValue {
        return this.getCombatUpgradeValue(inventory, upgradeType) ?? defaultValue;
    }

    public getRoundsInMag(
        inventory: InventoryComponent,
        weaponType: WeaponType,
    ): number {
        const weaponState = this.getWeaponState(inventory, weaponType);

        if (!weaponState || !weaponState.owned) {
            return 0;
        }

        return Math.max(0, weaponState.roundsInMag);
    }

    public hasRoundsInMag(
        inventory: InventoryComponent,
        weaponType: WeaponType,
        minimumAmount: number = 1,
    ): boolean {
        if (minimumAmount <= 0) {
            return true;
        }

        return this.getRoundsInMag(inventory, weaponType) >= minimumAmount;
    }

    public consumeRoundInMag(
        inventory: InventoryComponent,
        weaponType: WeaponType,
    ): boolean {
        return this.removeRoundsInMag(inventory, weaponType, 1);
    }

    public addRoundsInMag(
        inventory: InventoryComponent,
        weaponType: WeaponType,
        amount: number,
    ): void {
        if (amount <= 0) {
            return;
        }

        const weaponState = this.getOrCreateWeaponState(inventory, weaponType);
        weaponState.roundsInMag = Math.max(0, weaponState.roundsInMag + amount);
    }

    public removeRoundsInMag(
        inventory: InventoryComponent,
        weaponType: WeaponType,
        amount: number,
    ): boolean {
        if (amount <= 0) {
            return false;
        }

        const weaponState = this.getWeaponState(inventory, weaponType);

        if (!weaponState || !weaponState.owned) {
            return false;
        }

        if (weaponState.roundsInMag < amount) {
            return false;
        }

        weaponState.roundsInMag = Math.max(0, weaponState.roundsInMag - amount);
        return true;
    }

    public setRoundsInMag(
        inventory: InventoryComponent,
        weaponType: WeaponType,
        amount: number,
    ): void {
        const weaponState = this.getOrCreateWeaponState(inventory, weaponType);
        weaponState.roundsInMag = Math.max(0, amount);
    }

    public getAmmoResourceTypeForWeapon(
        weaponType: WeaponType
    ): InventoryResourceType {
        switch (weaponType) {
            case WeaponType.PISTOL:
                return InventoryResourceType.PistolMag;

            case WeaponType.SMG:
                return InventoryResourceType.SmgMag;

            case WeaponType.RIFLE:
                return InventoryResourceType.RifleMag;

            case WeaponType.SHOTGUN:
                return InventoryResourceType.ShotgunShell;

            case WeaponType.SNIPER:
                return InventoryResourceType.SniperMag;

            default:
                throw new Error(`Weapon ${weaponType} does not consume ammo`);
        }
    }

    private getAddableResourceAmount(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
        amount: number,
    ): number {
        const current = this.getResourceAmount(inventory, resourceType);
        const next = clampInventoryResourceAmount(resourceType, current + amount);

        return Math.max(0, next - current);
    }

    private getAddableMiscResourceAmount(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType,
        amount: number,
    ): number {
        const current = this.getMiscResourceAmount(inventory, miscResourceType);
        const next = clampMiscResourceAmount(current + amount);

        return Math.max(0, next - current);
    }

    private getResourceBackpackSlotCost(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
    ): number {
        if (!this.isBackpackLimitedResourceType(resourceType)) {
            return 0;
        }

        return this.getResourceAmount(inventory, resourceType) > 0 ? 0 : 1;
    }

    private getMiscResourceBackpackSlotCost(
        inventory: InventoryComponent,
        miscResourceType: MiscResourceType,
    ): number {
        return this.getMiscResourceAmount(inventory, miscResourceType) > 0 ? 0 : 1;
    }

    private isBackpackLimitedResourceType(resourceType: InventoryResourceType): boolean {
        return resourceType !== InventoryResourceType.Money;
    }

    private normalizeInventoryItemAmount(amount: number): number {
        return Math.max(0, Math.floor(amount));
    }

    public debugPrintInventory(inventory: InventoryComponent): void {
        console.log("===== INVENTORY =====");
        console.log("Equipped:", inventory.equippedWeaponType ?? "none");
        console.log(
            "Backpack:",
            `${this.getBackpackType(inventory)} (${this.getBackpackUsedSlots(inventory)}/${this.getBackpackMaxSlots(inventory)} slots)`,
        );

        console.log("---- Weapons ----");
        for (const [weaponType, weaponState] of inventory.weapons.entries()) {
            console.log(
                `${weaponType} | owned=${weaponState.owned} | roundsInMag=${weaponState.roundsInMag} | damageLevel=${weaponState.upgrades.damageLevel} | magSizeLevel=${weaponState.upgrades.magSizeLevel} | fireRateLevel=${weaponState.upgrades.fireRateLevel} | maxedOut=${weaponState.upgrades.maxedOut}`
            );
        }

        console.log("---- Resources ----");
        console.log(`pistol_mag: ${this.getResourceAmount(inventory, InventoryResourceType.PistolMag)}`);
        console.log(`smg_mag: ${this.getResourceAmount(inventory, InventoryResourceType.SmgMag)}`);
        console.log(`rifle_mag: ${this.getResourceAmount(inventory, InventoryResourceType.RifleMag)}`);
        console.log(`shotgun_shell: ${this.getResourceAmount(inventory, InventoryResourceType.ShotgunShell)}`);
        console.log(`shotgun_shell_box: ${this.getResourceAmount(inventory, InventoryResourceType.ShotgunShellBox)}`);
        console.log(`grenade: ${this.getResourceAmount(inventory, InventoryResourceType.Grenade)}`);
        console.log(`money: ${this.getResourceAmount(inventory, InventoryResourceType.Money)}`);

        console.log("====================");
    }

    public createSnapshot(inventory: InventoryComponent): InventorySnapshot {
        return inventory.toSnapshot();
    }

    public addDebugResourceBundle(inventory: InventoryComponent): void {
        for (const [resourceType, amount] of InventoryManager.DEBUG_RESOURCE_BUNDLE_AMOUNTS) {
            this.addResource(inventory, resourceType, amount);
        }
    }
}

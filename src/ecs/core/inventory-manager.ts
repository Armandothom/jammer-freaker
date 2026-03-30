import { InventoryComponent } from "../components/inventory-component.js";
import { OwnedWeaponState } from "../components/states/owned-weapon-state.js";
import { WeaponUpgradeState } from "../components/states/weapon-upgrade-state.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";

export class InventoryManager {
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
        inventory.resources.set(resourceType, Math.max(0, amount));
    }

    public addResource(
        inventory: InventoryComponent,
        resourceType: InventoryResourceType,
        amount: number
    ): void {
        if (amount <= 0) {
            return;
        }

        const current = this.getResourceAmount(inventory, resourceType);
        inventory.resources.set(resourceType, current + amount);
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

        inventory.resources.set(resourceType, current - amount);
        return true;
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

            default:
                throw new Error(`Weapon ${weaponType} does not consume ammo`);
        }
    }

    public debugPrintInventory(inventory: InventoryComponent): void {
        console.log("===== INVENTORY =====");
        console.log("Equipped:", inventory.equippedWeaponType ?? "none");

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
        console.log(`grenade: ${this.getResourceAmount(inventory, InventoryResourceType.Grenade)}`);
        console.log(`money: ${this.getResourceAmount(inventory, InventoryResourceType.Money)}`);

        console.log("====================");
    }
}
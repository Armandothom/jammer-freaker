
import { InventorySnapshot } from "./snapshots/inventory-snapshot.js";
import { WeaponSnapshot } from "./snapshots/weapon-snapshot.js";
import { OwnedWeaponState } from "./states/owned-weapon-state.js";
import { WeaponUpgradeState } from "./states/weapon-upgrade-state.js";
import { InventoryResourceType } from "./types/inventory-resource-type.js";
import { WeaponType } from "./types/weapon-type.js";

export class InventoryComponent {
    public weapons: Map<WeaponType, OwnedWeaponState>;
    public resources: Map<InventoryResourceType, number>;
    public equippedWeaponType: WeaponType | null;

    constructor(
        weapons?: Map<WeaponType, OwnedWeaponState>,
        resources?: Map<InventoryResourceType, number>,
        equippedWeaponType: WeaponType | null = null,
    ) {
        this.weapons = weapons ?? new Map<WeaponType, OwnedWeaponState>();
        this.resources = resources ?? new Map<InventoryResourceType, number>();
        this.equippedWeaponType = equippedWeaponType;
    }

    public toSnapshot(): InventorySnapshot {
        const weaponSnapshots = new Map<WeaponType, WeaponSnapshot>();

        for (const [weaponType, weaponState] of this.weapons.entries()) {
            weaponSnapshots.set(
                weaponType,
                new WeaponSnapshot(
                    weaponState.owned,
                    weaponState.roundsInMag,
                    weaponState.upgrades.damageLevel,
                    weaponState.upgrades.magSizeLevel,
                    weaponState.upgrades.fireRateLevel,
                    weaponState.upgrades.maxedOut,
                ),
            );
        }

        const resourceSnapshots = new Map<InventoryResourceType, number>();

        for (const [resourceType, amount] of this.resources.entries()) {
            resourceSnapshots.set(resourceType, amount);
        }

        return new InventorySnapshot(
            weaponSnapshots,
            resourceSnapshots,
            this.equippedWeaponType,
        );
    }

    public static fromSnapshot(snapshot: InventorySnapshot): InventoryComponent {
        const weapons = new Map<WeaponType, OwnedWeaponState>();

        for (const [weaponType, weaponSnapshot] of snapshot.weapons.entries()) {
            weapons.set(
                weaponType,
                new OwnedWeaponState(
                    weaponSnapshot.owned,
                    weaponSnapshot.roundsInMag,
                    new WeaponUpgradeState(
                        weaponSnapshot.damageLevel,
                        weaponSnapshot.magSizeLevel,
                        weaponSnapshot.fireRateLevel,
                        weaponSnapshot.maxedOut,
                    ),
                ),
            );
        }

        const resources = new Map<InventoryResourceType, number>();

        for (const [resourceType, amount] of snapshot.resources.entries()) {
            resources.set(resourceType, amount);
        }

        return new InventoryComponent(
            weapons,
            resources,
            snapshot.equippedWeaponType,
        );
    }

    public clone(): InventoryComponent {
        return InventoryComponent.fromSnapshot(this.toSnapshot());
    }
}
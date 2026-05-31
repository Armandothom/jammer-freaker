
import { InventorySnapshot } from "./snapshots/inventory-snapshot.js";
import { WeaponSnapshot } from "./snapshots/weapon-snapshot.js";
import { OwnedWeaponState } from "./states/owned-weapon-state.js";
import { WeaponUpgradeState } from "./states/weapon-upgrade-state.js";
import {
    clampInventoryResourceAmount,
    InventoryResourceType,
    SHOTGUN_SHELLS_PER_BOX,
} from "./types/inventory-resource-type.js";
import {
    clampMiscResourceAmount,
    MiscResourceType,
} from "./types/misc-resource-type.js";
import {
    BackpackType,
    getBackpackLevel,
    getBackpackTypeForMiscResource,
    normalizeBackpackType,
} from "./types/backpack-config.js";
import {
    normalizeStoredCombatShopUpgradeLevel,
    type CombatShopUpgradeType,
} from "./types/combat-shop-upgrade-config.js";
import {
    normalizeStoredMedicalShopUpgradeLevel,
    type MedicalShopUpgradeItemType,
} from "./types/medical-shop-upgrade-item-config.js";
import { WeaponType } from "./types/weapon-config.js";

export class InventoryComponent {
    public weapons: Map<WeaponType, OwnedWeaponState>;
    public resources: Map<InventoryResourceType, number>;
    public miscResources: Map<MiscResourceType, number>;
    public equippedWeaponType: WeaponType | null;
    public medicalUpgrades: Map<MedicalShopUpgradeItemType, number>;
    public combatUpgrades: Map<CombatShopUpgradeType, number>;
    public backpackType: BackpackType;

    constructor(
        weapons?: Map<WeaponType, OwnedWeaponState>,
        resources?: Map<InventoryResourceType, number>,
        miscResources?: Map<MiscResourceType, number>,
        equippedWeaponType: WeaponType | null = null,
        medicalUpgrades?: Map<MedicalShopUpgradeItemType, number>,
        combatUpgrades?: Map<CombatShopUpgradeType, number>,
        backpackType: BackpackType = BackpackType.NO_BACKPACK,
    ) {
        this.weapons = weapons ?? new Map<WeaponType, OwnedWeaponState>();
        this.resources = resources ?? new Map<InventoryResourceType, number>();
        this.miscResources = miscResources ?? new Map<MiscResourceType, number>();
        this.equippedWeaponType = equippedWeaponType;
        this.medicalUpgrades = medicalUpgrades ?? new Map<MedicalShopUpgradeItemType, number>();
        this.combatUpgrades = combatUpgrades ?? new Map<CombatShopUpgradeType, number>();
        this.backpackType = backpackType;
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

        const miscResourceSnapshots = new Map<MiscResourceType, number>();

        for (const [miscResourceType, amount] of this.miscResources.entries()) {
            miscResourceSnapshots.set(miscResourceType, amount);
        }

        const medicalUpgradeSnapshots = new Map<MedicalShopUpgradeItemType, number>();

        for (const [upgradeType, level] of this.medicalUpgrades.entries()) {
            medicalUpgradeSnapshots.set(
                upgradeType,
                normalizeStoredMedicalShopUpgradeLevel(level),
            );
        }

        const combatUpgradeSnapshots = new Map<CombatShopUpgradeType, number>();

        for (const [upgradeType, level] of this.combatUpgrades.entries()) {
            combatUpgradeSnapshots.set(
                upgradeType,
                normalizeStoredCombatShopUpgradeLevel(level),
            );
        }

        return new InventorySnapshot(
            weaponSnapshots,
            resourceSnapshots,
            this.equippedWeaponType,
            medicalUpgradeSnapshots,
            combatUpgradeSnapshots,
            miscResourceSnapshots,
            this.backpackType,
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
            resources.set(
                resourceType,
                clampInventoryResourceAmount(resourceType, amount),
            );
        }

        const legacyShotgunShellBoxes = resources.get(InventoryResourceType.ShotgunShellBox) ?? 0;
        if (legacyShotgunShellBoxes > 0) {
            const currentShotgunShells = resources.get(InventoryResourceType.ShotgunShell) ?? 0;
            resources.set(
                InventoryResourceType.ShotgunShell,
                clampInventoryResourceAmount(
                    InventoryResourceType.ShotgunShell,
                    currentShotgunShells + legacyShotgunShellBoxes * SHOTGUN_SHELLS_PER_BOX,
                ),
            );
            resources.delete(InventoryResourceType.ShotgunShellBox);
        }

        const miscResources = new Map<MiscResourceType, number>();
        let backpackType = normalizeBackpackType(snapshot.backpackType);

        for (const [miscResourceType, amount] of snapshot.miscResources?.entries() ?? []) {
            const miscBackpackType = getBackpackTypeForMiscResource(miscResourceType);

            if (miscBackpackType) {
                if (getBackpackLevel(miscBackpackType) > getBackpackLevel(backpackType)) {
                    backpackType = miscBackpackType;
                }
                continue;
            }

            miscResources.set(
                miscResourceType,
                clampMiscResourceAmount(amount),
            );
        }

        const medicalUpgrades = new Map<MedicalShopUpgradeItemType, number>();

        for (const [upgradeType, level] of snapshot.medicalUpgrades?.entries() ?? []) {
            medicalUpgrades.set(
                upgradeType,
                normalizeStoredMedicalShopUpgradeLevel(level),
            );
        }

        const combatUpgrades = new Map<CombatShopUpgradeType, number>();

        for (const [upgradeType, level] of snapshot.combatUpgrades?.entries() ?? []) {
            combatUpgrades.set(
                upgradeType,
                normalizeStoredCombatShopUpgradeLevel(level),
            );
        }

        return new InventoryComponent(
            weapons,
            resources,
            miscResources,
            snapshot.equippedWeaponType,
            medicalUpgrades,
            combatUpgrades,
            backpackType,
        );
    }

    public clone(): InventoryComponent {
        return InventoryComponent.fromSnapshot(this.toSnapshot());
    }
}

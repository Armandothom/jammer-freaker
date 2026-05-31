import type { CombatShopUpgradeType } from "../types/combat-shop-upgrade-config.js";
import { BackpackType } from "../types/backpack-config.js";
import type { MedicalShopUpgradeItemType } from "../types/medical-shop-upgrade-item-config.js";
import { InventoryResourceType } from "../types/inventory-resource-type.js";
import { MiscResourceType } from "../types/misc-resource-type.js";
import { WeaponType } from "../types/weapon-config.js";
import { WeaponSnapshot } from "./weapon-snapshot.js";

export class InventorySnapshot {
    constructor(
        public readonly weapons: ReadonlyMap<WeaponType, WeaponSnapshot>,
        public readonly resources: ReadonlyMap<InventoryResourceType, number>,
        public readonly equippedWeaponType: WeaponType | null,
        public readonly medicalUpgrades: ReadonlyMap<MedicalShopUpgradeItemType, number> = new Map<MedicalShopUpgradeItemType, number>(),
        public readonly combatUpgrades: ReadonlyMap<CombatShopUpgradeType, number> = new Map<CombatShopUpgradeType, number>(),
        public readonly miscResources: ReadonlyMap<MiscResourceType, number> = new Map<MiscResourceType, number>(),
        public readonly backpackType: BackpackType = BackpackType.NO_BACKPACK,
    ) { }
}

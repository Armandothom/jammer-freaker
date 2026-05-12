import type { MedicalShopUpgradeItemType } from "../types/medical-shop-upgrade-item-config.js";
import { InventoryResourceType } from "../types/inventory-resource-type.js";
import { WeaponType } from "../types/weapon-config.js";
import { WeaponSnapshot } from "./weapon-snapshot.js";

export class InventorySnapshot {
    constructor(
        public readonly weapons: ReadonlyMap<WeaponType, WeaponSnapshot>,
        public readonly resources: ReadonlyMap<InventoryResourceType, number>,
        public readonly equippedWeaponType: WeaponType | null,
        public readonly medicalUpgrades: ReadonlyMap<MedicalShopUpgradeItemType, number> = new Map<MedicalShopUpgradeItemType, number>(),
    ) { }
}

import { InventoryResourceType } from "../types/inventory-resource-type.js";
import { WeaponType } from "../types/weapon-type.js";
import { WeaponSnapshot } from "./weapon-snapshot.js";

export class InventorySnapshot {
    constructor(
        public readonly weapons: ReadonlyMap<WeaponType, WeaponSnapshot>,
        public readonly resources: ReadonlyMap<InventoryResourceType, number>,
        public readonly equippedWeaponType: WeaponType | null,
    ) { }
}

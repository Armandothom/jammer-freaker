import { InventoryResourceType } from "./inventory-resource-type.js";

export type DroppedResource = {
    type: InventoryResourceType;
    amount: number;
};

export type DropEntry = {
    chance: number; // 0–100 (%)
    quantity: number;
};

export const ItemDropRateTable: Record<InventoryResourceType, DropEntry> = {
    [InventoryResourceType.PistolMag]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.SmgMag]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.RifleMag]: {
        chance: 100,
        quantity: 1,
    },

    [InventoryResourceType.SniperMag]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.ShotgunShell]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.ShotgunShellBox]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.Grenade]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.Epipen]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.CombatStim]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.Healpack]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.Bandage]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.Money]: {
        chance: 0,
        quantity: 100,
    },
};

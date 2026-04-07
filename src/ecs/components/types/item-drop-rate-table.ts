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
        chance: 33,
        quantity: 1,
    },

    [InventoryResourceType.SmgMag]: {
        chance: 33,
        quantity: 1,
    },

    [InventoryResourceType.RifleMag]: {
        chance: 0,
        quantity: 1,
    },

    [InventoryResourceType.Grenade]: {
        chance: 33,
        quantity: 1,
    },

    [InventoryResourceType.Money]: {
        chance: 0,
        quantity: 100,
    },
};
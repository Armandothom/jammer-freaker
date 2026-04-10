import { InventoryResourceType } from "./inventory-resource-type.js";

type ResourceSpriteSize = {
    width: number;
    height: number;
};

export const INVENTORY_RESOURCE_SPRITE_CONFIG: Record<
    InventoryResourceType,
    ResourceSpriteSize
> = {
    [InventoryResourceType.PistolMag]: {
        width: 16,
        height: 16,
    },
    [InventoryResourceType.SmgMag]: {
        width: 16,
        height: 16,
    },
    [InventoryResourceType.RifleMag]: {
        width: 20,
        height: 16,
    },
    [InventoryResourceType.ShotgunShellBox]: {
        width: 31,
        height: 32,
    },
    [InventoryResourceType.Grenade]: {
        width: 14,
        height: 14,
    },
    [InventoryResourceType.Money]: {
        width: 16,
        height: 12,
    },
};
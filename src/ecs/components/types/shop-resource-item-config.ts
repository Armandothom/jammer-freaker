import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";
import { InventoryResourceType } from "./inventory-resource-type.js";

export const ShopResourceItemType = {
    PISTOL_MAG: "pistol_mag",
    SMG_MAG: "smg_mag",
    RIFLE_MAG: "rifle_mag",
    GRENADE: "grenade",
} as const;

export type ShopResourceItemType =
    typeof ShopResourceItemType[keyof typeof ShopResourceItemType];

export type ShopResourceItemConfig = {
    name: string,
    price: number;
    availableQuantity: number;
    resourceType: InventoryResourceType;
    spriteName: SpriteName;
    width: number;
    height: number;
    order: number;
};

export const SHOP_RESOURCE_ITEM_CONFIG: Record<
    ShopResourceItemType,
    ShopResourceItemConfig
> = {
    [ShopResourceItemType.PISTOL_MAG]: {
        name: "Pistol Magazine",
        price: 100,
        availableQuantity: 1,
        resourceType: InventoryResourceType.PistolMag,
        spriteName: SpriteName.PISTOL_MAG_ICON,
        width: 24,
        height: 24,
        order: 0,
    },
    [ShopResourceItemType.SMG_MAG]: {
        name: "SMG Magazine",
        price: 200,
        availableQuantity: 1,
        resourceType: InventoryResourceType.SmgMag,
        spriteName: SpriteName.SMG_MAG_ICON,
        width: 24,
        height: 24,
        order: 1,
    },
    [ShopResourceItemType.RIFLE_MAG]: {
        name: "Rifle Magazine",
        price: 300,
        availableQuantity: 1,
        resourceType: InventoryResourceType.RifleMag,
        spriteName: SpriteName.SMG_MAG_ICON,
        width: 24,
        height: 24,
        order: 2,
    },
    [ShopResourceItemType.GRENADE]: {
        name: "Fuse Grenade",
        price: 500,
        availableQuantity: 1,
        resourceType: InventoryResourceType.Grenade,
        spriteName: SpriteName.GRENADE_ICON,
        width: 24,
        height: 24,
        order: 3,
    },
};

export const SHOP_RESOURCE_ITEMS_ORDER: ShopResourceItemType[] = (
    Object.keys(SHOP_RESOURCE_ITEM_CONFIG) as ShopResourceItemType[]
).sort((a, b) => {
    return SHOP_RESOURCE_ITEM_CONFIG[a].order - SHOP_RESOURCE_ITEM_CONFIG[b].order;
});

export function isShopResourceItemType(value: string): value is ShopResourceItemType {
    return Object.prototype.hasOwnProperty.call(SHOP_RESOURCE_ITEM_CONFIG, value);
}

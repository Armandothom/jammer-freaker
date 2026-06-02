import { SpriteName } from "../../../game/world-map/types/sprite-name.enum.js";
import {
    InventoryResourceType,
    SHOTGUN_SHELLS_PER_BOX,
} from "./inventory-resource-type.js";

export const GunsShopResourceItemType = {
    PISTOL_MAG: "pistol_mag",
    SMG_MAG: "smg_mag",
    RIFLE_MAG: "rifle_mag",
    SHOTGUN_SHELL_BOX: "shotgun_shell_box",
    GRENADE: "grenade",
} as const;

export type GunsShopResourceItemType =
    typeof GunsShopResourceItemType[keyof typeof GunsShopResourceItemType];

export type GunsShopResourceItemConfig = {
    name: string,
    price: number;
    availableQuantity: number;
    resourceType: InventoryResourceType;
    resourceAmount: number;
    spriteName: SpriteName;
    width: number;
    height: number;
    order: number;
};

export const GUNS_SHOP_RESOURCE_ITEM_CONFIG: Record<
    GunsShopResourceItemType,
    GunsShopResourceItemConfig
> = {
    [GunsShopResourceItemType.PISTOL_MAG]: {
        name: "Pistol Magazine",
        price: 100,
        availableQuantity: 1,
        resourceType: InventoryResourceType.PistolMag,
        resourceAmount: 1,
        spriteName: SpriteName.PISTOL_MAG_ICON,
        width: 24,
        height: 24,
        order: 0,
    },
    [GunsShopResourceItemType.SMG_MAG]: {
        name: "SMG Magazine",
        price: 200,
        availableQuantity: 1,
        resourceType: InventoryResourceType.SmgMag,
        resourceAmount: 1,
        spriteName: SpriteName.SMG_MAG_ICON,
        width: 24,
        height: 24,
        order: 1,
    },
    [GunsShopResourceItemType.RIFLE_MAG]: {
        name: "Rifle Magazine",
        price: 300,
        availableQuantity: 1,
        resourceType: InventoryResourceType.RifleMag,
        resourceAmount: 1,
        spriteName: SpriteName.SMG_MAG_ICON,
        width: 24,
        height: 24,
        order: 2,
    },
    [GunsShopResourceItemType.SHOTGUN_SHELL_BOX]: {
        name: "Shotgun Shells",
        price: 300,
        availableQuantity: 1,
        resourceType: InventoryResourceType.ShotgunShell,
        resourceAmount: SHOTGUN_SHELLS_PER_BOX,
        spriteName: SpriteName.SHOTGUN_SHELL_BOX_ICON,
        width: 24,
        height: 24,
        order: 3,
    },
    [GunsShopResourceItemType.GRENADE]: {
        name: "Fuse Grenade",
        price: 500,
        availableQuantity: 1,
        resourceType: InventoryResourceType.Grenade,
        resourceAmount: 1,
        spriteName: SpriteName.GRENADE_ICON,
        width: 24,
        height: 24,
        order: 4,
    },
};

export const GUNS_SHOP_RESOURCE_ITEMS_ORDER: GunsShopResourceItemType[] = (
    Object.keys(GUNS_SHOP_RESOURCE_ITEM_CONFIG) as GunsShopResourceItemType[]
).sort((a, b) => {
    return GUNS_SHOP_RESOURCE_ITEM_CONFIG[a].order - GUNS_SHOP_RESOURCE_ITEM_CONFIG[b].order;
});

export function isGunsShopResourceItemType(value: string): value is GunsShopResourceItemType {
    return Object.prototype.hasOwnProperty.call(GUNS_SHOP_RESOURCE_ITEM_CONFIG, value);
}

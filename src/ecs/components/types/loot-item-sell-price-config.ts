import type { LootTableItemId } from "../../../game/world-map/loot/loot-tables.js";
import {
    InventoryResourceType,
    isInventoryResourceType,
} from "./inventory-resource-type.js";
import type { MedicalItemType } from "./medical-items-config.js";
import {
    MiscResourceType,
    isMiscResourceType,
} from "./misc-resource-type.js";

export const MEDICAL_ITEM_SELL_PRICE_CONFIG: Record<MedicalItemType, number> = {
    [InventoryResourceType.Epipen]: 220,
    [InventoryResourceType.CombatStim]: 220,
    [InventoryResourceType.Healpack]: 90,
    [InventoryResourceType.Bandage]: 80,
};

export const INVENTORY_RESOURCE_SELL_PRICE_CONFIG: Record<InventoryResourceType, number> = {
    [InventoryResourceType.PistolMag]: 40,
    [InventoryResourceType.SmgMag]: 80,
    [InventoryResourceType.RifleMag]: 120,
    [InventoryResourceType.SniperMag]: 180,
    [InventoryResourceType.ShotgunShell]: 20,
    [InventoryResourceType.ShotgunShellBox]: 120,
    [InventoryResourceType.Grenade]: 220,
    ...MEDICAL_ITEM_SELL_PRICE_CONFIG,
    [InventoryResourceType.Money]: 0,
};

export const MISC_RESOURCE_SELL_PRICE_CONFIG: Record<MiscResourceType, number> = {
    [MiscResourceType.Calculator]: 24,
    [MiscResourceType.CarBattery]: 90,
    [MiscResourceType.CassetteTape]: 18,
    [MiscResourceType.CityMap]: 22,
    [MiscResourceType.CleaningSponge]: 10,
    [MiscResourceType.CopperWire]: 28,
    [MiscResourceType.DuctTape]: 26,
    [MiscResourceType.ElectricCoil]: 44,
    [MiscResourceType.ElectricalTape]: 20,
    [MiscResourceType.EmptySodaCan]: 6,
    [MiscResourceType.ExtensionCord]: 24,
    [MiscResourceType.FanControl]: 38,
    [MiscResourceType.FieldDressing]: 32,
    [MiscResourceType.Fuse]: 18,
    [MiscResourceType.GasHose]: 26,
    [MiscResourceType.Hanger]: 8,
    [MiscResourceType.Hinge]: 22,
    [MiscResourceType.HygieneKit]: 20,
    [MiscResourceType.KitchenTimer]: 18,
    [MiscResourceType.LightBulbPack]: 18,
    [MiscResourceType.Lighter]: 14,
    [MiscResourceType.LooseBatteries]: 18,
    [MiscResourceType.LargeBackpack]: 650,
    [MiscResourceType.MattressSprings]: 34,
    [MiscResourceType.MediumBackpack]: 420,
    [MiscResourceType.MetalPipe]: 36,
    [MiscResourceType.MetalSheet]: 34,
    [MiscResourceType.NailBox]: 20,
    [MiscResourceType.Notebook]: 12,
    [MiscResourceType.OilFilter]: 26,
    [MiscResourceType.OldShowerhead]: 16,
    [MiscResourceType.PackOfCigarettes]: 16,
    [MiscResourceType.PlasticZipTie]: 14,
    [MiscResourceType.PressureValve]: 48,
    [MiscResourceType.PriceTagRoll]: 8,
    [MiscResourceType.Radio]: 32,
    [MiscResourceType.RemoteControl]: 16,
    [MiscResourceType.Screws]: 18,
    [MiscResourceType.Screwdriver]: 28,
    [MiscResourceType.SewingKit]: 18,
    [MiscResourceType.SmallBackpack]: 220,
    [MiscResourceType.SmallMotor]: 72,
    [MiscResourceType.SteelBrush]: 18,
    [MiscResourceType.SteelCable]: 36,
    [MiscResourceType.SteelSponge]: 14,
    [MiscResourceType.SuperGlue]: 18,
    [MiscResourceType.WireRoll]: 30,
    [MiscResourceType.Wristwatch]: 28,
};

export function getMedicalItemSellPrice(itemType: MedicalItemType): number {
    return MEDICAL_ITEM_SELL_PRICE_CONFIG[itemType];
}

export function getInventoryResourceSellPrice(resourceType: InventoryResourceType): number {
    return INVENTORY_RESOURCE_SELL_PRICE_CONFIG[resourceType];
}

export function getMiscResourceSellPrice(resourceType: MiscResourceType): number {
    return MISC_RESOURCE_SELL_PRICE_CONFIG[resourceType];
}

export function getLootItemSellPrice(itemId: LootTableItemId): number {
    if (isInventoryResourceType(itemId)) {
        return getInventoryResourceSellPrice(itemId);
    }

    if (isMiscResourceType(itemId)) {
        return getMiscResourceSellPrice(itemId);
    }

    return 0;
}

export function isLootItemSellable(itemId: LootTableItemId): boolean {
    return getLootItemSellPrice(itemId) > 0;
}

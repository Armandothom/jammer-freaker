import { InventoryResourceType } from "./inventory-resource-type.js";
import { MiscResourceType } from "./misc-resource-type.js";

export const LOOT_ITEM_CATEGORY = {
    CONSTRUCTION_SUPPLIES: "Construction Supplies",
    EQUIPMENT: "Equipment",
    GENERAL_SUPPLIES: "General Supplies",
    MEDICAL_SUPPLIES: "Medical Supplies",
    MONEY: "Money",
} as const;

export type LootItemCategory = typeof LOOT_ITEM_CATEGORY[keyof typeof LOOT_ITEM_CATEGORY];
export type CategorizedLootItemId = InventoryResourceType | MiscResourceType;

export const LOOT_ITEM_CATEGORY_BY_ITEM: Partial<Record<CategorizedLootItemId, LootItemCategory>> = {
    [InventoryResourceType.Bandage]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.CombatStim]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.Epipen]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.Grenade]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.Healpack]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.Money]: LOOT_ITEM_CATEGORY.MONEY,
    [InventoryResourceType.PistolMag]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.RifleMag]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.ShotgunShell]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.ShotgunShellBox]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.SmgMag]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [InventoryResourceType.SniperMag]: LOOT_ITEM_CATEGORY.EQUIPMENT,

    [MiscResourceType.Calculator]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.CarBattery]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.CassetteTape]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.CityMap]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.CleaningSponge]: LOOT_ITEM_CATEGORY.MEDICAL_SUPPLIES,
    [MiscResourceType.CopperWire]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.DuctTape]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.ElectricCoil]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.ElectricalTape]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.EmptySodaCan]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.ExtensionCord]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.FanControl]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.FieldDressing]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [MiscResourceType.Fuse]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.GasHose]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.Hanger]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.Hinge]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.HygieneKit]: LOOT_ITEM_CATEGORY.MEDICAL_SUPPLIES,
    [MiscResourceType.KitchenTimer]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.LargeBackpack]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [MiscResourceType.LightBulbPack]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.Lighter]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.LooseBatteries]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.MattressSprings]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.MediumBackpack]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [MiscResourceType.MetalPipe]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.MetalSheet]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.NailBox]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.Notebook]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.OilFilter]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.OldShowerhead]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.PackOfCigarettes]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.PlasticZipTie]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.PressureValve]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.PriceTagRoll]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.Radio]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.RemoteControl]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
    [MiscResourceType.Screwdriver]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.Screws]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.SewingKit]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.SmallBackpack]: LOOT_ITEM_CATEGORY.EQUIPMENT,
    [MiscResourceType.SmallMotor]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.SteelBrush]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.SteelCable]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.SteelSponge]: LOOT_ITEM_CATEGORY.MEDICAL_SUPPLIES,
    [MiscResourceType.SuperGlue]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.WireRoll]: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES,
    [MiscResourceType.Wristwatch]: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES,
};

export function getLootItemCategory(itemId: CategorizedLootItemId): LootItemCategory | null {
    return LOOT_ITEM_CATEGORY_BY_ITEM[itemId] ?? null;
}

export function isLootItemInCategory(
    itemId: CategorizedLootItemId,
    category: LootItemCategory,
): boolean {
    return getLootItemCategory(itemId) === category;
}

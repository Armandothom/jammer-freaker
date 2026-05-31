import { InventoryResourceType } from "../../../ecs/components/types/inventory-resource-type.js";
import { MiscResourceType } from "../../../ecs/components/types/misc-resource-type.js";
import { LootContainerType } from "./loot-container-config.js";

export type LootTableItemId = InventoryResourceType | MiscResourceType;

export interface LootTableEntry {
  itemId: LootTableItemId;
  minAmount: number;
  maxAmount: number;
  weight: number;
}

export interface LootTableDefinition {
  containerType: LootContainerType;
  entries: readonly LootTableEntry[];
}

function lootEntry(
  itemId: LootTableItemId,
  weight: number,
  minAmount: number,
  maxAmount = minAmount,
): LootTableEntry {
  return {
    itemId,
    minAmount,
    maxAmount,
    weight,
  };
}

export const LOOT_TABLES: Record<LootContainerType, LootTableDefinition> = {
  [LootContainerType.DRAWER]: {
    containerType: LootContainerType.DRAWER,
    entries: [
      lootEntry(InventoryResourceType.Bandage, 5, 1),
      lootEntry(MiscResourceType.Calculator, 2, 1),
      lootEntry(MiscResourceType.CassetteTape, 3, 1),
      lootEntry(MiscResourceType.CleaningSponge, 5, 1),
      lootEntry(MiscResourceType.DuctTape, 5, 1),
      lootEntry(MiscResourceType.EmptySodaCan, 2, 1),
      lootEntry(MiscResourceType.ExtensionCord, 3, 1),
      lootEntry(MiscResourceType.FanControl, 2, 1),
      lootEntry(MiscResourceType.GasHose, 1, 1),
      lootEntry(MiscResourceType.Hanger, 3, 1),
      lootEntry(MiscResourceType.HygieneKit, 3, 1),
      lootEntry(MiscResourceType.KitchenTimer, 3, 1),
      lootEntry(MiscResourceType.LightBulbPack, 3, 1),
      lootEntry(MiscResourceType.Lighter, 5, 1),
      lootEntry(MiscResourceType.LooseBatteries, 5, 1),
      lootEntry(MiscResourceType.NailBox, 3, 1),
      lootEntry(MiscResourceType.Notebook, 2, 1),
      lootEntry(MiscResourceType.OldShowerhead, 2, 1),
      lootEntry(MiscResourceType.PackOfCigarettes, 2, 1),
      lootEntry(InventoryResourceType.PistolMag, 3, 1),
      lootEntry(MiscResourceType.PlasticZipTie, 3, 1),
      lootEntry(MiscResourceType.PriceTagRoll, 3, 1),
      lootEntry(MiscResourceType.Radio, 5, 1),
      lootEntry(MiscResourceType.RemoteControl, 5, 1),
      lootEntry(MiscResourceType.Screwdriver, 3, 1),
      lootEntry(MiscResourceType.Screws, 3, 1),
      lootEntry(MiscResourceType.SewingKit, 5, 1),
      lootEntry(MiscResourceType.SteelBrush, 3, 1),
      lootEntry(MiscResourceType.SuperGlue, 3, 1),
      lootEntry(MiscResourceType.Wristwatch, 5, 1),
    ],
  },

  [LootContainerType.TOOLBOX]: {
    containerType: LootContainerType.TOOLBOX,
    entries: [
      lootEntry(MiscResourceType.Calculator, 5, 1),
      lootEntry(MiscResourceType.CarBattery, 5, 1),
      lootEntry(MiscResourceType.CleaningSponge, 8, 1),
      lootEntry(MiscResourceType.CopperWire, 8, 1),
      lootEntry(MiscResourceType.DuctTape, 8, 1),
      lootEntry(MiscResourceType.ElectricalTape, 8, 1),
      lootEntry(MiscResourceType.Fuse, 8, 1),
      lootEntry(MiscResourceType.NailBox, 8, 1),
      lootEntry(MiscResourceType.Notebook, 5, 1),
      lootEntry(MiscResourceType.OilFilter, 2, 1),
      lootEntry(MiscResourceType.PlasticZipTie, 2, 1),
      lootEntry(MiscResourceType.PressureValve, 5, 1),
      lootEntry(InventoryResourceType.Money, 0, 1),
      lootEntry(MiscResourceType.Screwdriver, 5, 1),
      lootEntry(MiscResourceType.Screws, 11, 1),
      lootEntry(MiscResourceType.SmallMotor, 2, 1),
      lootEntry(MiscResourceType.SuperGlue, 5, 1),
      lootEntry(MiscResourceType.WireRoll, 5, 1),
    ],
  },

  [LootContainerType.WOODEN_CRATE]: {
    containerType: LootContainerType.WOODEN_CRATE,
    entries: [
      lootEntry(MiscResourceType.Calculator, 4, 1),
      lootEntry(MiscResourceType.CopperWire, 6, 1),
      lootEntry(MiscResourceType.ElectricCoil, 5, 1),
      lootEntry(MiscResourceType.ExtensionCord, 5, 1),
      lootEntry(MiscResourceType.FanControl, 3, 1),
      lootEntry(MiscResourceType.Fuse, 5, 1),
      lootEntry(MiscResourceType.GasHose, 3, 1),
      lootEntry(MiscResourceType.Hinge, 5, 1),
      lootEntry(MiscResourceType.LightBulbPack, 8, 1),
      lootEntry(MiscResourceType.MattressSprings, 5, 1),
      lootEntry(MiscResourceType.MetalPipe, 8, 1),
      lootEntry(MiscResourceType.MetalSheet, 8, 1),
      lootEntry(MiscResourceType.Notebook, 5, 1),
      lootEntry(MiscResourceType.PressureValve, 5, 1),
      lootEntry(MiscResourceType.Screws, 5, 1),
      lootEntry(MiscResourceType.SmallMotor, 5, 1),
      lootEntry(MiscResourceType.SteelBrush, 5, 1),
      lootEntry(MiscResourceType.SteelCable, 5, 1),
      lootEntry(MiscResourceType.WireRoll, 5, 1),
    ],
  },

  [LootContainerType.SCHOOL_BOX]: {
    containerType: LootContainerType.SCHOOL_BOX,
    entries: [
      lootEntry(MiscResourceType.Calculator, 15, 1),
      lootEntry(MiscResourceType.DuctTape, 15, 1),
      lootEntry(MiscResourceType.LooseBatteries, 15, 1),
      lootEntry(MiscResourceType.Notebook, 20, 1),
      lootEntry(MiscResourceType.PlasticZipTie, 15, 1),
      lootEntry(MiscResourceType.SmallBackpack, 5, 1),
      lootEntry(MiscResourceType.SuperGlue, 15, 1),
    ],
  },

  [LootContainerType.CARD_BOX]: {
    containerType: LootContainerType.CARD_BOX,
    entries: [
      lootEntry(MiscResourceType.Calculator, 6, 1),
      lootEntry(MiscResourceType.CopperWire, 8, 1),
      lootEntry(MiscResourceType.DuctTape, 8, 1),
      lootEntry(MiscResourceType.ElectricalTape, 8, 1),
      lootEntry(MiscResourceType.ExtensionCord, 5, 1),
      lootEntry(MiscResourceType.Fuse, 8, 1),
      lootEntry(MiscResourceType.Hinge, 5, 1),
      lootEntry(MiscResourceType.NailBox, 6, 1),
      lootEntry(MiscResourceType.Notebook, 2, 1),
      lootEntry(MiscResourceType.PackOfCigarettes, 1, 1),
      lootEntry(MiscResourceType.RemoteControl, 5, 1),
      lootEntry(MiscResourceType.Screwdriver, 8, 1),
      lootEntry(MiscResourceType.Screws, 8, 1),
      lootEntry(MiscResourceType.SteelBrush, 6, 1),
      lootEntry(MiscResourceType.SuperGlue, 8, 1),
      lootEntry(MiscResourceType.WireRoll, 8, 1),
    ],
  },

  [LootContainerType.MEDICAL_BAG]: {
    containerType: LootContainerType.MEDICAL_BAG,
    entries: [
      lootEntry(InventoryResourceType.Bandage, 35, 1),
      lootEntry(MiscResourceType.CleaningSponge, 15, 1),
      lootEntry(InventoryResourceType.Epipen, 5, 1),
      lootEntry(MiscResourceType.FieldDressing, 15, 1),
      lootEntry(MiscResourceType.HygieneKit, 15, 1),
      lootEntry(MiscResourceType.SteelSponge, 15, 1),
    ],
  },

  [LootContainerType.MILITARY_CRATE]: {
    containerType: LootContainerType.MILITARY_CRATE,
    entries: [
      lootEntry(InventoryResourceType.CombatStim, 10, 1),
      lootEntry(MiscResourceType.MediumBackpack, 2, 1),
      lootEntry(InventoryResourceType.PistolMag, 27, 3),
      lootEntry(InventoryResourceType.RifleMag, 15, 3),
      lootEntry(InventoryResourceType.ShotgunShell, 15, 3),
      lootEntry(MiscResourceType.SmallBackpack, 10, 3),
      lootEntry(InventoryResourceType.SmgMag, 15, 3),
      lootEntry(InventoryResourceType.SniperMag, 6, 3),
    ],
  },

  [LootContainerType.CASH_REGISTER]: {
    containerType: LootContainerType.CASH_REGISTER,
    entries: [
      lootEntry(InventoryResourceType.Money, 100, 100),
    ],
  },

  [LootContainerType.OFFICE_DRAWER]: {
    containerType: LootContainerType.OFFICE_DRAWER,
    entries: [
      lootEntry(MiscResourceType.Calculator, 10, 1),
      lootEntry(MiscResourceType.CityMap, 10, 1),
      lootEntry(MiscResourceType.Notebook, 10, 1),
      lootEntry(MiscResourceType.PackOfCigarettes, 70, 1),
    ],
  },

  [LootContainerType.VAULT]: {
    containerType: LootContainerType.VAULT,
    entries: [
      lootEntry(InventoryResourceType.Money, 100, 500, 1500),
    ],
  },
};

export function getLootTable(containerType: LootContainerType): LootTableDefinition {
  return LOOT_TABLES[containerType];
}

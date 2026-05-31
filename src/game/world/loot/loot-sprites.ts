import { InventoryResourceType } from "../../../ecs/components/types/inventory-resource-type.js";
import { MiscResourceType } from "../../../ecs/components/types/misc-resource-type.js";
import { SpriteSheetName } from "../../asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../types/sprite-name.enum.js";

export type LootSpriteItemId = InventoryResourceType | MiscResourceType;

export interface LootSpriteRef {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
}

const BLANK_LOOT_SPRITE: LootSpriteRef = {
  spriteName: SpriteName.BLANK,
  spriteSheetName: SpriteSheetName.BLANK,
};

function resourceIcon(spriteName: SpriteName): LootSpriteRef {
  return {
    spriteName,
    spriteSheetName: SpriteSheetName.RESOURCES_ICON,
  };
}

export const LOOT_SPRITES: Record<LootSpriteItemId, LootSpriteRef> = {
  [InventoryResourceType.PistolMag]: resourceIcon(SpriteName.PISTOL_MAG_ICON),
  [InventoryResourceType.SmgMag]: resourceIcon(SpriteName.SMG_MAG_ICON),
  [InventoryResourceType.RifleMag]: resourceIcon(SpriteName.RIFLE_MAG_ICON),
  [InventoryResourceType.SniperMag]: resourceIcon(SpriteName.SNIPER_MAG_ICON),
  [InventoryResourceType.ShotgunShell]: resourceIcon(SpriteName.SHOTGUN_SHELL_BOX_ICON),
  [InventoryResourceType.ShotgunShellBox]: resourceIcon(SpriteName.SHOTGUN_SHELL_BOX_ICON),
  [InventoryResourceType.Grenade]: resourceIcon(SpriteName.GRENADE_ICON),
  [InventoryResourceType.Epipen]: BLANK_LOOT_SPRITE,
  [InventoryResourceType.CombatStim]: BLANK_LOOT_SPRITE,
  [InventoryResourceType.Healpack]: BLANK_LOOT_SPRITE,
  [InventoryResourceType.Bandage]: BLANK_LOOT_SPRITE,
  [InventoryResourceType.Money]: resourceIcon(SpriteName.MONEY_ICON),

  [MiscResourceType.Calculator]: BLANK_LOOT_SPRITE,
  [MiscResourceType.CarBattery]: BLANK_LOOT_SPRITE,
  [MiscResourceType.CassetteTape]: BLANK_LOOT_SPRITE,
  [MiscResourceType.CityMap]: BLANK_LOOT_SPRITE,
  [MiscResourceType.CleaningSponge]: BLANK_LOOT_SPRITE,
  [MiscResourceType.CopperWire]: BLANK_LOOT_SPRITE,
  [MiscResourceType.DuctTape]: BLANK_LOOT_SPRITE,
  [MiscResourceType.ElectricCoil]: BLANK_LOOT_SPRITE,
  [MiscResourceType.ElectricalTape]: BLANK_LOOT_SPRITE,
  [MiscResourceType.EmptySodaCan]: BLANK_LOOT_SPRITE,
  [MiscResourceType.ExtensionCord]: BLANK_LOOT_SPRITE,
  [MiscResourceType.FanControl]: BLANK_LOOT_SPRITE,
  [MiscResourceType.FieldDressing]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Fuse]: BLANK_LOOT_SPRITE,
  [MiscResourceType.GasHose]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Hanger]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Hinge]: BLANK_LOOT_SPRITE,
  [MiscResourceType.HygieneKit]: BLANK_LOOT_SPRITE,
  [MiscResourceType.KitchenTimer]: BLANK_LOOT_SPRITE,
  [MiscResourceType.LightBulbPack]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Lighter]: BLANK_LOOT_SPRITE,
  [MiscResourceType.LooseBatteries]: BLANK_LOOT_SPRITE,
  [MiscResourceType.LargeBackpack]: BLANK_LOOT_SPRITE,
  [MiscResourceType.MattressSprings]: BLANK_LOOT_SPRITE,
  [MiscResourceType.MediumBackpack]: BLANK_LOOT_SPRITE,
  [MiscResourceType.MetalPipe]: BLANK_LOOT_SPRITE,
  [MiscResourceType.MetalSheet]: BLANK_LOOT_SPRITE,
  [MiscResourceType.NailBox]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Notebook]: BLANK_LOOT_SPRITE,
  [MiscResourceType.OilFilter]: BLANK_LOOT_SPRITE,
  [MiscResourceType.OldShowerhead]: BLANK_LOOT_SPRITE,
  [MiscResourceType.PackOfCigarettes]: BLANK_LOOT_SPRITE,
  [MiscResourceType.PlasticZipTie]: BLANK_LOOT_SPRITE,
  [MiscResourceType.PressureValve]: BLANK_LOOT_SPRITE,
  [MiscResourceType.PriceTagRoll]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Radio]: BLANK_LOOT_SPRITE,
  [MiscResourceType.RemoteControl]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Screws]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Screwdriver]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SewingKit]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SmallBackpack]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SmallMotor]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SteelBrush]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SteelCable]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SteelSponge]: BLANK_LOOT_SPRITE,
  [MiscResourceType.SuperGlue]: BLANK_LOOT_SPRITE,
  [MiscResourceType.WireRoll]: BLANK_LOOT_SPRITE,
  [MiscResourceType.Wristwatch]: BLANK_LOOT_SPRITE,
};

export function getLootSprite(itemId: LootSpriteItemId): LootSpriteRef {
  return LOOT_SPRITES[itemId];
}

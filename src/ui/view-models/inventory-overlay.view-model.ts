import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";

export interface InventoryOverlayWeaponSlotViewModel {
  ammoText: string;
  iconHeight: number;
  iconSpriteName: SpriteName;
  iconSpriteSheetName: SpriteSheetName;
  iconWidth: number;
  magIconHeight: number;
  magIconSpriteName: SpriteName;
  magIconSpriteSheetName: SpriteSheetName;
  magIconWidth: number;
  magText: string;
  slotIndex: number;
  visible: boolean;
  x: number;
  y: number;
}

export interface InventoryOverlayBackpackSlotViewModel {
  amountText: string;
  iconHeight: number;
  iconSpriteName: SpriteName;
  iconSpriteSheetName: SpriteSheetName;
  iconVisible: boolean;
  iconWidth: number;
  labelText: string;
  labelVisible: boolean;
  quantityVisible: boolean;
  slotIndex: number;
  visible: boolean;
  x: number;
  y: number;
}

export interface InventoryOverlayViewModel {
  backpackFrameHeight: number;
  backpackFrameWidth: number;
  backpackFrameX: number;
  backpackFrameY: number;
  backpackSlots: InventoryOverlayBackpackSlotViewModel[];
  weaponSlots: InventoryOverlayWeaponSlotViewModel[];
}

import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";

export interface CampStorageSlotViewModel {
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

export interface CampStorageDragVisualViewModel {
  amountText: string;
  iconHeight: number;
  iconSpriteName: SpriteName;
  iconSpriteSheetName: SpriteSheetName;
  iconVisible: boolean;
  iconWidth: number;
  labelText: string;
  labelVisible: boolean;
  quantityVisible: boolean;
  visible: boolean;
  x: number;
  y: number;
}

export interface CampStorageViewModel {
  dragVisual: CampStorageDragVisualViewModel;
  hoveredItemName: string;
  inventoryFrameHeight: number;
  inventoryFrameWidth: number;
  inventorySlots: CampStorageSlotViewModel[];
  storageFrameHeight: number;
  storageFrameWidth: number;
  storageSlots: CampStorageSlotViewModel[];
}

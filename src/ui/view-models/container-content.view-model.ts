import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export interface ContainerContentSlotViewModel {
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

export interface ContainerContentDragVisualViewModel {
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

export interface ContainerContentViewModel {
  closeButtonX: number;
  closeButtonY: number;
  containerHeight: number;
  containerWidth: number;
  dragVisual: ContainerContentDragVisualViewModel;
  hoveredItemName: string;
  hoveredItemNameWidth: number;
  maxLootSlots: number;
  slots: ContainerContentSlotViewModel[];
  takeAllButtonDisabled: boolean;
  takeAllButtonX: number;
  takeAllButtonY: number;
}

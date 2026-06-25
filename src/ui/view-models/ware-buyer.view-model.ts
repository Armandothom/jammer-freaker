import type { UIButtonState } from "../style/ui-button-config.js";
import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { WareBuyerSourceTab } from "../../ecs/components/states/ware-buyer-state.js";

export interface WareBuyerSlotViewModel {
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

export interface WareBuyerDragVisualViewModel {
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

export interface WareBuyerTabViewModel {
  buttonState: UIButtonState;
  tab: WareBuyerSourceTab;
}

export interface WareBuyerViewModel {
  activeSourceTab: WareBuyerSourceTab;
  dragVisual: WareBuyerDragVisualViewModel;
  hoveredItemName: string;
  inventoryFrameHeight: number;
  inventoryFrameVisible: boolean;
  inventoryFrameWidth: number;
  inventorySlots: WareBuyerSlotViewModel[];
  saleFrameHeight: number;
  saleFrameWidth: number;
  saleSlots: WareBuyerSlotViewModel[];
  sellButtonDisabled: boolean;
  storageFrameHeight: number;
  storageFrameVisible: boolean;
  storageFrameWidth: number;
  storageSlots: WareBuyerSlotViewModel[];
  tabs: WareBuyerTabViewModel[];
  totalValueText: string;
}

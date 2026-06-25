import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIButtonState } from "../style/ui-button-config.js";

export const INVENTORY_OVERLAY_TAB = {
  INVENTORY: "inventory",
  QUESTS: "quests",
} as const;

export type InventoryOverlayTab =
  typeof INVENTORY_OVERLAY_TAB[keyof typeof INVENTORY_OVERLAY_TAB];

export interface InventoryOverlayTabViewModel {
  buttonState: UIButtonState;
  tab: InventoryOverlayTab;
}

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

export interface InventoryOverlayActiveQuestViewModel {
  objectiveText: string;
  questIndex: number;
  titleText: string;
  visible: boolean;
  x: number;
  y: number;
}

export interface InventoryOverlayViewModel {
  activeQuestEmptyText: string;
  activeQuestEmptyVisible: boolean;
  activeQuests: InventoryOverlayActiveQuestViewModel[];
  activeTab: InventoryOverlayTab;
  backpackFrameHeight: number;
  backpackFrameWidth: number;
  backpackFrameX: number;
  backpackFrameY: number;
  backpackSlots: InventoryOverlayBackpackSlotViewModel[];
  hoveredItemName: string;
  hoveredItemNameWidth: number;
  inventoryContentVisible: boolean;
  questsContentVisible: boolean;
  questsFrameHeight: number;
  questsFrameWidth: number;
  tabs: InventoryOverlayTabViewModel[];
  weaponSlots: InventoryOverlayWeaponSlotViewModel[];
}

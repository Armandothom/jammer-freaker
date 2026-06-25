import type {
  QuestSourceTab,
} from "../../ecs/components/states/quest-state.js";
import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIButtonState } from "../style/ui-button-config.js";

export interface QuestSlotViewModel {
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

export interface QuestDragVisualViewModel {
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

export interface QuestTabViewModel {
  buttonState: UIButtonState;
  tab: QuestSourceTab;
}

export interface QuestInfoViewModel {
  bestSourcesText: string;
  objectivesText: string;
  rewardsText: string;
  titleText: string;
  typeText: string;
}

export interface QuestViewModel {
  activeSourceTab: QuestSourceTab;
  deliveryFrameHeight: number;
  deliveryFrameWidth: number;
  deliveryPopupVisible: boolean;
  deliverySlots: QuestSlotViewModel[];
  dragVisual: QuestDragVisualViewModel;
  finalPreview: QuestInfoViewModel | null;
  hoveredItemName: string;
  inventoryFrameHeight: number;
  inventoryFrameVisible: boolean;
  inventoryFrameWidth: number;
  inventorySlots: QuestSlotViewModel[];
  mainActionButtonDisabled: boolean;
  mainActionButtonState: UIButtonState;
  mainActionButtonText: string;
  quest: QuestInfoViewModel;
  statusText: string;
  storageFrameHeight: number;
  storageFrameVisible: boolean;
  storageFrameWidth: number;
  storageSlots: QuestSlotViewModel[];
  tabs: QuestTabViewModel[];
}

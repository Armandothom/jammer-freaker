import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export const CONTAINER_CONTENT_SKIN_MAP = {
  closeButton: {
    height: 24,
    text: "X",
    width: 24,
  },
  frame: {
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    padding: 8,
  },
  hoveredItemName: {
    height: 18,
  },
  itemIcon: {
    height: 32,
    offsetX: 8,
    offsetY: 8,
    width: 32,
  },
  itemLabel: {
    offsetX: 8,
    offsetY: 18,
    width: 32,
  },
  itemQuantity: {
    offsetX: 24,
    offsetY: 31,
    width: 22,
  },
  itemSlot: {
    backgroundSpriteName: SpriteName.ITEM_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.ITEM_FRAMES,
    height: 48,
    width: 48,
  },
  layout: {
    footerGap: 8,
    headerGap: 6,
    maxSlotsPerRow: 4,
    slotGap: 4,
  },
  takeAllButton: {
    height: 32,
    text: "Take All Items",
    width: 160,
  },
} as const;

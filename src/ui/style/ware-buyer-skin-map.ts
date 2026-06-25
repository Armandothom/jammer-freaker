import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { UI_FRAME_NINE_SLICE } from "./ui-nine-slice.js";

export const WARE_BUYER_SKIN_MAP = {
  background: {
    spriteName: SpriteName.BLANK,
    spriteSheetName: SpriteSheetName.BLANK,
  },
  content: {
    height: 510,
    width: 536,
  },
  frame: {
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    nineSlice: UI_FRAME_NINE_SLICE,
    padding: 8,
  },
  hoveredItemName: {
    height: 18,
    offsetY: 486,
    width: 536,
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
    nineSlice: UI_FRAME_NINE_SLICE,
    width: 48,
  },
  layout: {
    maxSlotsPerRow: 4,
    slotGap: 4,
  },
  returnButton: {
    height: 36,
    offsetX: 16,
    offsetY: 16,
    width: 144,
  },
  salePanel: {
    frameOffsetY: 28,
    offsetX: 316,
  },
  sellButton: {
    height: 36,
    offsetX: 76,
    offsetY: 464,
    width: 144,
  },
  sourcePanel: {
    frameOffsetY: 40,
    offsetX: 0,
    tabGap: 4,
    tabWidth: 108,
  },
  title: {
    height: 18,
    width: 220,
  },
} as const;

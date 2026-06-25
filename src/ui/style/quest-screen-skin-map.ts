import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { UI_FRAME_NINE_SLICE } from "./ui-nine-slice.js";

export const QUEST_SCREEN_SKIN_MAP = {
  background: {
    spriteName: SpriteName.BLANK,
    spriteSheetName: SpriteSheetName.BLANK,
  },
  deliveryButton: {
    height: 36,
    offsetX: 468,
    offsetY: 252,
    width: 168,
  },
  deliveryFrame: {
    offsetX: 476,
    offsetY: 118,
  },
  deliveryTitle: {
    offsetX: 420,
    offsetY: 74,
    width: 250,
  },
  dragVisual: {
    zIndex: 20,
  },
  frame: {
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    nineSlice: UI_FRAME_NINE_SLICE,
    padding: 8,
  },
  hoveredItemName: {
    height: 18,
    offsetX: 24,
    offsetY: 482,
    width: 648,
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
    slotGap: 4,
  },
  mainActionButton: {
    height: 36,
    offsetX: 520,
    offsetY: 260,
    width: 168,
  },
  mainPanel: {
    height: 320,
    width: 720,
  },
  mainText: {
    bestSourcesOffsetY: 158,
    objectivesOffsetY: 88,
    rewardsOffsetY: 204,
    statusOffsetY: 278,
    textOffsetX: 28,
    textWidth: 316,
    titleOffsetY: 22,
    typeOffsetY: 54,
  },
  preview: {
    offsetX: 372,
    offsetY: 88,
    width: 316,
  },
  popup: {
    height: 520,
    width: 720,
  },
  questButton: {
    height: 36,
    offsetX: -16,
    offsetY: -16,
    width: 128,
  },
  returnButton: {
    height: 36,
    offsetX: 16,
    offsetY: 16,
    width: 144,
  },
  sourceFrame: {
    offsetX: 24,
    offsetY: 72,
  },
  sourceTabs: {
    height: 32,
    offsetX: 24,
    offsetY: 32,
    tabGap: 4,
    tabWidth: 108,
  },
} as const;

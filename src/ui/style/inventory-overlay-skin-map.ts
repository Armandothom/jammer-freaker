import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { UI_FRAME_NINE_SLICE } from "./ui-nine-slice.js";

const ADJUSTMENT = 24;

export const INVENTORY_OVERLAY_SKIN_MAP = {
  backpackFrame: {
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    nineSlice: UI_FRAME_NINE_SLICE,
    offsetY: 252,
    padding: 8,
  },
  activeQuest: {
    descriptionOffsetY: 20,
    entryGap: 12,
    entryHeight: 50,
    offsetX: 0,
    offsetY: 4,
    textWidth: 268,
    titleOffsetY: 0,
  },
  itemIcon: {
    height: 32,
    offsetX: 8,
    offsetY: 8,
    width: 32,
  },
  hoveredItemName: {
    height: 36,
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
    backpackMaxSlotsPerRow: 4,
    contentHeight: 576,
    contentWidth: 296,
    slotGap: 4,
  },
  panelFrame: {
    anchor: "top-right" as UIAnchor,
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    height: 600,
    nineSlice: UI_FRAME_NINE_SLICE,
    offsetX: 0,
    offsetY: 0,
    padding: 12,
    width: 320,
  },
  questsFrame: {
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    height: 512,
    nineSlice: UI_FRAME_NINE_SLICE,
    offsetX: 6,
    offsetY: 52,
    padding: 8,
    width: 284,
  },
  tabs: {
    height: 32,
    offsetX: 6,
    offsetY: 8,
    tabGap: 6,
    tabWidth: 96,
  },
  weaponSlot: {
    ammoIcon: {
      height: 16,
      offsetX: 82 - ADJUSTMENT,
      offsetY: 9,
      spriteName: SpriteName.BULLET_ICON,
      spriteSheetName: SpriteSheetName.RESOURCES_ICON,
      width: 8,
    },
    ammoText: {
      offsetX: 86 - ADJUSTMENT,
      offsetY: 12,
      width: 28,
    },
    height: 34,
    icon: {
      height: 20,
      offsetX: 10,
      offsetY: 7,
      spriteSheetName: SpriteSheetName.WEAPON,
      width: 36,
    },
    magIcon: {
      height: 16,
      offsetX: 154 - ADJUSTMENT * 2,
      offsetY: 9,
      width: 16,
    },
    magText: {
      offsetX: 168 - ADJUSTMENT * 2,
      offsetY: 12,
      width: 28,
    },
    rowGap: 6,
    rowOffsetX: 6,
    rowOffsetY: 50,
    width: 160,
  },
} as const;


export const INVENTORY_OVERLAY_MAX_WEAPON_SLOTS = 5;
export const INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS = 24;
export const INVENTORY_OVERLAY_MAX_ACTIVE_QUESTS = 8;

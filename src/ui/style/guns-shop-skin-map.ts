import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";

export const GUNS_SHOP_SKIN_MAP = {
  background: {
    anchor: "top-left" as UIAnchor,
    height: 600,
    offsetX: 0,
    offsetY: 0,
    spriteName: SpriteName.GUNS_SHOP_BACKGROUND,
    spriteSheetName: SpriteSheetName.GUNS_SHOP_BACKGROUND,
    width: 800,
  },
  itemRows: {
    anchor: "top-right" as UIAnchor,
    buttonOffsetX: 204,
    buttonOffsetY: -10,
    nameOffsetX: 4,
    offsetX: 326,
    offsetY: 112,
    secondarySpacingX: 8,
    stepY: 54,
  },
  money: {
    anchor: "top-right" as UIAnchor,
    offsetX: 96,
    offsetY: 32,
  },
  returnButton: {
    anchor: "bottom-right" as UIAnchor,
    offsetX: 192,
    offsetY: 96,
  },
  tabs: {
    anchor: "top-right" as UIAnchor,
    offsetX: 128,
    offsetY: 58,
    stepX: 108,
  },
  upgradeRows: {
    anchor: "top-right" as UIAnchor,
    buttonOffsetX: 204,
    buttonOffsetY: -10,
    infoOffsetX: 96,
    offsetX: 326,
    offsetY: 164,
    stepY: 56,
  },
  upgradeTabs: {
    anchor: "top-right" as UIAnchor,
    gap: 8,
    iconHeight: 20,
    iconOffsetX: 16,
    iconOffsetY: 4,
    iconWidth: 36,
    navHeight: 32,
    navOffsetX: 112,
    navOffsetY: 100,
    navWidth: 32,
    offsetX: 96,
    offsetY: 100,
    trackWidth: 302,
  },
} as const;

import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";

type HUDAnchorPreset = {
  anchor: UIAnchor;
  offsetX: number;
  offsetY: number;
};

export const HUD_SKIN_MAP = {
  grenadeCounter: {
    anchor: "top-left" as UIAnchor,
    icon: {
      height: 16,
      offsetX: 12,
      offsetY: 0,
      spriteName: SpriteName.GRENADE_1,
      spriteSheetName: SpriteSheetName.PROJECTILE,
      width: 14,
    },
    offsetX: 116,
    offsetY: 70,
    textOffsetX: 0,
    textOffsetY: 2,
  },
  healthBar: {
    anchor: "top-left" as UIAnchor,
    backgroundSpriteName: SpriteName.HEALTH_BAR_EMPTY,
    fillSourceHeight: 48,
    fillSourceWidth: 288,
    fillSpriteName: SpriteName.HEALTH_BAR_FILL,
    offsetX: 72,
    offsetY: 42,
    spriteSheetName: SpriteSheetName.HEALTH_BAR,
    textOffsetY: 6,
    height: 24,
    width: 192,
  },
  magCounter: {
    anchor: "top-left" as UIAnchor,
    icon: {
      height: 16,
      offsetX: 12,
      offsetY: 0,
      spriteName: SpriteName.PISTOL_MAG_ICON,
      spriteSheetName: SpriteSheetName.RESOURCES_ICON,
      width: 16,
    },
    offsetX: 74,
    offsetY: 70,
    textOffsetX: 0,
    textOffsetY: 2,
  },
  money: {
    anchor: "top-left" as UIAnchor,
    offsetX: 72,
    offsetY: 24,
  },
  weaponAmmoCounter: {
    anchor: "top-left" as UIAnchor,
    icon: {
      height: 16,
      offsetX: 22,
      offsetY: 0,
      spriteName: SpriteName.BULLET_ICON,
      spriteSheetName: SpriteSheetName.RESOURCES_ICON,
      width: 8,
    },
    offsetX: 32,
    offsetY: 70,
    textOffsetX: 0,
    textOffsetY: 2,
  },
  weaponPanel: {
    anchor: "top-left" as UIAnchor,
    frame: {
      height: 48,
      spriteName: SpriteName.WEAPON_FRAME,
      spriteSheetName: SpriteSheetName.WEAPON_FRAME,
      width: 48,
    },
    icon: {
      height: 20,
      offsetX: 6,
      offsetY: 14,
      spriteName: SpriteName.PISTOL,
      spriteSheetName: SpriteSheetName.WEAPON,
      width: 36,
    },
    offsetX: 20,
    offsetY: 20,
  },
} satisfies Record<string, HUDAnchorPreset | unknown>;

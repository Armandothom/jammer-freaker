import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export const CHOICES_OVERLAY_SKIN_MAP = {
  choice: {
    height: 18,
    width: 76,
  },
  frame: {
    backgroundSpriteName: SpriteName.INVENTORY_FRAME_1,
    backgroundSpriteSheetName: SpriteSheetName.INVENTORY_FRAMES,
    padding: 8,
  },
  layout: {
    gap: 3,
  },
  text: {
    offsetX: 0,
    offsetY: 2,
    scale: 2,
  },
} as const;

import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { UIAnchor } from "../layout/ui-layout-types.js";

export const DEATH_SCREEN_SKIN_MAP = {
  background: {
    anchor: "top-left" as UIAnchor,
    height: "fill",
    offsetX: 0,
    offsetY: 0,
    spriteName: SpriteName.COLOR_DIM_BLACK,
    spriteSheetName: SpriteSheetName.COLOR_PALLETE,
    width: "fill",
  },
  deathPrompt: {
    anchor: "center" as UIAnchor,
    height: 150,
    offsetX: 0,
    offsetY: 0,
    spriteName: SpriteName.DEATH_PROMPT_1,
    spriteSheetName: SpriteSheetName.END_LEVEL_PROMPTS,
    text: "Mission Failed",
    textOffsetY: 36,
    width: 200,
  },
  retryButton: {
    anchor: "bottom-left" as UIAnchor,
    offsetX: 18,
    offsetY: 20,
    text: "Retry",
  },
  quitButton: {
    anchor: "bottom-right" as UIAnchor,
    offsetX: 18,
    offsetY: 20,
    text: "Quit",
  },
} as const;

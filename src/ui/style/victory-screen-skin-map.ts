import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { UIAnchor } from "../layout/ui-layout-types.js";

export const VICTORY_SCREEN_SKIN_MAP = {
  background: {
    anchor: "top-left" as UIAnchor,
    height: "fill",
    offsetX: 0,
    offsetY: 0,
    spriteName: SpriteName.COLOR_DIM_BLACK,
    spriteSheetName: SpriteSheetName.COLOR_PALLETE,
    width: "fill",
  },
  victoryPrompt: {
    anchor: "center" as UIAnchor,
    height: 225,
    offsetX: 0,
    offsetY: 0,
    spriteName: SpriteName.VICTORY_PROMPT_1,
    spriteSheetName: SpriteSheetName.END_LEVEL_PROMPTS,
    text: "Mission Sucess",
    textOffsetY: 36,
    width: 250,
  },
  missionStats: {
    anchor: "center" as UIAnchor,
    offsetX: 0,
    offsetY: 0,
    width: 220,
    text: "Time: 00:00\nKills: 0\nMoney: $0",
    horizontalAlign: "center" as const,
    autoWrap: false,
  },

  nextMissionButton: {
    anchor: "bottom-left" as UIAnchor,
    offsetX: 24,
    offsetY: 20,
    text: "Next Mission",
    width: 120,
  },
  goToShopButton: {
    anchor: "bottom-right" as UIAnchor,
    offsetX: 18,
    offsetY: 20,
    text: "Shop",
  },
} as const;

import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";

export type HudViewModel = {
  grenades: {
    countText: string;
  };
  health: {
    fillRatio: number;
    text: string;
  };
  mags: {
    countText: string;
    iconHeight: number;
    iconSpriteName: SpriteName;
    iconSpriteSheetName: SpriteSheetName;
    iconWidth: number;
  };
  money: {
    text: string;
  };
  weapon: {
    iconSpriteName: SpriteName;
  };
  weaponAmmo: {
    roundsInMagText: string;
  };
};

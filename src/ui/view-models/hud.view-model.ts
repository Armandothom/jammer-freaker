import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";

export type HudViewModel = {
  grenades: {
    countText: string;
  };
  health: {
    bleedStacksText: string;
    bleeding: boolean;
    fillRatio: number;
    text: string;
  };
  medicalApply: {
    fillRatio: number;
    playerScreenX: number;
    playerScreenY: number;
    playerSpriteHeight: number;
    playerSpriteWidth: number;
    visible: boolean;
  };
  demolitionPrompt: {
    playerScreenX: number;
    playerScreenY: number;
    playerSpriteHeight: number;
    playerSpriteWidth: number;
    visible: boolean;
  };
  demolitionTimer: {
    text: string;
    viewportWidth: number;
    visible: boolean;
  };
  medicalItems: {
    bandage: {
      countText: string;
    };
    combatStim: {
      countText: string;
    };
    epipen: {
      countText: string;
    };
    healpack: {
      countText: string;
    };
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

import fontAtlasDefinition from "../../../assets/font/font_atlas.json" assert { type: "json" };
import { BitmapFontDefinition } from "../types/bitmap-font.js";

export interface FontBlueprint {
  atlasImagePath: string;
  definition: BitmapFontDefinition;
}

export const FONT_MAPPED_VALUES: Map<string, FontBlueprint> = new Map([
  [
    fontAtlasDefinition.fontId,
    {
      atlasImagePath: "src/assets/font/font_atlas.png",
      definition: fontAtlasDefinition as BitmapFontDefinition,
    },
  ],
]);

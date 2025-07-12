import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { SpriteSheetBlueprint } from "../types/sprite-sheet-map.js";
import { SpriteSheetName } from "../types/sprite-sheet-name.enum.js";

export const SPRITESHEET_MAPPED_VALUES : Map<SpriteSheetName, SpriteSheetBlueprint> = new Map([
  [
    SpriteSheetName.TERRAIN, {
        rows: 30,
        columns: 15,
        eachSpriteSize : 16,
        afterRenderezSpriteSize : 32,
        srcImagePath : 'src/assets/images/grass_tileset_16px.png',
        sprites: new Map([
          [SpriteName.GRASS_1, {row : 1, column : 1}],
          [SpriteName.GRASS_2, {row : 7, column : 5}],
          [SpriteName.GRASS_3, {row : 3, column : 9}],
          [SpriteName.STONE_1, {row : 14, column : 1}]
        ])
    }
]
])
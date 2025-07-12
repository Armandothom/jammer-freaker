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
],
[
  SpriteSheetName.SOLDIER, {
      rows : 8, 
      columns : 7,
      eachSpriteSize : 32,
      afterRenderezSpriteSize : 32,
      srcImagePath : 'src/assets/images/soldier.png',
      sprites: new Map([
        [SpriteName.SOLDER_STILL, {row : 2, column : 1}],
        [SpriteName.SOLDER_RUNNING_1, {row : 2, column : 2}],
        [SpriteName.SOLDER_RUNNING_2, {row : 2, column : 3}],
        [SpriteName.SOLDER_RUNNING_3, {row : 2, column : 4}],
        [SpriteName.SOLDER_RUNNING_4, {row : 2, column : 5}],
        [SpriteName.SOLDER_RUNNING_5, {row : 2, column : 6}],
        [SpriteName.SOLDER_RUNNING_6, {row : 2, column : 7}],
        [SpriteName.SOLDER_RUNNING_7, {row : 2, column : 8}],
      ])
  }
]
])
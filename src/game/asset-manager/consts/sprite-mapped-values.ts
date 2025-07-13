import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { SpriteSheetBlueprint } from "../types/sprite-sheet-map.js";
import { SpriteSheetName } from "../types/sprite-sheet-name.enum.js";

export const SPRITESHEET_MAPPED_VALUES: Map<SpriteSheetName, SpriteSheetBlueprint> = new Map([
  [
    SpriteSheetName.TERRAIN,
    {
      rows: 30,
      columns: 15,
      eachSpriteCellSize: 16,
      afterRenderSpriteCellSize: 32,
      srcImagePath: 'src/assets/images/grass_tileset_16px.png',
      sprites: new Map([
        [SpriteName.GRASS_1, {
          row: 1,
          column: 1,
          collisionBox: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }],
        [SpriteName.GRASS_2, {
          row: 7,
          column: 5,
          collisionBox: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }],
        [SpriteName.GRASS_3, {
          row: 3,
          column: 9,
          collisionBox: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }],
        [SpriteName.STONE_1, {
          row: 14,
          column: 1,
          collisionBox: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }]
      ])
    }
  ],
  [
    SpriteSheetName.SOLDIER,
    {
      rows: 8,
      columns: 7,
      eachSpriteCellSize: 32,
      afterRenderSpriteCellSize: 32,
      srcImagePath: 'src/assets/images/soldier.png',
      sprites: new Map([
        [SpriteName.SOLDER_STILL, {
          row: 2,
          column: 1,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 27 }
        }],
        [SpriteName.SOLDER_RUNNING_1, {
          row: 2,
          column: 2,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 28 }
        }],
        [SpriteName.SOLDER_RUNNING_2, {
          row: 2,
          column: 3,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 28 }
        }],
        [SpriteName.SOLDER_RUNNING_3, {
          row: 2,
          column: 4,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 28 }
        }],
        [SpriteName.SOLDER_RUNNING_4, {
          row: 2,
          column: 5,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 28 }
        }],
        [SpriteName.SOLDER_RUNNING_5, {
          row: 2,
          column: 6,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 28 }
        }],
        [SpriteName.SOLDER_RUNNING_6, {
          row: 2,
          column: 7,
          collisionBox: { offsetX: 10, offsetY: 6, width: 23, height: 28 }
        }]
      ])
    }
  ],
  [
    SpriteSheetName.BULLET,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSize: 6,
      afterRenderSpriteCellSize: 6,
      srcImagePath: 'src/assets/images/bullet.png',
      sprites: new Map([
        [SpriteName.BULLET_1, {
          row: 1,
          column: 1,
          collisionBox: { offsetX: 0, offsetY: 0, width: 6, height: 6 }
        }]
      ])
    }
  ]
]);
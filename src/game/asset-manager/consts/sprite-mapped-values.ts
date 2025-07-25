import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { SpriteSheetBlueprint } from "../types/sprite-sheet-map.js";
import { SpriteSheetName } from "../types/sprite-sheet-name.enum.js";

export const SPRITESHEET_MAPPED_VALUES: Map<SpriteSheetName, SpriteSheetBlueprint> = new Map([
  [
    SpriteSheetName.TERRAIN,
    {
      rows: 30,
      columns: 15,
      eachSpriteCellSizeHeight: 16,
      eachSpriteCellSizeWidth: 16,
      originalRenderSpriteHeight: 32,
      originalRenderSpriteWidth: 32,
      srcImagePath: 'src/assets/images/tilesheet_metal.png',
      sprites: new Map([
        [SpriteName.METAL_1, {
          row: 1,
          column: 1,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }],
        [SpriteName.WALL_1, {
          row: 1,
          column: 4,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }
        ]
      ]),
    }
  ],
  [
    SpriteSheetName.WEAPON,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSizeHeight: 16,
      eachSpriteCellSizeWidth: 32,
      originalRenderSpriteHeight: 20,
      originalRenderSpriteWidth: 36,
      srcImagePath: 'src/assets/images/smg.png',
      sprites: new Map([
        [SpriteName.SMG, {
          row: 1,
          column: 1,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 26, height: 16 }
        }]
      ])
    }
  ],
  [
    SpriteSheetName.PLAYER,
    {
      rows: 1,
      columns: 6,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      originalRenderSpriteHeight: 32,
      originalRenderSpriteWidth: 32,
      srcImagePath: 'src/assets/images/player.png',
      sprites: new Map([
        [SpriteName.PLAYER_STILL, {
          row: 1,
          column: 1,
          spriteCellOffset: { offsetX: 3, offsetY: 6, width: 25, height: 27 }
        }],
        [SpriteName.PLAYER_RUNNING_1, {
          row: 1,
          column: 2,
          spriteCellOffset: { offsetX: 3, offsetY: 4, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_2, {
          row: 1,
          column: 3,
          spriteCellOffset: { offsetX: 3, offsetY: 5, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_3, {
          row: 1,
          column: 4,
          spriteCellOffset: { offsetX: 4, offsetY: 7, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_4, {
          row: 1,
          column: 5,
          spriteCellOffset: { offsetX: 5, offsetY: 3, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_5, {
          row: 1,
          column: 6,
          spriteCellOffset: { offsetX: 5, offsetY: 2, width: 25, height: 28 }
        }]
      ])
    }
  ],
  [
    SpriteSheetName.ENEMY,
    {
      rows: 1,
      columns: 6,
      eachSpriteCellSizeWidth: 32,
      eachSpriteCellSizeHeight: 32,
      originalRenderSpriteHeight: 32,
      originalRenderSpriteWidth: 32,
      srcImagePath: 'src/assets/images/enemy.png',
      sprites: new Map([
        [SpriteName.ENEMY_STILL, {
          row: 1,
          column: 1,
          spriteCellOffset: { offsetX: 3, offsetY: 6, width: 25, height: 27 }
        }],
        [SpriteName.ENEMY_RUNNING_1, {
          row: 1,
          column: 2,
          spriteCellOffset: { offsetX: 3, offsetY: 4, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_2, {
          row: 1,
          column: 3,
          spriteCellOffset: { offsetX: 3, offsetY: 5, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_3, {
          row: 1,
          column: 4,
          spriteCellOffset: { offsetX: 4, offsetY: 7, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_4, {
          row: 1,
          column: 5,
          spriteCellOffset: { offsetX: 5, offsetY: 3, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_5, {
          row: 1,
          column: 6,
          spriteCellOffset: { offsetX: 5, offsetY: 2, width: 25, height: 28 }
        }]
      ])
    }
  ],
  [
    SpriteSheetName.BULLET,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSizeHeight: 6,
      eachSpriteCellSizeWidth: 6,
      originalRenderSpriteHeight: 6,
      originalRenderSpriteWidth: 6,
      srcImagePath: 'src/assets/images/bullet.png',
      sprites: new Map([
        [SpriteName.BULLET_1, {
          row: 1,
          column: 1,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 6, height: 6 }
        }]
      ])
    }
  ],

  [
    SpriteSheetName.BULLET_WALL_HIT,
    {
      rows: 1,
      columns: 16,
      eachSpriteCellSizeHeight: 64,
      eachSpriteCellSizeWidth: 64,
      originalRenderSpriteHeight: 16,
      originalRenderSpriteWidth: 16,
      srcImagePath: 'src/assets/images/bullet_wall_hit.png',
      sprites: new Map([

        [SpriteName.BULLET_WALL_HIT_1, {
          row: 1,
          column: 1,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_2, {
          row: 1,
          column: 2,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_3, {
          row: 1,
          column: 3,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_4, {
          row: 1,
          column: 4,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_5, {
          row: 1,
          column: 5,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_6, {
          row: 1,
          column: 6,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_7, {
          row: 1,
          column: 7,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_8, {
          row: 1,
          column: 8,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_9, {
          row: 1,
          column: 9,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_10, {
          row: 1,
          column: 10,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_11, {
          row: 1,
          column: 11,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_12, {
          row: 1,
          column: 12,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_13, {
          row: 1,
          column: 13,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_14, {
          row: 1,
          column: 14,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_15, {
          row: 1,
          column: 15,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_16, {
          row: 1,
          column: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],

      ])
    }
  ],


]);
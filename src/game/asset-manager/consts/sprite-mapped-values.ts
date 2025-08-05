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
      srcImagePath: 'src/assets/images/tilesheet_metal.png',
      sprites: new Map([
        [SpriteName.METAL_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }],
        [SpriteName.WALL_1, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
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
      columns: 4,
      eachSpriteCellSizeHeight: 16,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/weapons.png',
      sprites: new Map([
        [SpriteName.SMG, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 20,
          originalRenderSpriteWidth: 36,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 26, height: 16 }
        }],
        [SpriteName.RIFLE, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 20,
          originalRenderSpriteWidth: 42,
          spriteCellOffset: { offsetX: 0, offsetY: 3, width: 32, height: 12 }
        }],
        [SpriteName.KNIFE, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 14,
          originalRenderSpriteWidth: 24,
          spriteCellOffset: { offsetX: 0, offsetY: 1, width: 31, height: 14 }
        }],
        [SpriteName.SHIELD, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 28,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 12, height: 16 }
        }],
      ])
    },
  ],

  [
    SpriteSheetName.PLAYER,
    {
      rows: 1,
      columns: 6,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/player.png',
      sprites: new Map([
        [SpriteName.PLAYER_STILL, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 3, offsetY: 6, width: 25, height: 27 }
        }],
        [SpriteName.PLAYER_RUNNING_1, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 3, offsetY: 4, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_2, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 3, offsetY: 5, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_3, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 4, offsetY: 7, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_4, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 5, offsetY: 3, width: 25, height: 28 }
        }],
        [SpriteName.PLAYER_RUNNING_5, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
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
      srcImagePath: 'src/assets/images/enemy.png',
      sprites: new Map([
        [SpriteName.ENEMY_STILL, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 3, offsetY: 6, width: 25, height: 27 }
        }],
        [SpriteName.ENEMY_RUNNING_1, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 3, offsetY: 4, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_2, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 3, offsetY: 5, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_3, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 4, offsetY: 7, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_4, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 5, offsetY: 3, width: 25, height: 28 }
        }],
        [SpriteName.ENEMY_RUNNING_5, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 5, offsetY: 2, width: 25, height: 28 }
        }]
      ])
    }
  ],
  [
    SpriteSheetName.PROJECTILE,
    {
      rows: 1,
      columns: 2,
      eachSpriteCellSizeHeight: 16,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/projectiles.png',
      sprites: new Map([
        [SpriteName.BULLET_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 6,
          originalRenderSpriteWidth: 6,
          spriteCellOffset: { offsetX: 0, offsetY: 6, width: 4, height: 4 }
        }],
        [SpriteName.GRENADE_1, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 14,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 14, height: 16 }
        }],
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
      srcImagePath: 'src/assets/images/bullet_wall_hit.png',
      sprites: new Map([

        [SpriteName.BULLET_WALL_HIT_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_4, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_5, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_6, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_7, {
          row: 1,
          column: 7,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_8, {
          row: 1,
          column: 8,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_9, {
          row: 1,
          column: 9,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_10, {
          row: 1,
          column: 10,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_11, {
          row: 1,
          column: 11,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_12, {
          row: 1,
          column: 12,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_13, {
          row: 1,
          column: 13,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_14, {
          row: 1,
          column: 14,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_15, {
          row: 1,
          column: 15,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.BULLET_WALL_HIT_16, {
          row: 1,
          column: 16,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 16,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],

      ])
    }
  ],

  [
    SpriteSheetName.GRENADE_EXPLOSION,
    {
      rows: 1,
      columns: 12,
      eachSpriteCellSizeHeight: 64,
      eachSpriteCellSizeWidth: 64,
      srcImagePath: 'src/assets/images/grenade_explosion.png',
      sprites: new Map([

        [SpriteName.GRENADE_EXPLOSION_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_4, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_5, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_6, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_7, {
          row: 1,
          column: 7,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_8, {
          row: 1,
          column: 8,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_9, {
          row: 1,
          column: 9,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_10, {
          row: 1,
          column: 10,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_11, {
          row: 1,
          column: 11,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
        [SpriteName.GRENADE_EXPLOSION_12, {
          row: 1,
          column: 12,
          originalRenderSpriteHeight: 128,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 64 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.BLANK,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSizeHeight: 16,
      eachSpriteCellSizeWidth: 16,
      srcImagePath: 'src/assets/images/blank.png',
      sprites: new Map([
        [SpriteName.BLANK, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 12,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 16, height: 16 }
        }],
      ])
    }
  ],

]);
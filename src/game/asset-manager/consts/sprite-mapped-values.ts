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
      columns: 6,
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
        [SpriteName.PISTOL, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 10,
          originalRenderSpriteWidth: 18,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 22, height: 16 }
        }],
        [SpriteName.SNIPER, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 20,
          originalRenderSpriteWidth: 42,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 16 }
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
      columns: 4,
      eachSpriteCellSizeHeight: 16,
      eachSpriteCellSizeWidth: 16,
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
          column: 3,
          originalRenderSpriteHeight: 16,
          originalRenderSpriteWidth: 14,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 14, height: 16 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.DIALOG_BALLOON,
    {
      rows: 1,
      columns: 2,
      eachSpriteCellSizeHeight: 80,
      eachSpriteCellSizeWidth: 128,
      srcImagePath: 'src/assets/images/dialog-ballon-spritesheet.png',
      sprites: new Map([
        [SpriteName.DIALOG_BALLOON_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 80,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 128, height: 80 }
        }],
        [SpriteName.DIALOG_BALLOON_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 80,
          originalRenderSpriteWidth: 128,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 128, height: 80 }
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

  [
    SpriteSheetName.WOODEN_BOX,
    {
      rows: 1,
      columns: 4,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/wooden_box.png',
      sprites: new Map([
        [SpriteName.WOODEN_BOX_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.WOODEN_BOX_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.WOODEN_BOX_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.WOODEN_BOX_4, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.PISTOL_MAG_DROP,
    {
      rows: 1,
      columns: 8,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/pistol_mag_drop.png',
      sprites: new Map([

        [SpriteName.PISTOL_MAG_DROP_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_4, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_5, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_6, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_7, {
          row: 1,
          column: 7,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_DROP_8, {
          row: 1,
          column: 8,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.SMG_MAG_DROP,
    {
      rows: 1,
      columns: 8,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/smg_mag_drop.png',
      sprites: new Map([

        [SpriteName.SMG_MAG_DROP_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_4, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_5, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_6, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_7, {
          row: 1,
          column: 7,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.SMG_MAG_DROP_8, {
          row: 1,
          column: 8,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.GRENADE_DROP,
    {
      rows: 1,
      columns: 8,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/grenade_drop.png',
      sprites: new Map([

        [SpriteName.GRENADE_DROP_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_4, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_5, {
          row: 1,
          column: 5,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_6, {
          row: 1,
          column: 6,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_7, {
          row: 1,
          column: 7,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
        [SpriteName.GRENADE_DROP_8, {
          row: 1,
          column: 8,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.HEALTH_BAR,
    {
      rows: 1,
      columns: 2,
      eachSpriteCellSizeHeight: 48,
      eachSpriteCellSizeWidth: 288,
      srcImagePath: 'src/assets/images/health_bar.png',
      sprites: new Map([
        [SpriteName.HEALTH_BAR_EMPTY, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 48,
          originalRenderSpriteWidth: 288,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 288, height: 48 }
        }],
        [SpriteName.HEALTH_BAR_FILL, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 48,
          originalRenderSpriteWidth: 288,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 288, height: 48 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.RESOURCES_ICON,
    {
      rows: 1,
      columns: 4,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/resources_spritesheet.png',
      sprites: new Map([
        [SpriteName.BULLET_ICON, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 9, offsetY: 0, width: 14, height: 32 }
        }],
        [SpriteName.PISTOL_MAG_ICON, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 10, offsetY: 0, width: 13, height: 32 }
        }],
        [SpriteName.SMG_MAG_ICON, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 4, offsetY: 0, width: 22, height: 32 }
        }],
        [SpriteName.GRENADE_ICON, {
          row: 1,
          column: 4,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 2, offsetY: 0, width: 28, height: 32 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.KEYBOARD_KEY,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 32,
      srcImagePath: 'src/assets/images/keyboard_key.png',
      sprites: new Map([
        [SpriteName.KEYBOARD_KEY, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 32,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 32, height: 32 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.WEAPON_FRAME,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSizeHeight: 38,
      eachSpriteCellSizeWidth: 38,
      srcImagePath: 'src/assets/images/weapon_frame.png',
      sprites: new Map([
        [SpriteName.WEAPON_FRAME, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 38,
          originalRenderSpriteWidth: 38,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 38, height: 38 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.MELEE_ATTACK,
    {
      rows: 1,
      columns: 3,
      eachSpriteCellSizeHeight: 57,
      eachSpriteCellSizeWidth: 34,
      srcImagePath: 'src/assets/images/melee_attack.png',
      sprites: new Map([
        [SpriteName.MELEE_ATTACK_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 57,
          originalRenderSpriteWidth: 34,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 34, height: 57 }
        }],
        [SpriteName.MELEE_ATTACK_2, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 57,
          originalRenderSpriteWidth: 34,
          spriteCellOffset: { offsetX: 10, offsetY: 0, width: 24, height: 57 }
        }],
        [SpriteName.MELEE_ATTACK_3, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 57,
          originalRenderSpriteWidth: 34,
          spriteCellOffset: { offsetX: 4, offsetY: 0, width: 30, height: 57 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.SHOP_BACKGROUND,
    {
      rows: 1,
      columns: 1,
      eachSpriteCellSizeHeight: 600,
      eachSpriteCellSizeWidth: 800,
      srcImagePath: 'src/assets/images/shop_background.png',
      sprites: new Map([
        [SpriteName.SHOP_BACKGROUND, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 600,
          originalRenderSpriteWidth: 800,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 800, height: 600 }
        }],
      ])
    }
  ],

  [
    SpriteSheetName.BUTTONS,
    {
      rows: 2,
      columns: 3,
      eachSpriteCellSizeHeight: 32,
      eachSpriteCellSizeWidth: 64,
      srcImagePath: 'src/assets/images/buttons.png',
      sprites: new Map([
        [SpriteName.BUTTON_1, {
          row: 1,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_1_SELECTED, {
          row: 1,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_1_DISABLED, {
          row: 1,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_2, {
          row: 2,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_2_SELECTED, {
          row: 2,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_2_DISABLED, {
          row: 2,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_3, {
          row: 3,
          column: 1,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_3_SELECTED, {
          row: 3,
          column: 2,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],
        [SpriteName.BUTTON_3_DISABLED, {
          row: 3,
          column: 3,
          originalRenderSpriteHeight: 32,
          originalRenderSpriteWidth: 64,
          spriteCellOffset: { offsetX: 0, offsetY: 0, width: 64, height: 32 }
        }],

      ])
    }
  ],

]);

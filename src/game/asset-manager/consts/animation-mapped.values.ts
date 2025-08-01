import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { AnimationName, AnimationKeyMap } from "../types/animation-map.js";
import { SpriteSheetName } from "../types/sprite-sheet-name.enum.js";

export const ANIMATION_MAPPED: Map<AnimationName, Map<SpriteName, AnimationKeyMap>> = new Map<AnimationName, Map<SpriteName, AnimationKeyMap>>([
  [
    AnimationName.PLAYER_STILL,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.PLAYER_STILL, {
        spriteName: SpriteName.PLAYER_STILL,
        spriteSheetName: SpriteSheetName.PLAYER,
        order: 1,
        durationKeyFrame: 1
      }]
    ])
  ],

  [
    AnimationName.PLAYER_RUN,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.PLAYER_RUNNING_1, {
        spriteName: SpriteName.PLAYER_RUNNING_1,
        spriteSheetName: SpriteSheetName.PLAYER,
        order: 1,
        durationKeyFrame: 0.25
      }],
      [SpriteName.PLAYER_RUNNING_2, {
        spriteName: SpriteName.PLAYER_RUNNING_2,
        spriteSheetName: SpriteSheetName.PLAYER,
        order: 2,
        durationKeyFrame: 0.25
      }],
      [SpriteName.PLAYER_RUNNING_3, {
        spriteName: SpriteName.PLAYER_RUNNING_3,
        spriteSheetName: SpriteSheetName.PLAYER,
        order: 3,
        durationKeyFrame: 0.25
      }],
      [SpriteName.PLAYER_RUNNING_4, {
        spriteName: SpriteName.PLAYER_RUNNING_4,
        spriteSheetName: SpriteSheetName.PLAYER,
        order: 4,
        durationKeyFrame: 0.25
      }],
      [SpriteName.PLAYER_RUNNING_5, {
        spriteName: SpriteName.PLAYER_RUNNING_5,
        spriteSheetName: SpriteSheetName.PLAYER,
        order: 5,
        durationKeyFrame: 0.25
      }],
    ])
  ],

  [
    AnimationName.ENEMY_STILL,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.ENEMY_STILL, {
        spriteName: SpriteName.ENEMY_STILL,
        spriteSheetName: SpriteSheetName.ENEMY,
        order: 1,
        durationKeyFrame: 1
      }]
    ])
  ],

  [
    AnimationName.ENEMY_RUN,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.ENEMY_RUNNING_1, {
        spriteName: SpriteName.ENEMY_RUNNING_1,
        spriteSheetName: SpriteSheetName.ENEMY,
        order: 1,
        durationKeyFrame: 0.25
      }],
      [SpriteName.ENEMY_RUNNING_2, {
        spriteName: SpriteName.ENEMY_RUNNING_2,
        spriteSheetName: SpriteSheetName.ENEMY,
        order: 2,
        durationKeyFrame: 0.25
      }],
      [SpriteName.ENEMY_RUNNING_3, {
        spriteName: SpriteName.ENEMY_RUNNING_3,
        spriteSheetName: SpriteSheetName.ENEMY,
        order: 3,
        durationKeyFrame: 0.25
      }],
      [SpriteName.ENEMY_RUNNING_4, {
        spriteName: SpriteName.ENEMY_RUNNING_4,
        spriteSheetName: SpriteSheetName.ENEMY,
        order: 4,
        durationKeyFrame: 0.25
      }],
      [SpriteName.ENEMY_RUNNING_5, {
        spriteName: SpriteName.ENEMY_RUNNING_5,
        spriteSheetName: SpriteSheetName.ENEMY,
        order: 5,
        durationKeyFrame: 0.25
      }],
    ])
  ],

  [
    AnimationName.WEAPON_SMG,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.SMG, {
        spriteName: SpriteName.SMG,
        spriteSheetName: SpriteSheetName.WEAPON,
        order: 1,
        durationKeyFrame: 1
      }]
    ])
  ],

  [
    AnimationName.WEAPON_RIFLE,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.RIFLE, {
        spriteName: SpriteName.RIFLE,
        spriteSheetName: SpriteSheetName.WEAPON,
        order: 1,
        durationKeyFrame: 1
      }]
    ])
  ],

  [
    AnimationName.BULLET_FIRED,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.BULLET_1, {
        spriteName: SpriteName.BULLET_1,
        spriteSheetName: SpriteSheetName.PROJECTILE,
        order: 1,
        durationKeyFrame: 1
      }]
    ])
  ],

  [
    AnimationName.GRENADE_FIRED,
    new Map<SpriteName, AnimationKeyMap>([
      [SpriteName.GRENADE_1, {
        spriteName: SpriteName.GRENADE_1,
        spriteSheetName: SpriteSheetName.PROJECTILE,
        order: 1,
        durationKeyFrame: 1
      }]
    ])
  ],

  [
    AnimationName.BULLET_WALL_HIT,
    new Map<SpriteName, AnimationKeyMap>([

      [SpriteName.BULLET_WALL_HIT_1, {
        spriteName: SpriteName.BULLET_WALL_HIT_1,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 1,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_2, {
        spriteName: SpriteName.BULLET_WALL_HIT_2,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 2,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_3, {
        spriteName: SpriteName.BULLET_WALL_HIT_3,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 3,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_4, {
        spriteName: SpriteName.BULLET_WALL_HIT_4,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 4,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_5, {
        spriteName: SpriteName.BULLET_WALL_HIT_5,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 5,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_6, {
        spriteName: SpriteName.BULLET_WALL_HIT_6,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 6,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_7, {
        spriteName: SpriteName.BULLET_WALL_HIT_7,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 7,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_8, {
        spriteName: SpriteName.BULLET_WALL_HIT_8,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 8,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_9, {
        spriteName: SpriteName.BULLET_WALL_HIT_9,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 9,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_10, {
        spriteName: SpriteName.BULLET_WALL_HIT_10,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 10,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_11, {
        spriteName: SpriteName.BULLET_WALL_HIT_11,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 11,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_12, {
        spriteName: SpriteName.BULLET_WALL_HIT_12,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 12,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_13, {
        spriteName: SpriteName.BULLET_WALL_HIT_13,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 13,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_14, {
        spriteName: SpriteName.BULLET_WALL_HIT_14,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 14,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_15, {
        spriteName: SpriteName.BULLET_WALL_HIT_15,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 15,
        durationKeyFrame: 0.05
      }],
      [SpriteName.BULLET_WALL_HIT_16, {
        spriteName: SpriteName.BULLET_WALL_HIT_16,
        spriteSheetName: SpriteSheetName.BULLET_WALL_HIT,
        order: 16,
        durationKeyFrame: 0.05
      }],
    ])
  ]
  // next map
]);

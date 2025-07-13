import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { AnimationName, AnimationKeyMap } from "../types/animation-map.js";
import { SpriteSheetName } from "../types/sprite-sheet-name.enum.js";

export const ANIMATION_MAPPED: Map<AnimationName, Map<SpriteName, AnimationKeyMap>> = new Map<AnimationName, Map<SpriteName, AnimationKeyMap>>([
  [
    AnimationName.SOLDIER_STILL,
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
    AnimationName.SOLDIER_RUN,
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
  ]
]);

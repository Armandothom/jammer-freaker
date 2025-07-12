import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { AnimationName, AnimationKeyMap } from "../types/animation-map.js";
import { SpriteSheetName } from "../types/sprite-sheet-name.enum.js";

export const ANIMATION_MAPPED: Map<AnimationName, AnimationKeyMap[]> = new Map([
  [
    AnimationName.RUN, [
      {
        spriteName: SpriteName.SOLDER_RUNNING_1,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 1,
        durationKeyFrame : 0.25
      },
      {
        spriteName: SpriteName.SOLDER_RUNNING_2,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 2,
        durationKeyFrame : 0.25
      },
      {
        spriteName: SpriteName.SOLDER_RUNNING_3,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 3,
        durationKeyFrame : 0.25
      },
      {
        spriteName: SpriteName.SOLDER_RUNNING_4,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 4,
        durationKeyFrame : 0.25
      },
      {
        spriteName: SpriteName.SOLDER_RUNNING_5,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 5,
        durationKeyFrame : 0.25
      },
      {
        spriteName: SpriteName.SOLDER_RUNNING_6,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 6,
        durationKeyFrame : 0.25
      },
      {
        spriteName: SpriteName.SOLDER_RUNNING_7,
        spriteSheetName :  SpriteSheetName.SOLDIER,
        order : 7,
        durationKeyFrame : 0.25
      },
    ]
  ]
])
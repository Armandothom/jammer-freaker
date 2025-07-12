import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { SpriteSheetName } from "./sprite-sheet-name.enum.js";

export enum AnimationName {
  RUN = "run",
  SHOOT = "shot"
}


export abstract class AnimationKeyMap {
  spriteName!: SpriteName
  spriteSheetName!: SpriteSheetName
  order!: number
  durationKeyFrame!: number
}
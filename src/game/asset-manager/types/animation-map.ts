import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { SpriteSheetName } from "./sprite-sheet-name.enum.js";

export enum AnimationName {
  PLAYER_STILL = "player_still",
  PLAYER_RUN = "player_run",
  ENEMY_STILL = "enemy_still",
  ENEMY_RUN = "enemy_run",
  WEAPON_SMG = "weapon_smg",
  WEAPON_RIFLE = "weapon_rifle",
  BULLET_FIRED = "bullet_fired",
  BULLET_WALL_HIT = "bullet_wall_hit",
  GRENADE_FIRED = "grenade_fired",
}


export abstract class AnimationKeyMap {
  spriteName!: SpriteName
  spriteSheetName!: SpriteSheetName
  order!: number
  durationKeyFrame!: number
}
import { SpriteName } from "../../world/types/sprite-name.enum.js";
import { SpriteSheetName } from "./sprite-sheet-name.enum.js";

export enum AnimationName {
  PLAYER_STILL = "player_still",
  PLAYER_RUN = "player_run",
  ENEMY_STILL = "enemy_still",
  ENEMY_RUN = "enemy_run",
  WEAPON_SMG = "weapon_smg",
  WEAPON_RIFLE = "weapon_rifle",
  WEAPON_KNIFE = "weapon_knife",
  WEAPON_SHIELD = "weapon_shield",
  WEAPON_PISTOL = "weapon_pistol",
  WEAPON_SNIPER = "weapon_sniper",
  BULLET_FIRED = "bullet_fired",
  DIALOG_BALLOON_IDLE = "dialog_balloon_idle",
  BULLET_WALL_HIT = "bullet_wall_hit",
  GRENADE_FIRED = "grenade_fired",
  GRENADE_EXPLOSION = "grenade_explosion",
  WOODEN_BOX = "wooden_box",
  WOODEN_BOX_DESTROYED = "wooden_box_destroyed",
  PISTOL_MAG_DROPPED = "pistol_mag_dropped",
  SMG_MAG_DROPPED = "smg_mag_dropped",
  GRENADE_DROPPED = "grenade_dropped",
}


export abstract class AnimationKeyMap {
  spriteName!: SpriteName
  spriteSheetName!: SpriteSheetName
  order!: number
  durationKeyFrame!: number
}

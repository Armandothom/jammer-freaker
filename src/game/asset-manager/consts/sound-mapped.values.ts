export const SoundMap = {
  SMG_FIRE: "/assets_public/sounds/smg.wav",
  SHOTGUN_FIRE: "/assets_public/sounds/shotgun_fire.wav",
  RIFLE_FIRE: "/assets_public/sounds/rifle_fire.wav",
  SNIPER_FIRE: "/assets_public/sounds/sniper_fire.wav",
  PISTOL_RELOAD: "/assets_public/sounds/pistol_reload.wav",
  SMG_RELOAD: "/assets_public/sounds/smg_reload.wav",
  RIFLE_RELOAD: "/assets_public/sounds/rifle_reload.wav",
  SNIPER_RELOAD: "/assets_public/sounds/sniper_reload.wav",
  RIFLE_BULLET_GROUND_HIT: "/assets_public/sounds/rifle_bullet_ground_hit.wav",
  A10_BARRAGE: "/assets_public/sounds/a10.wav",
  THEME: "/assets_public/sounds/theme.ogg",
  LOW_RAIN: "/assets_public/sounds/low_rain.wav",
  GRENADE_PIN_PULL: "/assets_public/sounds/grenade_pin_pull.wav",
  GRENADE_EXPLOSION: "/assets_public/sounds/grenade_explosion.wav",
  SHOTGUN_SHELL_RELOAD: "/assets_public/sounds/shotgun_shell_reload.wav",
  ITEM_PICKUP: "/assets_public/sounds/item_pickup.wav",
  BOX_BREAK: "/assets_public/sounds/box_break.wav",
  FOOTSTEP_1: "/assets_public/sounds/footstep_1.wav",
  FOOTSTEP_2: "/assets_public/sounds/footstep_2.wav",
  FOOTSTEP_3: "/assets_public/sounds/footstep_3.wav",
  FOOTSTEP_4: "/assets_public/sounds/footstep_4.wav",
} as const;

export type SoundKey = keyof typeof SoundMap;

type SoundKeyMap = {
  [K in SoundKey]: K;
};

export const SOUND_KEYS: SoundKeyMap = {
  SMG_FIRE: "SMG_FIRE",
  SHOTGUN_FIRE: "SHOTGUN_FIRE",
  RIFLE_FIRE: "RIFLE_FIRE",
  SNIPER_FIRE: "SNIPER_FIRE",
  PISTOL_RELOAD: "PISTOL_RELOAD",
  SMG_RELOAD: "SMG_RELOAD",
  RIFLE_RELOAD: "RIFLE_RELOAD",
  SNIPER_RELOAD: "SNIPER_RELOAD",
  RIFLE_BULLET_GROUND_HIT: "RIFLE_BULLET_GROUND_HIT",
  A10_BARRAGE: "A10_BARRAGE",
  THEME: "THEME",
  LOW_RAIN: "LOW_RAIN",
  GRENADE_PIN_PULL: "GRENADE_PIN_PULL",
  GRENADE_EXPLOSION: "GRENADE_EXPLOSION",
  SHOTGUN_SHELL_RELOAD: "SHOTGUN_SHELL_RELOAD",
  ITEM_PICKUP: "ITEM_PICKUP",
  BOX_BREAK: "BOX_BREAK",
  FOOTSTEP_1: "FOOTSTEP_1",
  FOOTSTEP_2: "FOOTSTEP_2",
  FOOTSTEP_3: "FOOTSTEP_3",
  FOOTSTEP_4: "FOOTSTEP_4",
};

type SoundVolumeMap = {
  [K in SoundKey]: number;
};

export const SOUND_VOLUME: SoundVolumeMap = {
  SMG_FIRE: 0.08,
  SHOTGUN_FIRE: 0.08,
  RIFLE_FIRE: 0.08,
  SNIPER_FIRE: 0.08,
  PISTOL_RELOAD: 0.06,
  SMG_RELOAD: 0.12,
  RIFLE_RELOAD: 0.12,
  SNIPER_RELOAD: 0.12,
  RIFLE_BULLET_GROUND_HIT: 0.24,
  A10_BARRAGE: 0.25,
  THEME: 0.05,
  LOW_RAIN: 0.15,
  GRENADE_PIN_PULL: 0.12,
  GRENADE_EXPLOSION: 0.08,
  SHOTGUN_SHELL_RELOAD: 0.12,
  ITEM_PICKUP: 0.12,
  BOX_BREAK: 0.12,
  FOOTSTEP_1: 0.06,
  FOOTSTEP_2: 0.06,
  FOOTSTEP_3: 0.06,
  FOOTSTEP_4: 0.06,
};
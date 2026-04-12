export const SoundMap = {
  SMG_FIRE: "/assets_public/sounds/smg.wav",
  SHOTGUN_FIRE: "/assets_public/sounds/shotgun_fire.wav",
  RIFLE_RELOAD: "/assets_public/sounds/rifle_reload.wav",
  A10_BARRAGE: "/assets_public/sounds/a10.wav",
  THEME: "/assets_public/sounds/theme.ogg",
} as const;

export type SoundKey = keyof typeof SoundMap;

type SoundKeyMap = {
  [K in SoundKey]: K;
};

export const SOUND_KEYS: SoundKeyMap = {
  SMG_FIRE: "SMG_FIRE",
  SHOTGUN_FIRE: "SHOTGUN_FIRE",
  RIFLE_RELOAD: "RIFLE_RELOAD",
  A10_BARRAGE: "A10_BARRAGE",
  THEME: "THEME",
};

type SoundVolumeMap = {
  [K in SoundKey]: number;
};

export const SOUND_VOLUME: SoundVolumeMap = {
  SMG_FIRE: 0.08,
  SHOTGUN_FIRE: 0.08,
  RIFLE_RELOAD: 0.12,
  A10_BARRAGE: 0.25,
  THEME: 0.05,
};
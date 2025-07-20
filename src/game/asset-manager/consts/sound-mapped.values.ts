export const SoundMap = {
  SMG_FIRE: "/assets_public/sounds/smg.wav",
  A10_BARRAGE: "/assets_public/sounds/a10.wav",
  THEME: "/assets_public/sounds/theme.ogg",
} as const;

export type SoundKey = keyof typeof SoundMap;
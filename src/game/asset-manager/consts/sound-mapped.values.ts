export const SoundMap = {
  SMG_FIRE: "/assets_public/sounds/smg.wav",
  THEME: "/assets_public/sounds/theme.ogg"
} as const;

export type SoundKey = keyof typeof SoundMap;
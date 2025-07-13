export const SoundMap = {
  SMG_FIRE: "/assets_public/sounds/smg.wav",
} as const;

export type SoundKey = keyof typeof SoundMap;
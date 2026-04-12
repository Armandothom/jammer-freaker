import { SoundKey } from "../consts/sound-mapped.values.js";

export type SoundEmitMode = "always" | "if-not-playing" | "cooldown";

export type EmitSoundEvent = {
    type: "emit";
    key: SoundKey;
    loop?: boolean;
    volume?: number;
    requestId?: string;
    mode?: SoundEmitMode;
    cooldownMs?: number;
};

export type StopSoundEvent = {
    type: "stop";
    soundId: string;
};

export type SoundEvent = EmitSoundEvent | StopSoundEvent;

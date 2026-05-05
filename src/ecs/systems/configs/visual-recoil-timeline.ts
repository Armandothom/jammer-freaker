import { buildVisualRecoilTimeline } from "./visual-recoil-builder.js";
import { PISTOL_RECOIL_PROFILE, RIFLE_RECOIL_PROFILE, SHOTGUN_RECOIL_PROFILE, SMG_RECOIL_PROFILE, SNIPER_RECOIL_PROFILE } from "./visual-recoil.profiles.js";

export type VisualRecoilTimeline = {
    durationMs: number;
    getBack: (progress: number) => number;
    getLift: (progress: number) => number;
    getAngle: (progress: number) => number;
};

// recoil-timelines.ts

export const VISUAL_RECOIL_TIMELINES = {
    PISTOL: buildVisualRecoilTimeline(PISTOL_RECOIL_PROFILE),
    SMG: buildVisualRecoilTimeline(SMG_RECOIL_PROFILE),
    RIFLE: buildVisualRecoilTimeline(RIFLE_RECOIL_PROFILE),
    SNIPER: buildVisualRecoilTimeline(SNIPER_RECOIL_PROFILE),
    SHOTGUN: buildVisualRecoilTimeline(SHOTGUN_RECOIL_PROFILE),
} as const;
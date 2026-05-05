import { VisualRecoilTimeline } from "./visual-recoil-timeline.js";
import { VisualRecoilProfile } from "./visual-recoil.profiles.js";

function clamp01(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
}

function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
}

function easeOutQuad(t: number): number {
    t = clamp01(t);
    return 1 - (1 - t) * (1 - t);
}

function easeInOutQuad(t: number): number {
    t = clamp01(t);

    if (t < 0.5) {
        return 2 * t * t;
    }

    return 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function buildVisualRecoilTimeline(profile: VisualRecoilProfile): VisualRecoilTimeline {
    return {
        durationMs: profile.durationMs,

        getBack(progress: number): number {
            progress = clamp01(progress);

            if (progress <= profile.timing.kickEnd) {
                return lerp(
                    0,
                    profile.values.kickBack,
                    easeOutQuad(progress / profile.timing.kickEnd),
                );
            }

            if (progress <= profile.timing.settleEnd) {
                return lerp(
                    profile.values.kickBack,
                    profile.values.settleBack,
                    easeInOutQuad(
                        (progress - profile.timing.kickEnd) /
                        (profile.timing.settleEnd - profile.timing.kickEnd),
                    ),
                );
            }

            return lerp(
                profile.values.settleBack,
                0,
                easeInOutQuad(
                    (progress - profile.timing.settleEnd) /
                    (profile.timing.end - profile.timing.settleEnd),
                ),
            );
        },

        getLift(progress: number): number {
            progress = clamp01(progress);

            if (progress <= profile.timing.kickEnd) {
                return lerp(
                    0,
                    profile.values.kickLift,
                    easeOutQuad(progress / profile.timing.kickEnd),
                );
            }

            if (progress <= profile.timing.settleEnd) {
                return lerp(
                    profile.values.kickLift,
                    profile.values.overshootLift,
                    easeInOutQuad(
                        (progress - profile.timing.kickEnd) /
                        (profile.timing.settleEnd - profile.timing.kickEnd),
                    ),
                );
            }

            return lerp(
                profile.values.overshootLift,
                0,
                easeInOutQuad(
                    (progress - profile.timing.settleEnd) /
                    (profile.timing.end - profile.timing.settleEnd),
                ),
            );
        },

        getAngle(progress: number): number {
            progress = clamp01(progress);

            if (progress <= profile.timing.kickEnd) {
                return lerp(
                    0,
                    profile.values.kickAngle,
                    easeOutQuad(progress / profile.timing.kickEnd),
                );
            }

            if (progress <= profile.timing.settleEnd) {
                return lerp(
                    profile.values.kickAngle,
                    profile.values.overshootAngle,
                    easeInOutQuad(
                        (progress - profile.timing.kickEnd) /
                        (profile.timing.settleEnd - profile.timing.kickEnd),
                    ),
                );
            }

            return lerp(
                profile.values.overshootAngle,
                0,
                easeInOutQuad(
                    (progress - profile.timing.settleEnd) /
                    (profile.timing.end - profile.timing.settleEnd),
                ),
            );
        },
    };
}
export type VisualRecoilTimingConfig = {
    kickEnd: number;
    settleEnd: number;
    end: number;
};

export type VisualRecoilValueConfig = {
    kickBack: number;
    settleBack: number;

    kickLift: number;
    overshootLift: number;

    kickAngle: number;
    overshootAngle: number;
};

export type VisualRecoilProfile = {
    durationMs: number;
    timing: VisualRecoilTimingConfig;
    values: VisualRecoilValueConfig;
};

// Explanation of parameters:
// The visual recoil is divided in kick and settle
// logically, the kick is the "weapon goes up" and the settle is the motion to return to the original position]
// kickEnd: percentage of durationMs which the kick lerp should end
// settleEnd: percentage of durationMs which the settle lerp should end and return to the initial position
// kick back, the max initial offset in X in the kick phase
// settle back, residual visual recoil between the kick back and the initial position
// kick lift, the max initial offset in Y in the kick phase
// overshootLift, the offset in Y that is permissible to pass of the initial firing pose
// kick angle: angle to be added to the visual aim direction when shot (for now, aim will be disabled while the pose hasn't completed)
// overshootAngle: angle that is permissible to pass of the initial firing pose

export const PISTOL_RECOIL_PROFILE: VisualRecoilProfile = {
    durationMs: 90,
    timing: {
        kickEnd: 0.4,
        settleEnd: 0.7,
        end: 1,
    },
    values: {
        kickBack: 0.5,
        settleBack: 0.1,
        kickLift: 0.2,
        overshootLift: 0,
        kickAngle: -0.18,
        overshootAngle: 0,
    },
};

export const SMG_RECOIL_PROFILE: VisualRecoilProfile = {
    durationMs: 60,
    timing: {
        kickEnd: 0.2,
        settleEnd: 0.45,
        end: 1,
    },
    values: {
        kickBack: 1.8,
        settleBack: 0.2,
        kickLift: 0.05,
        overshootLift: 0,
        kickAngle: -0.02,
        overshootAngle: 0,
    },
};

export const RIFLE_RECOIL_PROFILE: VisualRecoilProfile = {
    durationMs: 80,
    timing: {
        kickEnd: 0.22,
        settleEnd: 0.5,
        end: 1,
    },
    values: {
        kickBack: 2.2,
        settleBack: 0.4,
        kickLift: 0.15,
        overshootLift: 0,
        kickAngle: -0.05,
        overshootAngle: 0,
    },
};

export const SNIPER_RECOIL_PROFILE: VisualRecoilProfile = {
    durationMs: 150,
    timing: {
        kickEnd: 0.22,
        settleEnd: 0.62,
        end: 1,
    },
    values: {
        kickBack: 3.0,
        settleBack: 0.6,
        kickLift: 0.25,
        overshootLift: -0.15,
        kickAngle: -0.18,
        overshootAngle: 0.08,
    },
};

export const SHOTGUN_RECOIL_PROFILE: VisualRecoilProfile = {
    durationMs: 170,
    timing: {
        kickEnd: 0.18,
        settleEnd: 0.58,
        end: 1,
    },
    values: {
        kickBack: 3.6,
        settleBack: 0.9,
        kickLift: 0.35,
        overshootLift: -0.22,
        kickAngle: -0.2,
        overshootAngle: 0.1,
    },
};
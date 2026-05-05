import {
    PARTICLE_TYPE_BLOOD,
    PARTICLE_TYPE_DUST,
    PARTICLE_TYPE_SPARK,
    type ParticleStainConfig,
    ParticleType,
    RGB,
    TrajectoryType,
} from "../../../game/renderer/renderer-engine.js";

type ParticlePreset = {
    particleType: ParticleType;
    color: RGB;
    flightLife: number;
    stainLife: number;
    isStained: boolean;
    stainConfig: ParticleStainConfig | null;
    size: number;
    trajectoryType: TrajectoryType;
    speed: number;
    spreadAngle: number;
};

export const PARTICLE_PRESETS: Record<number, ParticlePreset> = {
    [PARTICLE_TYPE_BLOOD]: {
        particleType: PARTICLE_TYPE_BLOOD,
        color: [145, 24, 32],
        flightLife: 1,
        stainLife: 600,
        isStained: true,
        stainConfig: {
            color: [76, 14, 18],
            size: 7,
        },
        size: 5,
        trajectoryType: 1,
        speed: 60,
        spreadAngle: Math.PI / 4,
    },
    [PARTICLE_TYPE_DUST]: {
        particleType: PARTICLE_TYPE_DUST,
        color: [170, 170, 170],
        flightLife: 1,
        stainLife: 0,
        isStained: false,
        stainConfig: null,
        size: 5,
        trajectoryType: 0,
        speed: 60,
        spreadAngle: Math.PI / 4,
    },
    [PARTICLE_TYPE_SPARK]: {
        particleType: PARTICLE_TYPE_SPARK,
        color: [255, 214, 72],
        flightLife: 1,
        stainLife: 0,
        isStained: false,
        stainConfig: null,
        size: 5,
        trajectoryType: 0,
        speed: 60,
        spreadAngle: Math.PI / 4,
    },
} as const;

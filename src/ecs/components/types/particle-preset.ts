import { PARTICLE_TYPE_BLOOD, PARTICLE_TYPE_DUST, PARTICLE_TYPE_SPARK, ParticleType, RGB, TrajectoryType } from "../../../game/renderer/renderer-engine.js";

type ParticlePreset = {
    particleType: ParticleType;
    color: RGB;
    life: number;
    size: number;
    trajectoryType: TrajectoryType;
    speed: number;
    spreadAngle: number;
};

export const PARTICLE_PRESETS: Record<number, ParticlePreset> = {
    [PARTICLE_TYPE_BLOOD]: {
        particleType: PARTICLE_TYPE_BLOOD,
        color: [145, 24, 32],
        life: 1,
        size: 5,
        trajectoryType: 1,
        speed: 60,
        spreadAngle: Math.PI / 4,
    },
    [PARTICLE_TYPE_DUST]: {
        particleType: PARTICLE_TYPE_DUST,
        color: [170, 170, 170],
        life: 1,
        size: 5,
        trajectoryType: 0,
        speed: 60,
        spreadAngle: Math.PI / 4,
    },
    [PARTICLE_TYPE_SPARK]: {
        particleType: PARTICLE_TYPE_SPARK,
        color: [255, 214, 72],
        life: 1,
        size: 5,
        trajectoryType: 0,
        speed: 60,
        spreadAngle: Math.PI / 4,
    },
} as const;

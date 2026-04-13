import { TrajectoryType } from "../../systems/particle-emitter.system.js";

export type ParticleStepConfig = {
    angle: number;
    trajectoryType: TrajectoryType;
    particleCount: number;
};

export type ScheduledParticleStep = {
    delayMs: number;
    config: ParticleStepConfig;
};

export type ParticleBurstPlan = {
    elapsedMs: number;
    steps: ScheduledParticleStep[];
};
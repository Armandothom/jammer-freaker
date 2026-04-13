import { ScheduledParticleStep } from "./types/particle-burst-config.js";

export class DeathParticleBurstComponent {
    public elapsedMs: number;
    public pendingSteps: ScheduledParticleStep[];
    public originX: number;
    public originY: number;

    constructor(
        originX: number,
        originY: number,
        elapsedMs: number,
        pendingSteps: ScheduledParticleStep[],
    ) {
        this.elapsedMs = elapsedMs;
        this.pendingSteps = pendingSteps;
        this.originX = originX;
        this.originY = originY;
    }
}
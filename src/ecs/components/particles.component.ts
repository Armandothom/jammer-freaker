import { ParticleType, PARTICLE_TYPE_GENERIC } from "../../game/renderer/renderer-engine.js";

export class ParticlesComponent {
  constructor(
    public particleOriginX: number,
    public particleOriginY: number,
    public originDirection: { x: number; y: number },
    public particleType: ParticleType = PARTICLE_TYPE_GENERIC,
    public maxParticlesEmitted: number = 5,
    public isStained: boolean | null = null,
  ) {
  }
}

export type TrajectoryType = 0 | 1;
export type RGB = [number, number, number];
export type ParticleType = 0 | 1 | 2 | 3;

export interface ParticleStainConfig {
  color: RGB;
  size: number;
}

export const PARTICLE_TYPE_GENERIC: ParticleType = 0;
export const PARTICLE_TYPE_BLOOD: ParticleType = 1;
export const PARTICLE_TYPE_DUST: ParticleType = 2;
export const PARTICLE_TYPE_SPARK: ParticleType = 3;

export interface SpawnEvent {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  flightLife: number;
  stainLife: number;
  isStained: boolean;
  stainConfig: ParticleStainConfig | null;
  size: number;
  color: RGB;
  trajectoryType: TrajectoryType;
  particleType?: ParticleType;
}

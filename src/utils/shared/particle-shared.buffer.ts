export type ParticleSpawnData = {
  position: { x: number, y: number },
  velocity: { x: number, y: number },
  flightLife: number,
  stainLife: number,
  isStained: boolean,
  stainConfig: {
    color: [number, number, number],
    size: number,
  } | null,
  color: [number, number, number],
  size: number,
  trajectoryType: number,
};

export const spawnBuffer: ParticleSpawnData[] = [];

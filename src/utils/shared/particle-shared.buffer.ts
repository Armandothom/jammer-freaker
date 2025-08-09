export type ParticleSpawnData = {
  position: { x: number, y: number },
  velocity: { x: number, y: number },
  life: number,
  color: [number, number, number],
  size: number,
  trajectoryType: number,
};

export const spawnBuffer: ParticleSpawnData[] = [];
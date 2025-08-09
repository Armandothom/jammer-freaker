export class DustParticlesComponent {
  constructor(
    public particleOriginX: number,
    public particleOriginY: number,
    public originDirection: {x: number, y: number},
    public maxParticlesEmitted: number = 5,
  ) {
  }
}
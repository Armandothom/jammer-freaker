export class VelocityComponent {
  constructor(
    public baseVelocityX: number,
    public baseVelocityY: number,
    public currentVelocityX: number,
    public currentVelocityY: number,
    public scaledAtLevel: number = -1,
  ) {
  }
}

export class VelocityComponent {
  constructor(
    public baseVelocityX: number,
    public baseVelocityY: number,
    public currentVelocityX: number,
    public currentVelocityY: number,
    public scaledAtLevel: number = -1,
    public currentMovementVelocityX: number = 0,
    public currentMovementVelocityY: number = 0,
  ) {
  }
}

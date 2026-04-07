export class ShooterCooldownComponent {
  public shootingCooldown: number;
  public grenadeCooldown: number
  constructor(shootingCooldown: number, grenadeCooldown: number) {
    this.shootingCooldown = shootingCooldown;
    this.grenadeCooldown = grenadeCooldown;
  }
}
import { CoreManager } from "../core/core-manager.js";

export class ShootingCooldownComponent {
  public endCooldown : number;
  constructor(
    cooldownTimeInSeconds: number,
  ) {
    this.endCooldown = CoreManager.timeGlobalSinceStart + cooldownTimeInSeconds;  
  }
}
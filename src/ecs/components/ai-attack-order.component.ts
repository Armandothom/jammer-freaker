import { CoreManager } from "../core/core-manager.js";
import { AiAttackOrder } from "./types/ai-attack-order.js";

export class AIAttackOrderComponent {
  private readonly maxDurationOrderSeconds = 40;
  public attackOrder : AiAttackOrder
  public endOrderSeconds : number;
  constructor(attackOrder : AiAttackOrder, durationMovementSeconds = this.maxDurationOrderSeconds) {
    this.attackOrder = attackOrder;
    this.endOrderSeconds = CoreManager.timeGlobalSinceStart + durationMovementSeconds;
  }
}
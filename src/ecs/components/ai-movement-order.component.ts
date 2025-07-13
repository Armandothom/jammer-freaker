import { PathfindingCoordinates } from "../../game/world/types/pathfinding-node.js";
import { CoreManager } from "../core/core-manager.js";
import { AiMovementOrder } from "./types/ai-movement-order.js";

export class AIMovementOrderComponent {
  private readonly maxDurationMovementSeconds = 40;
  public movementOrder : AiMovementOrder
  public pathList : PathfindingCoordinates[]
  public endMovementSeconds: number
  constructor(movementOrder : AiMovementOrder, pathList : PathfindingCoordinates[], durationMovementSeconds = this.maxDurationMovementSeconds) {
    this.movementOrder = movementOrder;
    this.pathList = pathList;
    this.endMovementSeconds = CoreManager.timeGlobalSinceStart + durationMovementSeconds;
  }
}
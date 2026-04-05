import { PathfindingCoordinates } from "../../game/world/types/pathfinding-node.js";

export class AIMovementOrderComponent {
  public pathList : PathfindingCoordinates[];
  public debugColor : string;
  constructor(pathList : PathfindingCoordinates[], debugColor?: string) {
    this.pathList = pathList;
    this.debugColor = debugColor ?? this.generateDebugColor();
  }

  private generateDebugColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
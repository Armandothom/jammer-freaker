import { PriorityQueue } from "../../utils/priority-queue.js";
import { PathfindingCoordinates, PathfindingNode } from "./types/pathfinding-node.js";

export class PathFindingManager {
  constructor() {

  }

  computePath(xOrigin: number, yOrigin: number, xTarget: number, yTarget: number) {
    xOrigin = Math.floor(xOrigin);
    yOrigin = Math.floor(yOrigin);
    xTarget = Math.floor(xTarget);
    yTarget = Math.floor(yTarget);
    const supportQueue = new PriorityQueue<PathfindingNode>();
    let hasFinishedSearching = false;
    let hasBuildPath = false;
    let openList: Map<string, PathfindingNode> = new Map();
    const initialNode = {
      x: xOrigin,
      y: yOrigin,
      h: 0,
      f: 0,
      g: 0,
      previousCoordinate: null
    };
    openList.set(this.getKeyFromTileCoordinate(xOrigin, yOrigin), initialNode);
    supportQueue.insert(initialNode, 0)
    let closedList: Map<string, PathfindingNode> = new Map();
    let finalNodeKey!: string;
    while (hasFinishedSearching == false) {
      const node = supportQueue.extractMin()!;
      const keyCurrentNode = this.getKeyFromTileCoordinate(node.x, node.y);
      closedList.set(keyCurrentNode, node);
      openList.delete(keyCurrentNode);
      const neighboringTiles = this.getNeighborTiles(node.x, node.y);
      for (const neighborTile of neighboringTiles) {
        const octileDistance = this.getOctileDistance(neighborTile.x, neighborTile.y, xTarget, yTarget);
        const distanceFromOrigin = node.g + (neighborTile.isDiagonal ? 1.41 : 1);
        let neighborNode: PathfindingNode = {
          h: octileDistance,
          g: distanceFromOrigin,
          f: octileDistance + distanceFromOrigin,
          previousCoordinate: keyCurrentNode,
          x: neighborTile.x,
          y: neighborTile.y
        };
        const keyNeighborTile = this.getKeyFromTileCoordinate(neighborTile.x, neighborTile.y);
        const neighborClosedList = closedList.get(keyNeighborTile);

        //If you find the target coordinate
        if (neighborNode.x == xTarget && neighborNode.y == yTarget) {
          closedList.set(keyNeighborTile, neighborNode);
          finalNodeKey = keyNeighborTile;
          hasFinishedSearching = true;
          break;
        }

        //If neighbor is on closed list
        if (neighborClosedList) {
          if (neighborNode.g < neighborClosedList.g) {
            closedList.delete(keyNeighborTile);
            supportQueue.insert(neighborNode, neighborNode.f);
            openList.set(keyNeighborTile, neighborNode);
          }
          continue;
        }

        //If neighbor is on open list
        const neighborOnOpenList = openList.get(keyNeighborTile);
        if (!neighborOnOpenList) {
          supportQueue.insert(neighborNode, neighborNode.f);
          openList.set(keyNeighborTile, neighborNode)
        } else if(neighborOnOpenList.g > neighborNode.g) {
          supportQueue.insert(neighborNode, neighborNode.f);
          openList.set(keyNeighborTile, neighborNode)
        }
      }
    }
    let builtList: PathfindingCoordinates[] = [];
    let lastNode = closedList.get(finalNodeKey)!;
    while (hasBuildPath == false) {
      builtList.push({
        x : lastNode.x,
        y : lastNode.y,
      })
      if(lastNode.x == xOrigin && lastNode.y == yOrigin) {
        hasBuildPath = true;
      } else {
        lastNode = closedList.get(lastNode.previousCoordinate!)!;
      }
    }
    return builtList.reverse();
  }


  //Heuristic used to get distance weight
  private getOctileDistance(xOrigin: number, yOrigin: number, xTarget: number, yTarget: number) {
    const horizontalDistance = Math.abs(xOrigin - xTarget);
    const verticalDistance = Math.abs(yOrigin - yTarget);
    const weightVerticalMove = 1;
    const weightDiagonalMove = 1.41;
    return weightVerticalMove * (horizontalDistance + verticalDistance) + (weightDiagonalMove - 2 * weightVerticalMove) * Math.min(horizontalDistance, verticalDistance);
  }

  private getNeighborTiles(x: number, y: number) {
    return [
      { x: x + 0, y: y + -1, isDiagonal : false }, // top
      { x: x + 1, y: y + 0, isDiagonal : false },  // right
      { x: x + 0, y: y + 1, isDiagonal : false },  // bottom
      { x: x + -1, y: y + 0, isDiagonal : false }, // left
      { x: x + 1, y: y + -1, isDiagonal : true }, // diagonal top-right
      { x: x + 1, y: y + 1, isDiagonal : true },  // diagonal bottom-right
      { x: x + -1, y: y + 1, isDiagonal : true }, // diagonal bottom-left
      { x: x + -1, y: y + -1, isDiagonal : true } // diagonal top-left
    ].filter((coord) => coord.x > 0 && coord.y > 0)
  }

  private getKeyFromTileCoordinate(x: number, y: number) {
    return `${x}_${y}`
  }
}
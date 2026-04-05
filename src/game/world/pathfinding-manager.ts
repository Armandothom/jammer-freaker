import { PriorityQueue } from "../../utils/priority-queue.js";
import { PathfindingCoordinates, PathfindingNode } from "./types/pathfinding-node.js";
import { TilemapPathInformation, TilemapWallTile } from "./types/tilemap-tile.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class PathFindingManager {
  constructor(
    private worldTilemapManager : WorldTilemapManager) {;
  }

  computePath(xWorldOrigin: number, yWorldOrigin: number, xWorldTarget: number, yWorldTarget: number) {
    const tilemapInfo = this.worldTilemapManager.getTilemapPathInformation();
    const tileOrigin = this.worldTilemapManager.worldToTile(xWorldOrigin, yWorldOrigin);
    const tileTarget = this.worldTilemapManager.worldToTile(xWorldTarget, yWorldTarget);
    const supportQueue = new PriorityQueue<PathfindingNode>();
    let hasFinishedSearching = false;
    let hasBuildPath = false;
    let openList: Map<string, PathfindingNode> = new Map();
    const initialNode = {
      x: tileOrigin.tileX,
      y: tileOrigin.tileY,
      h: 0,
      f: 0,
      g: 0,
      previousCoordinate: null
    };
    openList.set(this.worldTilemapManager.setTilemapKey(tileOrigin.tileX, tileOrigin.tileY), initialNode);
    supportQueue.insert(initialNode, 0)
    let closedList: Map<string, PathfindingNode> = new Map();
    const historyList: Map<string, PathfindingNode> = new Map();
    let finalNodeKey!: string;
    while (hasFinishedSearching == false) {
      const node = supportQueue.extractMin();
      if(!node) {
        return;
      }
      const keyCurrentNode = this.worldTilemapManager.setTilemapKey(node.x, node.y);
      //If a node is remaining on the support queue, and it was already closed, we ignore it
      if(closedList.has(keyCurrentNode)) {
        continue;
      }
      closedList.set(keyCurrentNode, node);
      historyList.set(keyCurrentNode, node);
      openList.delete(keyCurrentNode);
      const neighboringTiles = this.getNeighborTiles(node.x, node.y, tilemapInfo);
      for (const neighborTile of neighboringTiles) {
        const octileDistance = this.getOctileDistance(neighborTile.x, neighborTile.y, tileTarget.tileX, tileTarget.tileY);
        const distanceFromOrigin = node.g + (neighborTile.isDiagonal ? 1.41 : 1);
        let neighborNode: PathfindingNode = {
          h: octileDistance,
          g: distanceFromOrigin,
          f: octileDistance + distanceFromOrigin,
          previousCoordinate: keyCurrentNode,
          x: neighborTile.x,
          y: neighborTile.y
        };
        const keyNeighborTile = this.worldTilemapManager.setTilemapKey(neighborTile.x, neighborTile.y);
        const neighborClosedList = closedList.get(keyNeighborTile);

        //If you find the target coordinate
        if (neighborNode.x == tileTarget.tileX && neighborNode.y == tileTarget.tileY) {
          closedList.set(keyNeighborTile, neighborNode);
          historyList.set(keyCurrentNode, node);
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
            historyList.set(keyCurrentNode, node);
          }
          continue;
        }

        //If neighbor is on open list
        const neighborOnOpenList = openList.get(keyNeighborTile);
        if (!neighborOnOpenList) {
          supportQueue.insert(neighborNode, neighborNode.f);
          openList.set(keyNeighborTile, neighborNode)
          historyList.set(keyCurrentNode, node);
        } else if(neighborOnOpenList.g > neighborNode.g) {
          supportQueue.insert(neighborNode, neighborNode.f);
          openList.set(keyNeighborTile, neighborNode)
          historyList.set(keyCurrentNode, node);
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
      if(lastNode.x == tileOrigin.tileX && lastNode.y == tileOrigin.tileY) {
        hasBuildPath = true;
      } else {
        lastNode = historyList.get(lastNode.previousCoordinate!)!;
      }
    }
    return builtList.reverse()
    .slice(1) //We remove the first node, since it's the start node
    .map((item) => {
      const worldCoord = this.worldTilemapManager.tileToWorld(item.x, item.y, "center");
      return {
        x : worldCoord.worldX,
        y : worldCoord.worldY
      }
    });
  }


  //Heuristic used to get distance weight
  private getOctileDistance(xOrigin: number, yOrigin: number, xTarget: number, yTarget: number) {
    const horizontalDistance = Math.abs(xOrigin - xTarget);
    const verticalDistance = Math.abs(yOrigin - yTarget);
    const weightVerticalMove = 1;
    const weightDiagonalMove = 1.41;
    return weightVerticalMove * (horizontalDistance + verticalDistance) + (weightDiagonalMove - 2 * weightVerticalMove) * Math.min(horizontalDistance, verticalDistance);
  }

  private getNeighborTiles(x: number, y: number, tilemapInfo: TilemapPathInformation) {
    return [
      { x: x + 0, y: y + -1, isDiagonal: false }, // top
      { x: x + 1, y: y + 0, isDiagonal: false },  // right
      { x: x + 0, y: y + 1, isDiagonal: false },  // bottom
      { x: x + -1, y: y + 0, isDiagonal: false }, // left
      { x: x + 1, y: y + -1, isDiagonal: true }, // diagonal top-right
      { x: x + 1, y: y + 1, isDiagonal: true },  // diagonal bottom-right
      { x: x + -1, y: y + 1, isDiagonal: true }, // diagonal bottom-left
      { x: x + -1, y: y + -1, isDiagonal: true } // diagonal top-left
    ].filter((coord) => {
      if ((coord.x >= 0 && coord.y >= 0) &&
        (coord.x < tilemapInfo.maxTilesX && coord.y < tilemapInfo.maxTilesY) &&
        (tilemapInfo.impassableTiles.has(this.worldTilemapManager.setTilemapKey(coord.x, coord.y)) == false) &&
        (coord.isDiagonal == false || coord.isDiagonal && !this.isDiagonalOrtogonalNeighborsImpassable(x, y, coord.x, coord.y, tilemapInfo.impassableTiles))) {
        return true;
      }
      return false;
    })
  }

  private isDiagonalOrtogonalNeighborsImpassable(xOrigin : number, yOrigin : number, xDiagonal : number, yDiagonal : number, impassableTiles : Map<string, TilemapWallTile>) {
    const deltaX = xDiagonal - xOrigin;
    const deltaY = yDiagonal - yOrigin;
    if(impassableTiles.has(this.worldTilemapManager.setTilemapKey(xOrigin + deltaX, yOrigin))) {
      return true;
    }
    if(impassableTiles.has(this.worldTilemapManager.setTilemapKey(xOrigin, yOrigin + deltaY))) {
      return true;
    }
    return false;
  }
}
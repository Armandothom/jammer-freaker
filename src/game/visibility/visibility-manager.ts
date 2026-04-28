import { PositionComponent } from "../../ecs/components/position.component.js";
import { DebugManager } from "../../ecs/core/debug-manager.js";
import { OrderDebuggerOrchestrator } from "../../ecs/debugger-orders/order-debugger-orchestrator.js";
import { MathUtils } from "../../utils/shared/math-utils.js";
import { CameraManager } from "../world/camera-manager.js";
import { TilemapCoordinates, WorldMapCoordinates } from "../world/types/tilemap-tile.js";
import { WorldEdgeChunkManager } from "../world/world-edge-chunk-manager.js";
import { WorldTilemapManager } from "../world/world-tilemap-manager.js";
import { VisibilityRay } from "./visibility.type.js";

export class VisibilityManager {
  private _currentRays: Array<VisibilityRay> = [];
  private readonly _radDiff = 0.0872664626; // 5 degrees, we compensate due the eye level of the sprite
  constructor(
    private edgeChunkManager: WorldEdgeChunkManager,
    private worldTilemapManager: WorldTilemapManager,
    private cameraManager: CameraManager,
    private debugManager: DebugManager
  ) {

  }

  public setCurrentVisibilityRays(playerPosition: PositionComponent) {
    this._currentRays = [];
    let edges = this.edgeChunkManager.getEdgesFromCameraView();
    if (this.debugManager.selectedDebugIndex != -1) {
      edges = edges.filter((edge, i) => this.debugManager.selectedDebugIndex == i);
    }
    for (const edge of edges) {
      const campledEdge = this.clampMapCoordinates(edge);
      const angle = this.getAngle(campledEdge, playerPosition);
      const ray = this.setHit(playerPosition, angle);
      const adjacentRays = [this.setHit(playerPosition, angle + this._radDiff), this.setHit(playerPosition, angle - this._radDiff)]
      this._currentRays.push(ray, ...adjacentRays);
      OrderDebuggerOrchestrator.insertPaintOrder(adjacentRays.map((ray) => {
        return {
        type : "circle",
        centroidX : ray.x,
        centroidY : ray.y,
        width : 10,
        color: "#119008"
      }
      }));
      OrderDebuggerOrchestrator.insertPaintOrder([
        {
        type : "circle",
        centroidX : ray.x,
        centroidY : ray.y,
        width : 10,
        color: "#900808"
      }
      ])
    }
    return this._currentRays;
  }

  private setHit(originPosition: PositionComponent, angle: number): VisibilityRay {
    let positionStep: WorldMapCoordinates = {
      x: originPosition.x,
      y: originPosition.y
    };
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    //We clamp the currentTile due to sometimes the player position going negative if on tile 0
    let currentTile = this.worldTilemapManager.clampCoordinates(this.worldTilemapManager.worldToTile(positionStep.x, positionStep.y));
    //DDA
    while (true) {
      const nextTileBoundaryXWorldPos = this.getNextTileBorderWorldPos(dirX, currentTile.tileX);
      const nextTileBoundaryYWorldPos = this.getNextTileBorderWorldPos(dirY, currentTile.tileY);
      let isObstacleHit = false;
      /**
       * Discovering the step for next tile, this based on this expression:
       * originY + dirY * t = boundaryY
       * t = (boundaryY - originY) / dirY
      */
      let stepToBoundaryX = nextTileBoundaryXWorldPos !== null ? ((nextTileBoundaryXWorldPos - positionStep.x) / dirX) : +Infinity;
      let stepToBoundaryY = nextTileBoundaryYWorldPos !== null ? ((nextTileBoundaryYWorldPos - positionStep.y) / dirY) : +Infinity;
      const boundaryDiff = Math.abs(stepToBoundaryX - stepToBoundaryY);
      if (boundaryDiff < 1) {
        const ortogonalTiles: Array<TilemapCoordinates> = [
          {
            tileX: currentTile.tileX,
            tileY: currentTile.tileY + (1 * Math.sign(dirY))
          },
          {
            tileX: currentTile.tileX + (1 * Math.sign(dirX)),
            tileY: currentTile.tileY
          },
        ];
        positionStep.x = nextTileBoundaryXWorldPos!;
        positionStep.y = nextTileBoundaryYWorldPos!;
        currentTile.tileX += 1 * Math.sign(dirX);
        currentTile.tileY += 1 * Math.sign(dirY);
        isObstacleHit = this.checkRayHitObstacle(currentTile) || ortogonalTiles.some((tile) => this.checkRayHitObstacle(tile))
      } else if (stepToBoundaryX < stepToBoundaryY) {
        positionStep.x = nextTileBoundaryXWorldPos!;
        positionStep.y += dirY * stepToBoundaryX;
        currentTile.tileX += 1 * Math.sign(dirX);
        isObstacleHit = this.checkRayHitObstacle(currentTile);
      } else if (stepToBoundaryX > stepToBoundaryY) {
        positionStep.x += dirX * stepToBoundaryY;
        positionStep.y = nextTileBoundaryYWorldPos!;
        currentTile.tileY += 1 * Math.sign(dirY);
        isObstacleHit = this.checkRayHitObstacle(currentTile);
      }
      const isWithinViewport = this.isWithinMap(positionStep, currentTile);
      if (!isWithinViewport) {
        const rearrangedCoordinates = this.clampMapCoordinates(positionStep);
        const rearrangedAngle = this.getAngle(rearrangedCoordinates, originPosition);
        return {
          angle: rearrangedAngle,
          x: rearrangedCoordinates.x,
          y: rearrangedCoordinates.y
        }
      }
      if (isObstacleHit || !isWithinViewport) {
        return {
          angle,
          x: positionStep.x,
          y: positionStep.y
        }
      }
    }
  }

  private getAngle(target: WorldMapCoordinates, origin: WorldMapCoordinates) {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    return Math.atan2(dy, dx);
  }

  //Clamp if camera goes "off-world"
  private clampMapCoordinates(target: WorldMapCoordinates): WorldMapCoordinates {
    const viewport = this.cameraManager.getViewport();
    const xStartLimit = Math.max(viewport.left, 0);
    const xEndLimit = Math.min(viewport.right, this.worldTilemapManager.worldWidth);
    const yStartLimit = Math.max(viewport.top, 0);
    const yEndLimit = Math.min(viewport.bottom, this.worldTilemapManager.worldHeight);
    return {
      x: Math.min(Math.max(target.x, xStartLimit), xEndLimit),
      y: Math.min(Math.max(target.y, yStartLimit), yEndLimit),
    }
  }

  private isWithinMap(positionStep: WorldMapCoordinates, tile: TilemapCoordinates) {
    const isWithinViewport = this.cameraManager.isWithinViewport(positionStep.x, positionStep.x, positionStep.y, positionStep.y);
    const isWithinTilemap = this.worldTilemapManager.isWithinTilemap(tile);
    return isWithinViewport && isWithinTilemap;
  }

  private getNextTileBorderWorldPos(dirAxis: number, tileOrigin: number) {
    const nextTile = tileOrigin + Math.sign(dirAxis);
    if (nextTile > tileOrigin) {
      return this.worldTilemapManager.tileIndexToWorld(nextTile);
    } else if (nextTile < tileOrigin) {
      //Since the "border" to the previous tile would be on topleft
      return this.worldTilemapManager.tileIndexToWorld(tileOrigin);
    } else {
      return null;
    }
  }

  private checkRayHitObstacle(tile: TilemapCoordinates) {
    return this.worldTilemapManager.impassableWallTiles.has(this.worldTilemapManager.setTilemapKey(tile.tileX, tile.tileY));
  }

  get currentVisibilityRays() {
    return this._currentRays;
  }

}

import { PositionComponent } from "../../ecs/components/position.component.js";
import { CameraManager } from "../world/camera-manager.js";
import { TilemapCoordinates, WorldMapCoordinates } from "../world/types/tilemap-tile.js";
import { WorldEdgeChunkManager } from "../world/world-edge-chunk-manager.js";
import { WorldTilemapManager } from "../world/world-tilemap-manager.js";
import { VisibilityRay } from "./visibility.type.js";

export class VisibilityManager {
  private _currentRays : Array<VisibilityRay> = [];
  constructor(
    private edgeChunkManager : WorldEdgeChunkManager,
    private worldTilemapManager : WorldTilemapManager,
    private cameraManager : CameraManager
  ) {

  }

  public setCurrentVisibilityRays(playerPosition : PositionComponent) {
    this._currentRays = [];
    const edges = this.edgeChunkManager.getEdgesFromCameraView();
    for (const edge of edges) {
      const ray = this.setHit(edge, playerPosition);
      this._currentRays.push(ray);
    }
    return this._currentRays;
  }

  private setHit(edge: WorldMapCoordinates, originPosition: PositionComponent) : VisibilityRay {
    let positionStep : WorldMapCoordinates = { 
      x : originPosition.x,
      y : originPosition.y
    };
    edge = this.clampMapCoordinates(edge);
    const angle = this.getAngle(edge, originPosition);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    let currentTile = this.worldTilemapManager.worldToTile(positionStep.x, positionStep.y);
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
      const stepToBoundaryX = nextTileBoundaryXWorldPos !== null ? ((nextTileBoundaryXWorldPos - positionStep.x) / dirX) : +Infinity;
      const stepToBoundaryY = nextTileBoundaryYWorldPos !== null ? ((nextTileBoundaryYWorldPos - positionStep.y) / dirY) : +Infinity;
      if(stepToBoundaryX < stepToBoundaryY) {
        positionStep.x = nextTileBoundaryXWorldPos!;
        positionStep.y += dirY * stepToBoundaryX;
        currentTile.tileX += 1 * Math.sign(dirX);
        isObstacleHit = this.checkRayHitObstacle(currentTile);
      } else if (stepToBoundaryX > stepToBoundaryY) {
        positionStep.x += dirX * stepToBoundaryY;
        positionStep.y = nextTileBoundaryYWorldPos!;
        currentTile.tileY += 1 * Math.sign(dirY);
        isObstacleHit = this.checkRayHitObstacle(currentTile);
      } else {
        const ortogonalTiles : Array<TilemapCoordinates> =  [
          {
            tileX : currentTile.tileX,
            tileY : currentTile.tileY + (1 * Math.sign(dirY))
          },
          {
            tileX : currentTile.tileX + (1 * Math.sign(dirX)),
            tileY : currentTile.tileY
          },
        ];
        positionStep.x = nextTileBoundaryXWorldPos!;
        positionStep.y = nextTileBoundaryYWorldPos!;
        currentTile.tileX += 1 * Math.sign(dirX);
        currentTile.tileY += 1 * Math.sign(dirY);
        isObstacleHit = this.checkRayHitObstacle(currentTile) || ortogonalTiles.every((tile) => this.checkRayHitObstacle(tile))
      }
      const isWithinViewport = this.cameraManager.isWithinViewport(positionStep.x, positionStep.x, positionStep.y, positionStep.y);
      if(!isWithinViewport) {
        const rearrangedCoordinates = this.clampMapCoordinates(edge);
        const rearrangedAngle = this.getAngle(rearrangedCoordinates, originPosition);
        return {
          angle : rearrangedAngle,
          x : rearrangedCoordinates.x,
          y : rearrangedCoordinates.y
        }
      }
      if(isObstacleHit || !isWithinViewport) {
        return {
          angle,
          x : positionStep.x,
          y : positionStep.y
        }
      }
    }
  }

  private getAngle(target : WorldMapCoordinates, origin : WorldMapCoordinates) {
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    return Math.atan2(dy, dx);
  }

  private clampMapCoordinates(target : WorldMapCoordinates) : WorldMapCoordinates {
    const viewport = this.cameraManager.getViewport();
    const xStartLimit = Math.max(viewport.left, 0);
    const xEndLimit = Math.min(viewport.right, this.worldTilemapManager.worldWidth);
    const yStartLimit = Math.max(viewport.top, 0);
    const yEndLimit = Math.min(viewport.bottom, this.worldTilemapManager.worldHeight);
    return {
      x : Math.min(Math.max(target.x, xStartLimit), xEndLimit),
      y : Math.min(Math.max(target.y, yStartLimit), yEndLimit),
    }
  }

  private getNextTileBorderWorldPos(dirAxis : number, tileOrigin : number) {
    const nextTile = tileOrigin + Math.sign(dirAxis);
    if(nextTile > tileOrigin) {
      return this.worldTilemapManager.tileIndexToWorld(nextTile);
    } else if (nextTile < tileOrigin) {
      //Since the "border" to the previous tile would be on topleft
      return this.worldTilemapManager.tileIndexToWorld(tileOrigin) ;
    } else {
      return null;
    }
  }

  private checkRayHitObstacle(tile : TilemapCoordinates) {
    return this.worldTilemapManager.impassableWallTiles.has(this.worldTilemapManager.setTilemapKey(tile.tileX, tile.tileY));
  }

  get currentVisibilityRays() {
    return this._currentRays;
  }

}

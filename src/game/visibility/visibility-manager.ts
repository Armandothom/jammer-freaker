import { PositionComponent } from "../../ecs/components/position.component.js";
import { AngleFovRange } from "../../ecs/components/types/player-fov.type.js";
import { DebugManager } from "../../ecs/core/debug-manager.js";
import { DebugSettingKey } from "../../ecs/core/types/debug-manager-settings.js";
import { OrderDebuggerOrchestrator } from "../../ecs/debugger-orders/order-debugger-orchestrator.js";
import { MathUtils } from "../../utils/shared/math-utils.js";
import { CameraManager } from "../world/camera-manager.js";
import { TilemapCoordinates, WorldMapCoordinates } from "../world/types/tilemap-tile.js";
import { WorldEdgeChunkManager } from "../world/world-edge-chunk-manager.js";
import { WorldTilemapManager } from "../world/world-tilemap-manager.js";
import { VisibilityRayPoint } from "./visibility.type.js";

export class VisibilityManager {
  private _currentRays: Array<VisibilityRayPoint> = [];
  constructor(
    private edgeChunkManager: WorldEdgeChunkManager,
    private worldTilemapManager: WorldTilemapManager,
    private cameraManager: CameraManager,
    private debugManager: DebugManager
  ) {

  }

  public setCurrentVisibilityRayPoints(originPosition: WorldMapCoordinates, fovRange : AngleFovRange) {
    this._currentRays = [];
    const rays : VisibilityRayPoint[] = [];
    const chunkEdges = this.edgeChunkManager.getEdgesFromMemoryChunk();
    const borderEdges = this.getEdgePointsFromViewportCornerTiles();
    //const isFovRightSide = fovRange.start > fovRange.end;
    let edges = [...chunkEdges, ...borderEdges];
    for (const edge of edges) {
      const clampedEdge = this.clampMapCoordinates(edge);
      const angleRad = this.getAngleRad(clampedEdge, originPosition);
      //We use the tangent approach to calculate the angular offset, and then atan2 to get the degree
      const distance = Math.max(
        1,
        Math.hypot(clampedEdge.x - originPosition.x, clampedEdge.y - originPosition.y)
      );
      const angleRadEpsilon = Math.atan2(1, distance);
      const angleRads = [angleRad, angleRad + angleRadEpsilon, angleRad - angleRadEpsilon];
      for (const angleRad of angleRads) {
        //commented, deactivated fov
        //const angle = MathUtils.radToDegreeNormalized(angleRad);
        // if(!this.isAngleUnderFov(isFovRightSide, fovRange, angle)) {
        //   continue;
        // }
        const ray = this.setHit(originPosition, angleRad);
        rays.push(ray);
      }
    }
    //Rays on limit, to limit FOV
    //rays.push(...[fovRange.start, fovRange.end].map((angle) => this.setHit(originPosition, MathUtils.degreeToRad(angle))));
    this._currentRays = this.formRayTriangleFan(originPosition, rays);
    this.debugDrawPoints();
    if (this.debugManager.selectedDebugIndex != -1) {
      const indexStart = (this.debugManager.selectedDebugIndex) * 3;
      const indexEnd = indexStart + 3;
      this._currentRays = this._currentRays.slice(indexStart, indexEnd);
    }
    return this._currentRays;
  }

  //We build the triangle fan based on the ray points
  private formRayTriangleFan(originPosition: PositionComponent, rays: VisibilityRayPoint[]) {
    const origin: VisibilityRayPoint = {
      x: originPosition.x,
      y: originPosition.y,
      angle: 0
    }
    const sortedRays = rays.sort((a, b) => MathUtils.radToDegreeNormalized(a.angle) - MathUtils.radToDegreeNormalized(b.angle));
    const pointMeshes: VisibilityRayPoint[] = [];
    for (let i = 0; i < sortedRays.length; i++) {
      const current = sortedRays[i];
      const next = sortedRays[(i + 1) % sortedRays.length];
      pointMeshes.push(origin, current, next);
    }
    return pointMeshes;
  }

  private debugDrawPoints() {
    if (!this.debugManager.getDebugSetting(DebugSettingKey.DEBUG_PAINT)) {
      return;
    }
    OrderDebuggerOrchestrator.insertPaintOrder(this._currentRays.map((ray) => {
      return {
        type: "circle",
        centroidX: ray.x,
        centroidY: ray.y,
        width: 4,
        color: "#db2929"
      }
    }))
  }

  private isAngleUnderFov(isFovRightSide : boolean, fovAngle : AngleFovRange, angle : number) {
    if ((isFovRightSide && (fovAngle.start <= angle || fovAngle.end >= angle)) ||
      (!isFovRightSide && fovAngle.start <= angle && fovAngle.end >= angle)) {
      return true;
    }
    return false;
  }

  private setHit(originPosition: PositionComponent, angle: number): VisibilityRayPoint {
    const viewport = this.cameraManager.getViewport();
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
      if (boundaryDiff <= 0.005) {
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
        isObstacleHit = this.checkRayHitObstacle(currentTile) || ortogonalTiles.some((tile) => this.checkRayHitObstacle(tile));
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
      const isWithinViewport = this.cameraManager.isWithinViewport(positionStep.x, positionStep.x, positionStep.y, positionStep.y);
      const isWithinTilemap = this.worldTilemapManager.isWithinTilemap(currentTile);
      if (!isWithinViewport) {
        //We take the X or Y axis that is outside viewport, then we
        //discover where the point should go based on the "last pixel on the viewport range" (t value)
        //maybe shit way to do this, review later
        const outsideSide = this.cameraManager.isSideOutsideViewport(positionStep);
        let tYReachBorder = Infinity;
        let tXReachBorder = Infinity;
        let targetBoundaryX = 0;
        let targetBoundaryY = 0;
        if (outsideSide.yAxis) {
          targetBoundaryY = outsideSide.yAxis == 'top' ? viewport.top : viewport.bottom;
          tYReachBorder = (targetBoundaryY - originPosition.y) / dirY;
        }
        if(outsideSide.xAxis) {
          targetBoundaryX = outsideSide.xAxis == 'left' ? viewport.left : viewport.right;
          tXReachBorder = (targetBoundaryX - originPosition.x) / dirX;
        }
        if(Math.abs(tXReachBorder) < Math.abs(tYReachBorder)) {
          positionStep.y = originPosition.y + tXReachBorder * dirY;
          positionStep.x = targetBoundaryX;
        } else {
          positionStep.x = originPosition.x + tYReachBorder * dirX;
          positionStep.y = targetBoundaryY;
        }
        return {
          angle,
          x: positionStep.x,
          y: positionStep.y
        }
      }
      if (isObstacleHit || !isWithinTilemap) {
        return {
          angle,
          x: positionStep.x,
          y: positionStep.y
        }
      }
    }
  }

  private getAngleRad(target: WorldMapCoordinates, origin: WorldMapCoordinates) {
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


  private getEdgePointsFromViewportCornerTiles() {
    let edgePoints: WorldMapCoordinates[] = [];
    const viewport = this.cameraManager.getViewport();
    const topLeftTile = this.worldTilemapManager.worldToTile(viewport.left, viewport.top);
    const bottomLeftTile = this.worldTilemapManager.worldToTile(viewport.left, viewport.bottom);
    const topRightTile = this.worldTilemapManager.worldToTile(viewport.right, viewport.top);
    const bottomRightTile = this.worldTilemapManager.worldToTile(viewport.right, viewport.bottom);
    let leftCornerSegment = topLeftTile;
    let topCornerSegment = topRightTile;
    let rightCornerSegment = bottomRightTile;
    let bottomCornerSegment = bottomLeftTile;
    const groupedSegments = [leftCornerSegment, topCornerSegment, rightCornerSegment, bottomCornerSegment];
    let hasRunAllCornerTiles = false;
    while (hasRunAllCornerTiles == false) {
      hasRunAllCornerTiles = true;
      this.appendEdgesFromTiles(groupedSegments, edgePoints);
      if (leftCornerSegment.tileY < bottomLeftTile.tileY) {
        leftCornerSegment.tileY += 1;
        hasRunAllCornerTiles = false;
      }
      if (rightCornerSegment.tileY > topRightTile.tileY) {
        rightCornerSegment.tileY -= 1;
        hasRunAllCornerTiles = false;
      }
      if (bottomCornerSegment.tileX < bottomRightTile.tileX) {
        bottomCornerSegment.tileX += 1;
        hasRunAllCornerTiles = false;
      }
      if (topCornerSegment.tileX > topLeftTile.tileX) {
        topCornerSegment.tileX -= 1;
        hasRunAllCornerTiles = false;
      }
    }
    return edgePoints;
  }


  private appendEdgesFromTiles(groupedTiles: TilemapCoordinates[], edgePoints: WorldMapCoordinates[]) {
    for (const tile of groupedTiles) {
      if (this.worldTilemapManager.impassableWallTiles.has(this.worldTilemapManager.setTilemapKey(tile.tileX, tile.tileY))) {
        const worldCoord = this.worldTilemapManager.tileToWorld(tile.tileX, tile.tileY);
        edgePoints.push(
          this.clampMapCoordinates({ x: worldCoord.worldX, y: worldCoord.worldY }),
          this.clampMapCoordinates({ x: worldCoord.worldX + this.worldTilemapManager.tileSize, y: worldCoord.worldY }),
          this.clampMapCoordinates({ x: worldCoord.worldX, y: worldCoord.worldY + this.worldTilemapManager.tileSize }),
          this.clampMapCoordinates({ x: worldCoord.worldX + this.worldTilemapManager.tileSize, y: worldCoord.worldY + this.worldTilemapManager.tileSize }),
        );
      }
    }
  }

  get currentVisibilityRayPoints() {
    return this._currentRays;
  }

}

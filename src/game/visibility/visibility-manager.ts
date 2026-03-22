import { WorldTilemapManager } from "../world/world-tilemap-manager.js";

type TileCoordinate = {
  x: number;
  y: number;
};

export class VisibilityManager {
  public fogOfWarEnabled = false;
  public visionRadiusTiles = 25;

  private readonly visibleTileKeys: Set<string> = new Set();

  public clear(): void {
    this.visibleTileKeys.clear();
  }

  public updateVisibilityFromWorldPosition(
    originWorldX: number,
    originWorldY: number,
    tilemapManager: WorldTilemapManager,
  ): void {
    this.visibleTileKeys.clear();

    if (!this.fogOfWarEnabled) {
      return;
    }

    const originTileX = Math.floor(originWorldX / tilemapManager.tileSize);
    const originTileY = Math.floor(originWorldY / tilemapManager.tileSize);

    if (!this.isTileWithinBounds(originTileX, originTileY, tilemapManager)) {
      return;
    }

    this.markTileVisible(originTileX, originTileY);

    const radius = this.visionRadiusTiles;
    const bounds = tilemapManager.worldMaxBoundsTiles;

    const startTileX = Math.max(bounds.left, originTileX - radius);
    const endTileX = Math.min(bounds.right - 1, originTileX + radius);
    const startTileY = Math.max(bounds.top, originTileY - radius);
    const endTileY = Math.min(bounds.bottom - 1, originTileY + radius);

    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const deltaX = tileX - originTileX;
        const deltaY = tileY - originTileY;

        if ((deltaX * deltaX) + (deltaY * deltaY) > radius * radius) {
          continue;
        }

        if (this.hasLineOfSight(originTileX, originTileY, tileX, tileY, tilemapManager)) {
          this.markTileVisible(tileX, tileY);
        }
      }
    }
  }

  public isTileVisible(tileX: number, tileY: number): boolean {
    if (!this.fogOfWarEnabled) {
      return true;
    }

    return this.visibleTileKeys.has(this.buildTileKey(tileX, tileY));
  }

  public isWorldPositionVisible(
    worldX: number,
    worldY: number,
    tilemapManager: WorldTilemapManager,
  ): boolean {
    if (!this.fogOfWarEnabled) {
      return true;
    }

    const tileX = Math.floor(worldX / tilemapManager.tileSize);
    const tileY = Math.floor(worldY / tilemapManager.tileSize);

    if (!this.isTileWithinBounds(tileX, tileY, tilemapManager)) {
      return false;
    }

    return this.isTileVisible(tileX, tileY);
  }

  private hasLineOfSight(
    originTileX: number,
    originTileY: number,
    targetTileX: number,
    targetTileY: number,
    tilemapManager: WorldTilemapManager,
  ): boolean {
    const traversedTiles = this.buildRayPath(originTileX, originTileY, targetTileX, targetTileY);

    for (let index = 1; index < traversedTiles.length; index++) {
      const tile = traversedTiles[index];

      if (!this.isTileWithinBounds(tile.x, tile.y, tilemapManager)) {
        return false;
      }

      const isTargetTile = tile.x === targetTileX && tile.y === targetTileY;
      const isWallTile = tilemapManager.isWallSolid(tile.x, tile.y);

      if (isWallTile) {
        return isTargetTile;
      }
    }

    return true;
  }

  private buildRayPath(
    originTileX: number,
    originTileY: number,
    targetTileX: number,
    targetTileY: number,
  ): TileCoordinate[] {
    const traversedTiles: TileCoordinate[] = [];

    let currentX = originTileX;
    let currentY = originTileY;

    const deltaX = Math.abs(targetTileX - originTileX);
    const stepX = originTileX < targetTileX ? 1 : -1;
    const deltaY = -Math.abs(targetTileY - originTileY);
    const stepY = originTileY < targetTileY ? 1 : -1;

    let error = deltaX + deltaY;

    while (true) {
      traversedTiles.push({ x: currentX, y: currentY });

      if (currentX === targetTileX && currentY === targetTileY) {
        break;
      }

      const errorDoubled = 2 * error;

      if (errorDoubled >= deltaY) {
        error += deltaY;
        currentX += stepX;
      }

      if (errorDoubled <= deltaX) {
        error += deltaX;
        currentY += stepY;
      }
    }

    return traversedTiles;
  }

  private markTileVisible(tileX: number, tileY: number): void {
    this.visibleTileKeys.add(this.buildTileKey(tileX, tileY));
  }

  private buildTileKey(tileX: number, tileY: number): string {
    return `${tileX}_${tileY}`;
  }

  private isTileWithinBounds(
    tileX: number,
    tileY: number,
    tilemapManager: WorldTilemapManager,
  ): boolean {
    const bounds = tilemapManager.worldMaxBoundsTiles;

    return (
      tileX >= bounds.left &&
      tileY >= bounds.top &&
      tileX < bounds.right &&
      tileY < bounds.bottom
    );
  }
}

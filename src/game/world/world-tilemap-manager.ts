import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import { CameraViewport } from './types/camera-viewport.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { TilemapTile } from './types/tilemap-tile.js';
import { WorldZone, ZoneType } from './types/zone-type.js';

export class WorldTilemapManager {
  public readonly worldWidth = 3200;
  public readonly worldHeight = 3200;

  public readonly zoneWidth = 800;
  public readonly zoneHeight = 800;

  public readonly zoneCountX = this.worldWidth / this.zoneWidth;   // 4
  public readonly zoneCountY = this.worldHeight / this.zoneHeight; // 4

  public readonly tileSize = 32;

  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();
  private readonly _zones: WorldZone[] = [];

  public readonly _maxNumberTilesX: number;
  public readonly _maxNumberTilesY: number;

  constructor() {
    this._maxNumberTilesX = Math.floor(this.worldWidth / this.tileSize);
    this._maxNumberTilesY = Math.floor(this.worldHeight / this.tileSize);

    this.initializeBaseTilemap();
    this.initializeZones();
  }

  private initializeBaseTilemap(): void {
    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        this._tilemap.set(this.setTilemapKey(x, y), {
          x,
          y,
          spriteName: SpriteName.METAL_1,
        });
      }
    }
  }

  private initializeZones(): void {
    for (let zoneGridY = 0; zoneGridY < this.zoneCountY; zoneGridY++) {
      for (let zoneGridX = 0; zoneGridX < this.zoneCountX; zoneGridX++) {
        this._zones.push({
          zoneGridX,
          zoneGridY,
          worldX: zoneGridX * this.zoneWidth,
          worldY: zoneGridY * this.zoneHeight,
          width: this.zoneWidth,
          height: this.zoneHeight,
          type: this.resolveZoneType(zoneGridX, zoneGridY),
        });
      }
    }
  }

  private resolveZoneType(zoneGridX: number, zoneGridY: number): ZoneType {
    const isLeft = zoneGridX === 0;
    const isRight = zoneGridX === this.zoneCountX - 1;
    const isTop = zoneGridY === 0;
    const isBottom = zoneGridY === this.zoneCountY - 1;

    if (isLeft && isTop) return ZoneType.NorthWestCorner;
    if (isRight && isTop) return ZoneType.NorthEastCorner;
    if (isLeft && isBottom) return ZoneType.SouthWestCorner;
    if (isRight && isBottom) return ZoneType.SouthEastCorner;

    if (isTop) return ZoneType.NorthExterior;
    if (isBottom) return ZoneType.SouthExterior;
    if (isLeft) return ZoneType.WestExterior;
    if (isRight) return ZoneType.EastExterior;

    if (zoneGridX === 1 && zoneGridY === 1) return ZoneType.InnerNorthWest;
    if (zoneGridX === 2 && zoneGridY === 1) return ZoneType.InnerNorthEast;
    if (zoneGridX === 1 && zoneGridY === 2) return ZoneType.InnerSouthWest;
    if (zoneGridX === 2 && zoneGridY === 2) return ZoneType.InnerSouthEast;

    throw new Error(`Invalid zone coordinates: (${zoneGridX}, ${zoneGridY})`);
  }

  public get zones(): WorldZone[] {
    return this._zones;
  }

  public getZoneByGrid(zoneGridX: number, zoneGridY: number): WorldZone {
    const zone = this._zones.find(
      z => z.zoneGridX === zoneGridX && z.zoneGridY === zoneGridY,
    );

    if (!zone) {
      throw new Error(`Zone not found for grid coordinates (${zoneGridX}, ${zoneGridY})`);
    }

    return zone;
  }

  public getZoneFromWorldPosition(worldX: number, worldY: number): WorldZone {
    const zoneGridX = Math.floor(worldX / this.zoneWidth);
    const zoneGridY = Math.floor(worldY / this.zoneHeight);

    return this.getZoneByGrid(zoneGridX, zoneGridY);
  }

  public getTilesInArea(viewport: CameraViewport): TilemapTile[] {
    const tiles: TilemapTile[] = [];
    // avoids black bars during movement due to 4:3 screen
    const renderPadding = this.tileSize * 2;

    const startTileX = Math.max(
      0,
      Math.floor((viewport.left - renderPadding) / this.tileSize)
    );
    const endTileX = Math.min(
      this._maxNumberTilesX,
      Math.ceil((viewport.right + renderPadding) / this.tileSize)
    );

    const startTileY = Math.max(
      0,
      Math.floor((viewport.top - renderPadding) / this.tileSize)
    );
    const endTileY = Math.min(
      this._maxNumberTilesY,
      Math.ceil((viewport.bottom + renderPadding) / this.tileSize)
    );

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        tiles.push(this.getTile(x, y));
      }
    }

    return tiles;
  }

  public setTile(x: number, y: number, spriteName: SpriteName): void {
    this.ensureTileBounds(x, y);

    this._tilemap.set(this.setTilemapKey(x, y), {
      x,
      y,
      spriteName,
    });
  }

  public getTile(x: number, y: number): TilemapTile {
    this.ensureTileBounds(x, y);

    const key = this.setTilemapKey(x, y);
    const tile = this._tilemap.get(key);

    if (!tile) {
      throw new Error(`Tile not found at (${x}, ${y})`);
    }

    return tile;
  }

  public worldToTile(worldX: number, worldY: number): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(worldX / this.tileSize),
      tileY: Math.floor(worldY / this.tileSize),
    };
  }

  public tileToWorld(tileX: number, tileY: number): { worldX: number; worldY: number } {
    return {
      worldX: tileX * this.tileSize,
      worldY: tileY * this.tileSize,
    };
  }

  public get worldMaxBoundsTiles() {
    return {
      left: 0,
      top: 0,
      right: this._maxNumberTilesX,
      bottom: this._maxNumberTilesY,
    };
  }

  public get appliedSpriteSheetName() {
    return this._tilemapSpritesheetName;
  }

  private setTilemapKey(x: number, y: number): string {
    return `${x}_${y}`;
  }

  private ensureTileBounds(x: number, y: number): void {
    if (x < 0 || y < 0 || x >= this._maxNumberTilesX || y >= this._maxNumberTilesY) {
      throw new Error(`Tile out of bounds: (${x}, ${y})`);
    }
  }
}
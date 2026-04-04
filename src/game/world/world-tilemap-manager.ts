import { OrderDebuggerOrchestrator } from '../../ecs/debugger-orders/order-debugger-orchestrator.js';
import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import { CameraViewport } from './types/camera-viewport.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { TilemapTile, WorldPoiTile, WorldPoiTileType, TilemapWallTile, TilemapPathInformation } from './types/tilemap-tile.js';
import { BakedWall, WorldLevelResult } from './types/world-level-result.js';
import { WorldZone, ZoneType } from './types/zone-type.js';

export class WorldTilemapManager {
  public readonly worldWidth = 3200;
  public readonly worldHeight = 3200;

  public readonly tileSize = 32;

  public readonly zoneWidth = 800;
  public readonly zoneHeight = 800;

  public readonly zoneWidthTiles = this.zoneWidth / this.tileSize;   // 25
  public readonly zoneHeightTiles = this.zoneHeight / this.tileSize; // 25

  public readonly zoneCountX = this.worldWidth / this.zoneWidth;
  public readonly zoneCountY = this.worldHeight / this.zoneHeight;

  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();
  private readonly _wallTiles: Map<string, TilemapWallTile> = new Map();
  private readonly _poiTiles: Map<WorldPoiTileType, Map<string, WorldPoiTile>> = new Map();
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
          type: 'ground',
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
          tileX: zoneGridX * this.zoneWidthTiles,
          tileY: zoneGridY * this.zoneHeightTiles,
          widthTiles: this.zoneWidthTiles,
          heightTiles: this.zoneHeightTiles,
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

  public applyWorldLevelResult(levelResult: WorldLevelResult): void {
    this.applyGroundTiles(levelResult.groundTiles);
    this.applyWalls(levelResult.walls);
    this.applyPoiTiles(levelResult.walls);
  }

  public applyGroundTiles(groundTiles: WorldLevelResult['groundTiles']): void {
    for (const groundTile of groundTiles) {
      this.setTileType(groundTile.x, groundTile.y, groundTile.type);
    }
  }

  public applyPoiTiles(walls: BakedWall[]) {
    this._poiTiles.set(WorldPoiTileType.COVER, new Map());
    const coverMapTiles = this._poiTiles.get(WorldPoiTileType.COVER)!;
    for (const wall of walls) {
      const neighboringTiles: number[][] = [
        [wall.x + 1, wall.y],
        [wall.x, wall.y + 1],
        [wall.x + 1, wall.y + 1],
        [wall.x + 1, wall.y - 1],
        [wall.x - 1, wall.y],
        [wall.x, wall.y - 1],
        [wall.x - 1, wall.y - 1],
        [wall.x - 1, wall.y + 1]
      ];
      for (const neighboringTile of neighboringTiles) {
        const x = neighboringTile[0];
        const y = neighboringTile[1];
        if (x < 0 || y < 0) {
          continue;
        }
        const hasWallTile = this._wallTiles.get(this.setTilemapKey(x, y))?.solid;
        if (hasWallTile) {
          continue;
        }
        coverMapTiles.set(this.setTilemapKey(x, y), {
          x: x,
          y: y,
          type : WorldPoiTileType.COVER
        });
      }
    }
    this._poiTiles.set(WorldPoiTileType.COVER, coverMapTiles);
  }

  public applyWalls(walls: BakedWall[]): void {
    for (const wall of walls) {
      this.setWall(wall.x, wall.y, SpriteName.WALL_1);
    }
  }

  public clearLevelGeometry(): void {
    this._wallTiles.clear();
    this.resetTilemapToGround();
  }

  public setWall(x: number, y: number, spriteName: SpriteName): void {
    this.ensureTileBounds(x, y);

    this._wallTiles.set(this.setTilemapKey(x, y), {
      x,
      y,
      spriteName,
      solid: true,
    });
  }

  public hasWall(x: number, y: number): boolean {
    this.ensureTileBounds(x, y);
    return this._wallTiles.has(this.setTilemapKey(x, y));
  }

  public getWall(x: number, y: number): TilemapWallTile | null {
    this.ensureTileBounds(x, y);
    return this._wallTiles.get(this.setTilemapKey(x, y)) ?? null;
  }

  public isWallSolid(x: number, y: number): boolean {
    return this.getWall(x, y)?.solid ?? false;
  }

  private getTileLimitViewport(viewport : CameraViewport) {
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

    return {
      startTileX,
      endTileX,
      startTileY,
      endTileY
    }
  }

  public getPoiCoverInArea(viewport: CameraViewport) {
    const tiles: WorldPoiTile[] = [];
    const coverMapTiles = this._poiTiles.get(WorldPoiTileType.COVER);
    if(!coverMapTiles) {
      return [];
    }
    const {startTileY, endTileY, startTileX, endTileX} = this.getTileLimitViewport(viewport);
    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        if(coverMapTiles.has(this.setTilemapKey(x, y))) {
          tiles.push({
            x,
            y,
            type : WorldPoiTileType.COVER
          })
        }
      }
    }
    return tiles;
  }

  public getTilesInArea(viewport: CameraViewport): TilemapTile[] {
    const tiles: TilemapTile[] = [];
    const {startTileY, endTileY, startTileX, endTileX} = this.getTileLimitViewport(viewport);

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        tiles.push(this.getTile(x, y));
      }
    }

    return tiles;
  }

  public getWallTilesInArea(viewport: CameraViewport): TilemapWallTile[] {
    const walls: TilemapWallTile[] = [];
    const {startTileY, endTileY, startTileX, endTileX} = this.getTileLimitViewport(viewport);

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const wall = this.getWall(x, y);
        if (wall) {
          walls.push(wall);
        }
      }
    }

    return walls;
  }

  public getTile(x: number, y: number): TilemapTile {
    this.ensureTileBounds(x, y);

    const tile = this._tilemap.get(this.setTilemapKey(x, y));

    if (!tile) {
      throw new Error(`Tile not found at (${x}, ${y})`);
    }

    return tile;
  }


  public getTilemapPathInformation() : TilemapPathInformation {
    const impassableWallTiles = Array.from(this._wallTiles.values()).filter((value) => value.solid);
    return {
      maxTilesX : this._maxNumberTilesX,
      maxTilesY : this._maxNumberTilesY,
      impassableTiles : new Map<string, TilemapWallTile>(impassableWallTiles.map((wallTile) => [this.setTilemapKey(wallTile.x, wallTile.y), wallTile]))
    };
  }


  public setTileType(x: number, y: number, type: TilemapTile['type']): void {
    this.ensureTileBounds(x, y);
    const currentTile = this.getTile(x, y);

    this._tilemap.set(this.setTilemapKey(x, y), {
      ...currentTile,
      type,
    });
  }

  public getTileType(x: number, y: number): TilemapTile['type'] {
    return this.getTile(x, y).type;
  }

  public get zones(): WorldZone[] {
    return this._zones;
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

  public setTilemapKey(x: number, y: number): string {
    return `${x}_${y}`;
  }

  private resetTilemapToGround(): void {
    for (const tile of this._tilemap.values()) {
      tile.spriteName = SpriteName.METAL_1;
      tile.type = 'ground';
    }
  }

  private ensureTileBounds(x: number, y: number): void {
    if (x < 0 || y < 0 || x >= this._maxNumberTilesX || y >= this._maxNumberTilesY) {
      throw new Error(`Tile out of bounds: (${x}, ${y})`);
    }
  }
}

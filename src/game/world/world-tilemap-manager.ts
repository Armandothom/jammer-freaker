import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import {
  isWorldMapTerrainTileSolid,
  isWorldMapTerrainTileType,
  isWorldMapTerrainTileVisibleWall,
  resolveWorldMapTerrainSpriteName,
  resolveWorldMapTerrainSpriteRotation,
} from './maps/world-map-terrain-config.js';
import type { WorldMapDefinition } from './maps/world-map-registry.js';
import { CameraViewport } from './types/camera-viewport.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { TilemapTile, WorldPoiTile, WorldPoiTileType, TilemapWallTile, TilemapPathInformation, TilemapCoordinates } from './types/tilemap-tile.js';

type TileCoordinates = {
  x: number;
  y: number;
};

export interface TilemapWallTileState {
  impassable?: boolean;
  seeThrough?: boolean;
  impact?: boolean;
  spriteRotation?: number | null;
  spriteMirrorX?: boolean;
  spriteMirrorY?: boolean;
  visibilityStencilReveal?: boolean;
}

export class WorldTilemapManager {
  public worldWidth = 3200;
  public worldHeight = 3200;

  public tileSize = 32;

  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();
  private readonly _wallTiles: Map<string, TilemapWallTile> = new Map();
  private readonly _impassableWallTiles: Map<string, TilemapWallTile> = new Map();
  private readonly _visionBlockingWallTiles: Map<string, TilemapWallTile> = new Map();
  private readonly _impactWallTiles: Map<string, TilemapWallTile> = new Map();
  private readonly _poiTiles: Map<WorldPoiTileType, Map<string, WorldPoiTile>> = new Map();

  private _maxNumberTilesX: number;
  private _maxNumberTilesY: number;

  constructor() {
    this._maxNumberTilesX = Math.floor(this.worldWidth / this.tileSize);
    this._maxNumberTilesY = Math.floor(this.worldHeight / this.tileSize);

    this.initializeBaseTilemap();
  }

  private initializeBaseTilemap(
    type: TilemapTile['type'] = 'ground',
    spriteName: SpriteName = SpriteName.PLOT_TERRAIN,
    spriteSheetName: SpriteSheetName = this._tilemapSpritesheetName,
  ): void {
    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        this._tilemap.set(this.setTilemapKey(x, y), {
          x,
          y,
          spriteName,
          spriteSheetName,
          spriteRotation: null,
          spriteMirrorX: false,
          spriteMirrorY: false,
          spriteVisible: true,
          type,
        });
      }
    }
  }

  public applyWorldMap(worldMap: WorldMapDefinition): void {
    this.tileSize = worldMap.tileSize;
    this.worldWidth = worldMap.width * this.tileSize;
    this.worldHeight = worldMap.height * this.tileSize;
    this._maxNumberTilesX = worldMap.width;
    this._maxNumberTilesY = worldMap.height;

    this._tilemap.clear();
    this._wallTiles.clear();
    this._impassableWallTiles.clear();
    this._visionBlockingWallTiles.clear();
    this._impactWallTiles.clear();
    this._poiTiles.clear();

    this.initializeBaseTilemap(
      "out_of_bounds",
      resolveWorldMapTerrainSpriteName("out_of_bounds"),
      this._tilemapSpritesheetName,
    );

    for (const mapTile of worldMap.tiles) {
      const spriteName = resolveWorldMapTerrainSpriteName(mapTile.type);
      const spriteRotation = resolveWorldMapTerrainSpriteRotation(mapTile.type);

      this._tilemap.set(this.setTilemapKey(mapTile.x, mapTile.y), {
        x: mapTile.x,
        y: mapTile.y,
        spriteName,
        spriteSheetName: this._tilemapSpritesheetName,
        spriteRotation,
        spriteMirrorX: false,
        spriteMirrorY: false,
        spriteVisible: true,
        type: mapTile.type,
      });

      if (isWorldMapTerrainTileSolid(mapTile.type)) {
        this.setImpassableTile(
          mapTile.x,
          mapTile.y,
          spriteName,
          spriteRotation,
          isWorldMapTerrainTileVisibleWall(mapTile.type),
        );
      }
    }

    this.applyPoiTiles(this.getVisibleWallsAsTileCoordinates());
  }

  public refreshPoiTiles(): void {
    this.applyPoiTiles(this.getVisibleWallsAsTileCoordinates());
  }

  public applyPoiTiles(walls: TileCoordinates[]) {
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

  public clearLevelGeometry(): void {
    this._wallTiles.clear();
    this._impassableWallTiles.clear();
    this._visionBlockingWallTiles.clear();
    this._impactWallTiles.clear();
    this._poiTiles.clear();
    this.resetTilemapToGround();
  }

  public setWall(
    x: number,
    y: number,
    spriteName: SpriteName,
    spriteSheetName: SpriteSheetName = this._tilemapSpritesheetName,
    spriteRotation: number | null = null,
    spriteMirrorX = false,
    spriteMirrorY = false,
  ): void {
    this.setWallTile(
      x,
      y,
      spriteName,
      spriteSheetName,
      true,
      spriteRotation,
      true,
      spriteMirrorX,
      spriteMirrorY,
    );
  }

  public setSeeThroughWall(
    x: number,
    y: number,
    spriteName: SpriteName,
    spriteSheetName: SpriteSheetName = this._tilemapSpritesheetName,
    spriteRotation: number | null = null,
    spriteMirrorX = false,
    spriteMirrorY = false,
  ): void {
    this.setWallTile(
      x,
      y,
      spriteName,
      spriteSheetName,
      false,
      spriteRotation,
      true,
      spriteMirrorX,
      spriteMirrorY,
    );
  }

  public setWallTileState(
    x: number,
    y: number,
    state: TilemapWallTileState,
  ): boolean {
    if (!this.isWithinTilemap({ tileX: x, tileY: y })) {
      return false;
    }

    const key = this.setTilemapKey(x, y);
    const wallTile = this._wallTiles.get(key);

    if (!wallTile) {
      return false;
    }

    wallTile.solid = state.impassable ?? wallTile.solid;
    wallTile.blocksVision = state.seeThrough === undefined
      ? wallTile.blocksVision
      : !state.seeThrough;
    wallTile.impact = state.impact ?? wallTile.impact;

    if ("spriteRotation" in state) {
      wallTile.spriteRotation = state.spriteRotation;
    }

    if (state.spriteMirrorX !== undefined) {
      wallTile.spriteMirrorX = state.spriteMirrorX;
    }

    if (state.spriteMirrorY !== undefined) {
      wallTile.spriteMirrorY = state.spriteMirrorY;
    }

    if (state.visibilityStencilReveal !== undefined) {
      wallTile.visibilityStencilReveal = state.visibilityStencilReveal;
    }

    this.syncWallTileStateMaps(key, wallTile);
    this.refreshPoiTiles();

    return true;
  }

  public setBreakableTileRenderEnabled(
    x: number,
    y: number,
    enabled: boolean,
  ): boolean {
    if (!this.isWithinTilemap({ tileX: x, tileY: y })) {
      return false;
    }

    const wallTile = this._wallTiles.get(this.setTilemapKey(x, y));

    if (!wallTile || !this.isBreakableWallSprite(wallTile.spriteName)) {
      return false;
    }

    wallTile.spriteVisible = enabled;
    return true;
  }

  public setWallTileVisibilityStencilRevealEnabled(
    x: number,
    y: number,
    enabled: boolean,
  ): boolean {
    if (!this.isWithinTilemap({ tileX: x, tileY: y })) {
      return false;
    }

    const wallTile = this._wallTiles.get(this.setTilemapKey(x, y));

    if (!wallTile) {
      return false;
    }

    wallTile.visibilityStencilReveal = enabled;
    return true;
  }

  public setAssetTile(
    x: number,
    y: number,
    spriteName: SpriteName,
    spriteSheetName: SpriteSheetName,
    spriteRotation: number | null,
    options: {
      impact: boolean;
      impassable: boolean;
      seeThrough: boolean;
    },
  ): void {
    this.ensureTileBounds(x, y);
    const key = this.setTilemapKey(x, y);
    const wallTile = {
      x,
      y,
      spriteName,
      spriteSheetName,
      spriteRotation,
      spriteMirrorX: false,
      spriteMirrorY: false,
      spriteVisible: true,
      visibilityStencilReveal: false,
      visibilityStencilMasked: true,
      solid: options.impassable,
      blocksVision: !options.seeThrough,
      impact: options.impact,
    };

    this._wallTiles.set(key, wallTile);
    this.syncWallTileStateMaps(key, wallTile);
  }

  private setImpassableTile(
    x: number,
    y: number,
    spriteName: SpriteName,
    spriteRotation: number | null,
    visible: boolean,
  ): void {
    this.ensureTileBounds(x, y);
    const wallTile = {
      x,
      y,
      spriteName,
      spriteSheetName: this._tilemapSpritesheetName,
      spriteRotation,
      spriteMirrorX: false,
      spriteMirrorY: false,
      spriteVisible: true,
      visibilityStencilReveal: true,
      solid: true,
      blocksVision: true,
      impact: true,
    };

    this._impassableWallTiles.set(this.setTilemapKey(x, y), wallTile);
    this._visionBlockingWallTiles.set(this.setTilemapKey(x, y), wallTile);
    this._impactWallTiles.set(this.setTilemapKey(x, y), wallTile);

    if (visible) {
      this._wallTiles.set(this.setTilemapKey(x, y), wallTile);
    }
  }

  private setWallTile(
    x: number,
    y: number,
    spriteName: SpriteName,
    spriteSheetName: SpriteSheetName,
    blocksVision: boolean,
    spriteRotation: number | null,
    impact: boolean,
    spriteMirrorX = false,
    spriteMirrorY = false,
  ): void {
    this.ensureTileBounds(x, y);
    const key = this.setTilemapKey(x, y);
    const wallTile = {
      x,
      y,
      spriteName,
      spriteSheetName,
      spriteRotation,
      spriteMirrorX,
      spriteMirrorY,
      spriteVisible: true,
      visibilityStencilReveal: true,
      solid: true,
      blocksVision,
      impact,
    };

    this._wallTiles.set(key, wallTile);
    this.syncWallTileStateMaps(key, wallTile);
  }

  private syncWallTileStateMaps(key: string, wallTile: TilemapWallTile): void {
    if (wallTile.solid) {
      this._impassableWallTiles.set(key, wallTile);
    } else {
      this._impassableWallTiles.delete(key);
    }

    if (wallTile.blocksVision) {
      this._visionBlockingWallTiles.set(key, wallTile);
    } else {
      this._visionBlockingWallTiles.delete(key);
    }

    if (wallTile.impact) {
      this._impactWallTiles.set(key, wallTile);
    } else {
      this._impactWallTiles.delete(key);
    }
  }

  private getVisibleWallsAsTileCoordinates(): TileCoordinates[] {
    return Array.from(this._wallTiles.values())
      .filter((wallTile) => wallTile.solid)
      .map((wallTile) => ({
        x: wallTile.x,
        y: wallTile.y,
      }));
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
    this.ensureTileBounds(x, y);
    return this._impassableWallTiles.get(this.setTilemapKey(x, y))?.solid ?? false;
  }

  public isVisionBlocked(x: number, y: number): boolean {
    this.ensureTileBounds(x, y);
    return this._visionBlockingWallTiles.has(this.setTilemapKey(x, y));
  }

  public hasTileImpact(x: number, y: number): boolean {
    this.ensureTileBounds(x, y);
    return this._impactWallTiles.has(this.setTilemapKey(x, y));
  }

  public isWithinTilemap(tile : TilemapCoordinates) {
    if(tile.tileX >= this._maxNumberTilesX || tile.tileY >= this._maxNumberTilesY || tile.tileX < 0 || tile.tileY < 0) {
      return false;
    }
      return true;
  }

  public clampCoordinates(tile : TilemapCoordinates) : TilemapCoordinates {
    return {
      tileX : Math.min(Math.max(tile.tileX, 0), this._maxNumberTilesX - 1),
      tileY : Math.min(Math.max(tile.tileY, 0), this._maxNumberTilesY - 1),
    } 
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
    const impassableWallTiles = Array.from(this._impassableWallTiles.keys());
    return {
      maxTilesX : this._maxNumberTilesX,
      maxTilesY : this._maxNumberTilesY,
      impassableTiles : new Set<string>(impassableWallTiles),
      tileSize : this.tileSize
    };
  }


  public setTileType(x: number, y: number, type: TilemapTile['type']): void {
    this.ensureTileBounds(x, y);
    const currentTile = this.getTile(x, y);

    this._tilemap.set(this.setTilemapKey(x, y), {
      ...currentTile,
      spriteName: this.resolveTileSpriteName(type, currentTile.spriteName),
      spriteSheetName: this._tilemapSpritesheetName,
      spriteRotation: this.resolveTileSpriteRotation(type),
      spriteMirrorX: false,
      spriteMirrorY: false,
      spriteVisible: true,
      type,
    });
  }

  public setGroundTile(
    x: number,
    y: number,
    type: TilemapTile['type'],
    spriteName: SpriteName,
    spriteSheetName: SpriteSheetName = this._tilemapSpritesheetName,
    spriteRotation: number | null = null,
    spriteMirrorX = false,
    spriteMirrorY = false,
  ): void {
    this.ensureTileBounds(x, y);
    this._tilemap.set(this.setTilemapKey(x, y), {
      x,
      y,
      spriteName,
      spriteSheetName,
      spriteRotation,
      spriteMirrorX,
      spriteMirrorY,
      spriteVisible: true,
      type,
    });
  }

  public getTileType(x: number, y: number): TilemapTile['type'] {
    return this.getTile(x, y).type;
  }

  public getTileTypeAtWorldPosition(worldX: number, worldY: number): TilemapTile['type'] | null {
    const tile = this.worldToTile(worldX, worldY);

    if (!this.isWithinTilemap(tile)) {
      return null;
    }

    return this.getTileType(tile.tileX, tile.tileY);
  }

  public worldToTile(worldX: number, worldY: number): TilemapCoordinates {
    return {
      tileX: Math.floor(worldX / this.tileSize),
      tileY: Math.floor(worldY / this.tileSize),
    };
  }


  public tileIndexToWorld(tileCoord : number) : number {
    return tileCoord * this.tileSize;
  }

  public tileToWorld(tileX: number, tileY: number, anchorPosition : "topLeft" | "center" = "topLeft"): { worldX: number; worldY: number } {
    
    return {
      worldX: tileX * this.tileSize + (anchorPosition == "center" ? this.tileSize / 2 : 0),
      worldY: tileY * this.tileSize + (anchorPosition == "center" ? this.tileSize / 2 : 0),
    };
  }

  public setTilemapKey(x: number, y: number): string {
    return `${x}_${y}`;
  }

  public getTileFromKey(key : string): TilemapCoordinates | null {
    const splitted = key.split("_");
    if(splitted.length != 2) {
      return null;
    }
    const tileX = Number(splitted[0]);
    const tileY = Number(splitted[1]);
    if(isNaN(tileX) || isNaN(tileY)) {
      return null;
    }
    return {
      tileX : Number(splitted[0]),
      tileY : Number(splitted[1])
    }
  }

  private resetTilemapToGround(): void {
    this._impactWallTiles.clear();

    for (const tile of this._tilemap.values()) {
      tile.spriteName = SpriteName.PLOT_TERRAIN;
      tile.spriteSheetName = this._tilemapSpritesheetName;
      tile.spriteRotation = null;
      tile.spriteMirrorX = false;
      tile.spriteMirrorY = false;
      tile.spriteVisible = true;
      tile.type = 'ground';
    }
  }

  private isBreakableWallSprite(spriteName: SpriteName): boolean {
    return spriteName === SpriteName.DOOR_1 || spriteName === SpriteName.WINDOW;
  }

  private resolveTileSpriteName(type: TilemapTile['type'], fallback: SpriteName): SpriteName {
    if (isWorldMapTerrainTileType(type)) {
      return resolveWorldMapTerrainSpriteName(type);
    }

    if (type === 'ground' || type === 'player_spawn' || type === 'extraction_area') {
      return SpriteName.PLOT_TERRAIN;
    }

    return fallback;
  }

  private resolveTileSpriteRotation(type: TilemapTile['type']): number | null {
    if (isWorldMapTerrainTileType(type)) {
      return resolveWorldMapTerrainSpriteRotation(type);
    }

    return null;
  }

  private ensureTileBounds(x: number, y: number): void {
    if (x < 0 || y < 0 || x >= this._maxNumberTilesX || y >= this._maxNumberTilesY) {
      throw new Error(`Tile out of bounds: (${x}, ${y})`);
    }
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

  public get impassableWallTiles() {
    return this._impassableWallTiles;
  }

  public get visionBlockingWallTiles() {
    return this._visionBlockingWallTiles;
  }

  public get maxNumberTilesY() {
    return this._maxNumberTilesY;
  }

  public get maxNumberTilesX() {
    return this._maxNumberTilesX;
  }


}

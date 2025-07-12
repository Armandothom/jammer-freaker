import { createNoise2D } from 'simplex-noise';
import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { CameraViewport } from './types/camera-viewport.js';
import { TilemapTile } from './types/tilemap-tile.js';
import { SpriteManager } from '../asset-manager/sprite-manager.js';

export class WorldTilemapManager {
  private readonly _maxNumberTilesX = 50;
  private readonly _maxNumberTilesY = 50;
  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();
  private readonly tileSize : number;

  constructor(private spriteManager : SpriteManager) {
    this.generateTilemap();
    this.tileSize = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN).afterRenderSpriteCellSize;
  }

  async generateTilemap() {
    const noise2D = createNoise2D();
    for (let x = 0; x < this._maxNumberTilesX; x++) {
      for (let y = 0; y < this._maxNumberTilesY; y++) {
        const keyCoordinate = this.setTilemapKey(x, y);
        const noiseValue = noise2D(x, y);
        let selectedSpriteName: SpriteName = SpriteName.GRASS_1;
        if (noiseValue <= 0.0) {
          selectedSpriteName = SpriteName.GRASS_1;
        } else if (noiseValue >= 0.0 && noiseValue <= 0.8) {
          selectedSpriteName = SpriteName.GRASS_2;
        } else {
          selectedSpriteName = SpriteName.GRASS_3;
        }
        this._tilemap.set(keyCoordinate, {
          x : x,
          y : y,
          spriteName : selectedSpriteName
        });
      }
    }
  }

  public getTilesInArea(viewport: CameraViewport) {
    let tiles: Array<TilemapTile> = [];
    const leftTileNumberThreshold = viewport.left / this.tileSize;
    const rightTileNumberThreshold = viewport.right / this.tileSize;
    const topTileNumberThreshold = viewport.top / this.tileSize;
    const bottomTileNumberThreshold = viewport.bottom / this.tileSize;
    for (let x = leftTileNumberThreshold; x < rightTileNumberThreshold; x++) {
      for (let y = topTileNumberThreshold; y < bottomTileNumberThreshold; y++) {
        const tile = this.getTile(x, y);
        tiles.push(tile);
      }
    }
    return tiles;
  }

  get worldMaxBoundsTiles() {
    return {
      left: 0,
      top: 0,
      right: this._maxNumberTilesX,
      bottom: this._maxNumberTilesY
    }
  }

  get appliedSpriteSheetName () {
    return this._tilemapSpritesheetName;
  }

  private setTilemapKey(x: number, y: number) {
    return `${x}_${y}`;
  }

  private getTile(x: number, y: number): TilemapTile {
    const key = this.setTilemapKey(x, y);
    const tile = this._tilemap.get(key);
    if (!tile) {
      throw new Error("An error occurred while trying to get a tile")
    }
    return tile;
  }

}
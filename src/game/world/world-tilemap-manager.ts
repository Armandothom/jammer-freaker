import { createNoise2D } from 'simplex-noise';
import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { CameraViewport } from './types/camera-viewport.js';
import { TilemapTile } from './types/tilemap-tile.js';
import { SpriteManager } from '../asset-manager/sprite-manager.js';

export class WorldTilemapManager {
  public _maxNumberTilesX = 50;
  public _maxNumberTilesY = 50;
  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();
  private readonly tileSize: number;

  constructor(private spriteManager: SpriteManager) {
    this.generateTilemap();

    this.tileSize = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN).afterRenderSpriteCellSize;
  }

  async generateTilemap() {
    const noise2D = createNoise2D();
    let noiseValueTreshhold = 0.4;
    let xIncrement: number;
    let yIncrement: number;

    for (let x = 0; x < this._maxNumberTilesX; x++) {

      let xVariance = Math.floor(Math.random()*5);
      let yVariance = Math.floor(Math.random()*5);
      for (let y = 0; y < this._maxNumberTilesY; y++) {
        const keyCoordinate = this.setTilemapKey(x, y);
        let noiseValue = noise2D(x, y);
        let directionX = 2*Math.random() - 1;
        let directionY = 2*Math.random() - 1;
        
        if(noiseValue >= noiseValueTreshhold && directionX > 0){
          //os próximos noises em x tem que entrar aqui e serem alterados para parede
        }

        let selectedSpriteName: SpriteName = SpriteName.METAL_1;

        if (noiseValue < 0.0) {
          selectedSpriteName = SpriteName.METAL_1;
        } else if (noiseValue >= 0.0 && noiseValue < noiseValueTreshhold) {
          selectedSpriteName = SpriteName.METAL_1;
        } else {
          selectedSpriteName = SpriteName.WALL_1;
        }

        this._tilemap.set(keyCoordinate, {
          x: x,
          y: y,
          spriteName: selectedSpriteName
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

  get appliedSpriteSheetName() {
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
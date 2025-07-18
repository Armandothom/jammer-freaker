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
    let noiseValueTreshhold = 0.88;
    const maxWallLength = Math.floor(3*Math.random());
    const minWallLength = 4;
    const maxPositiveNoiseDist = 3;
    const createWallChance = 0.2;
    const offset = 3;

    let noiseValue: number[][] = [];
    const aboveTreshholdCoords: { x: number, y: number }[] = [];

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      noiseValue[y] = [];
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        noiseValue[y][x] = noise2D(x, y);

        if (x == 0 || y == 0 || x == this._maxNumberTilesX - 1 || y == this._maxNumberTilesY - 1 || x == 1 || y == 1) {
          noiseValue[y][x] = 0;
        }

        if (noiseValue[y][x] >= noiseValueTreshhold) {
          aboveTreshholdCoords.push({ x, y });
        }
      }
    }

    const coordMap = new Map<string, boolean>();
    for (const { x, y } of aboveTreshholdCoords) {
      const key = this.setTilemapKey(x, y);
      coordMap.set(key, true);
    }

    for (const { x, y } of aboveTreshholdCoords) {
      for (let dx = -maxPositiveNoiseDist; dx <= maxPositiveNoiseDist; dx++) {
        for (let dy = -maxPositiveNoiseDist; dy <= maxPositiveNoiseDist; dy++) {
          if (dx == 0 && dy == 0) continue;
          const xIncrement = x + dx;
          const yIncrement = y + dy;
          const generatedKey = `${xIncrement},${yIncrement}`;

          if (coordMap.has(generatedKey)) {
            noiseValue[y][x] = 0;
            dx = 999;
            dy = 999; // Hack for breaking the loop
          }
        }
      }
    }

    //Noise treatment
    for (const { x, y } of aboveTreshholdCoords) {

      const randomDirection = { x: 2 * Math.random() - 1, y: 2 * Math.random() - 1 }
      const randomWallLength = { x: maxWallLength + minWallLength, y: maxWallLength + minWallLength }

      if (Math.random() > createWallChance) {
        if (randomDirection.x >= 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.x; n++) {
            const nextX = x + n
            if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.x - offset) {
            for (let n = 0; n < randomWallLength.x; n++) {
              const nextX = x + n;
              if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < noiseValueTreshhold) {
                noiseValue[y][nextX] = noiseValueTreshhold;
              }
            }
          }
        }

        if (randomDirection.x < 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.x; n++) {
            const nextX = x - n;
            if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.x - offset) {
            for (let n = 0; n < randomWallLength.x; n++) {
              const nextX = x - n;
              if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < noiseValueTreshhold) {
                noiseValue[y][nextX] = noiseValueTreshhold;
              }
            }
          }
        }

        if (randomDirection.y >= 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.y; n++) {
            const nextY = y + n;
            if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.y - offset) {
            for (let n = 0; n < randomWallLength.y; n++) {
              const nextY = y + n
              if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < noiseValueTreshhold) {
                noiseValue[nextY][x] = noiseValueTreshhold;
              }
            }
          }
        }

        if (randomDirection.y < 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.y; n++) {
            const nextY = y - n;
            if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.y - offset) {
            for (let n = 0; n < randomWallLength.y; n++) {
              const nextY = y - n
              if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < noiseValueTreshhold) {
                noiseValue[nextY][x] = noiseValueTreshhold;
              }
            }
          }
        }
      } else noiseValue[y][x] = 0;
    }

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        const keyCoordinate = this.setTilemapKey(x, y);
        //let noiseValue = noise2D(x, y);

        let selectedSpriteName: SpriteName = SpriteName.METAL_1;
        if (noiseValue[y][x] < 0.0) {
          selectedSpriteName = SpriteName.METAL_1;
        } else if (noiseValue[y][x] >= 0.0 && noiseValue[y][x] < noiseValueTreshhold) {
          selectedSpriteName = SpriteName.METAL_1;
        } else {
          selectedSpriteName = SpriteName.WALL_1;
        }

        this._tilemap.set(keyCoordinate, {
          y: y,
          x: x,
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
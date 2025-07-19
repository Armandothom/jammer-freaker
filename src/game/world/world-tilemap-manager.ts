import { createNoise2D } from 'simplex-noise';
import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { CameraViewport } from './types/camera-viewport.js';
import { TilemapTile } from './types/tilemap-tile.js';
import { SpriteManager } from '../asset-manager/sprite-manager.js';

export class WorldTilemapManager {
  public _maxNumberTilesX = 8;
  public _maxNumberTilesY = 8;
  public _generatedWalls: { x: number, y: number }[] = []
  private readonly noiseValueTreshhold = 0.88;
  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();
  private readonly tileSize: number;

  constructor(
    private spriteManager: SpriteManager,
  ) {
    this.generateTilemap();

    this.tileSize = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN).afterRenderSpriteCellSize;
  }

  async generateTilemap() {

    const noiseValue = this.wallGeneration();

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        const keyCoordinate = this.setTilemapKey(x, y);
        //let noiseValue = noise2D(x, y);

        let selectedSpriteName: SpriteName = SpriteName.METAL_1;
        if (noiseValue[y][x] < 0.0) {
          selectedSpriteName = SpriteName.METAL_1;
        } else if (noiseValue[y][x] >= 0.0 && noiseValue[y][x] < this.noiseValueTreshhold) {
          selectedSpriteName = SpriteName.METAL_1;
        } else {
          selectedSpriteName = SpriteName.WALL_1;
        }

        this._tilemap.set(keyCoordinate, {
          y: y,
          x: x,
          spriteName: selectedSpriteName,
        });
        
      }
    }
    console.log("tileMap generated");
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

  private wallGeneration(): number[][] {
    const noise2D = createNoise2D();
    const maxWallLength = Math.floor(3 * Math.random());
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

        if (noiseValue[y][x] >= this.noiseValueTreshhold) {
          aboveTreshholdCoords.push({ x, y });
        }
      }
    }

    const coordMap = new Map<string, boolean>();
    for (const { x, y } of aboveTreshholdCoords) {
      const key = this.setTilemapKey(x, y);
      coordMap.set(key, true);
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
            if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < this.noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.x - offset) {
            for (let n = 0; n < randomWallLength.x; n++) {
              const nextX = x + n;
              if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < this.noiseValueTreshhold) {
                noiseValue[y][nextX] = this.noiseValueTreshhold;
              }
            }
          }
        }

        if (randomDirection.x < 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.x; n++) {
            const nextX = x - n;
            if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < this.noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.x - offset) {
            for (let n = 0; n < randomWallLength.x; n++) {
              const nextX = x - n;
              if (nextX >= 0 && nextX < this._maxNumberTilesX && noiseValue[y][nextX] < this.noiseValueTreshhold) {
                noiseValue[y][nextX] = this.noiseValueTreshhold;
              }
            }
          }
        }

        if (randomDirection.y >= 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.y; n++) {
            const nextY = y + n;
            if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < this.noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.y - offset) {
            for (let n = 0; n < randomWallLength.y; n++) {
              const nextY = y + n
              if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < this.noiseValueTreshhold) {
                noiseValue[nextY][x] = this.noiseValueTreshhold;
              }
            }
          }
        }

        if (randomDirection.y < 0) {
          let sucessCount = 0;

          for (let n = 0; n < randomWallLength.y; n++) {
            const nextY = y - n;
            if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < this.noiseValueTreshhold) {
              sucessCount++;
            }
          }

          if (sucessCount >= randomWallLength.y - offset) {
            for (let n = 0; n < randomWallLength.y; n++) {
              const nextY = y - n
              if (nextY >= 0 && nextY < this._maxNumberTilesY && noiseValue[nextY][x] < this.noiseValueTreshhold) {
                noiseValue[nextY][x] = this.noiseValueTreshhold;
              }
            }
          }
        }
      } else noiseValue[y][x] = 0;
    }

    //badMap check

    const generatedWalls: { x: number, y: number }[] = [];
    const badWall: { x: number, y: number }[] = [];

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        if (noiseValue[y][x] >= this.noiseValueTreshhold) {
          generatedWalls.push({ x, y });
        }
      }
    }

    const wallMap = new Map<string, boolean>();
    for (const { x, y } of generatedWalls) {
      const key = this.setTilemapKey(x, y);
      wallMap.set(key, true);
    }

    let wallCheck = 0;

    for (const { x, y } of generatedWalls) {
      wallCheck = 0;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx == 0 && dy == 0) continue;
          const xIncrement = x + dx;
          const yIncrement = y + dy;
          const generatedKey = this.setTilemapKey(xIncrement, yIncrement);

          if (wallMap.has(generatedKey)) {
            wallCheck++;
          }
        }
      }
      if (wallCheck >= 5) {
        badWall.push({ x, y });
      }
    }

    for (const { x, y } of badWall) {
      for (let dx = -5; dx <= 5; dx++) {
        const xIncrement = x + dx;
        const generatedKey = this.setTilemapKey(xIncrement, y);

        if (wallMap.has(generatedKey)) {
          noiseValue[y][x] = 0;
        }
      }
      for (let dy = -5; dy <= 5; dy++) {
        const yIncrement = y + dy;
        const generatedKey = this.setTilemapKey(x, yIncrement);

        if (wallMap.has(generatedKey)) {
          noiseValue[y][x] = 0;
        }
      }
    }

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        if (noiseValue[y][x] >= this.noiseValueTreshhold) {
          this._generatedWalls.push({ x, y });
        }
      }
    }

    return noiseValue;
  }
}
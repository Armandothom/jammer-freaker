import { createNoise2D } from 'simplex-noise';
import { SpriteSheetName } from '../asset-manager/types/sprite-sheet-name.enum.js';
import { SpriteName } from './types/sprite-name.enum.js';
import { CameraViewport } from './types/camera-viewport.js';
import { TilemapTile } from './types/tilemap-tile.js';
import { SpriteManager } from '../asset-manager/sprite-manager.js';

export class WorldTilemapManager {
  public _maxNumberTilesX: number;
  public _maxNumberTilesY: number;
  public generatedWalls: { x: number, y: number }[] = []
  public validSpawnTile: { x: number, y: number }[] = []
  public tileSize: number;
  private readonly noiseValueThreshold = 0.89;
  private readonly _tilemapSpritesheetName = SpriteSheetName.TERRAIN;
  private readonly _tilemap: Map<string, TilemapTile> = new Map();

  constructor(
    private spriteManager: SpriteManager,
  ) {
    this.tileSize = this.spriteManager.getSpriteProperties(SpriteName.METAL_1, SpriteSheetName.TERRAIN).sprite.originalRenderSpriteHeight;
    this._maxNumberTilesX = 10;
    this._maxNumberTilesY = 10;
    this.generateTilemap();
  }

  async generateTilemap() {
    const noiseValue = this.wallGeneration();

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        const keyCoordinate = this.setTilemapKey(x, y);

        let selectedSpriteName: SpriteName = SpriteName.METAL_1;
        if (noiseValue[y][x] < 0.0) {
          selectedSpriteName = SpriteName.METAL_1;
        } else if (noiseValue[y][x] >= 0.0 && noiseValue[y][x] < this.noiseValueThreshold) {
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
    const rightTileNumberThreshold = (viewport.right / this.tileSize) / 2;
    const topTileNumberThreshold = viewport.top / this.tileSize;
    const bottomTileNumberThreshold = (viewport.bottom / this.tileSize) / 2;
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
    const noise2D_sector1 = createNoise2D();
    const noise2D_sector2 = createNoise2D();
    const noise2D_sector3 = createNoise2D();
    const noise2D_sector4 = createNoise2D();
    const noise2D_centralSector = createNoise2D();
    let nodeInSectorCount: number[] = [0, 0, 0, 0];
    this.generatedWalls = [];

    let sectorSizeX = this._maxNumberTilesX / 2;
    let sectorSizeY = this._maxNumberTilesY / 2;
    let rightBoundary = this._maxNumberTilesX;
    let bottomBoundary = this._maxNumberTilesY;
    if (this._maxNumberTilesX !== 10) {
      // we have to do this due to the imprecision of tileProgressionFactor and zoom progression factor
      // only in 10, 20, 40, 80 ... we have a integer between the canvas and the sprite size
      if (this._maxNumberTilesY === 14) {
        rightBoundary -= 2;
        bottomBoundary -= 2;
      }
      if (this._maxNumberTilesY === 18) {
        rightBoundary -= 6;
        bottomBoundary -= 6;
      }
      if (this._maxNumberTilesY === 22) {
        rightBoundary -= 8;
        bottomBoundary -= 8;
      }
      if (this._maxNumberTilesY === 26) {
        rightBoundary -= 10;
        bottomBoundary -= 10;
      }
      if (this._maxNumberTilesY === 30) {
        rightBoundary -= 11;
        bottomBoundary -= 11;
      }
      if (this._maxNumberTilesY === 34) {
        rightBoundary -= 12;
        bottomBoundary -= 12;
      }
      if (this._maxNumberTilesY === 38) {
        rightBoundary -= 10;
        bottomBoundary -= 10;
      }
      if (this._maxNumberTilesY === 42) {
        rightBoundary -= 3;
        bottomBoundary -= 3;
      }

      sectorSizeX = Math.floor(rightBoundary / 2);
      sectorSizeY = Math.floor(bottomBoundary / 2);
    }

    const wallLengthX = Math.floor((3 / 5) * sectorSizeX);
    const wallLengthY = Math.floor((3 / 5) * sectorSizeY);

    let noiseValue: number[][] = [];
    const aboveTreshholdCoords: { x: number, y: number }[] = [];

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      noiseValue[y] = [];
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        if (x < sectorSizeX && y < sectorSizeY && x !== 0 && y !== 0) {
          //sector 1
          noiseValue[y][x] = noise2D_sector1(x, y);
          if (noiseValue[y][x] >= this.noiseValueThreshold) nodeInSectorCount[0] += 1;
        }
        if (x > sectorSizeX && y < sectorSizeY && x !== (rightBoundary - 1) && y !== 0) {
          //sector 2
          noiseValue[y][x] = noise2D_sector2(x, y);
          if (noiseValue[y][x] >= this.noiseValueThreshold) nodeInSectorCount[1] += 1;
        }
        if (x < sectorSizeX && y > sectorSizeY && x !== 0 && y !== (bottomBoundary - 1)) {
          //sector 3
          noiseValue[y][x] = noise2D_sector3(x, y);
          if (noiseValue[y][x] >= this.noiseValueThreshold) nodeInSectorCount[2] += 1;
        }
        if (x > sectorSizeX && y > sectorSizeY) {
          //sector 4
          noiseValue[y][x] = noise2D_sector4(x, y);
          if (noiseValue[y][x] >= this.noiseValueThreshold) nodeInSectorCount[3] += 1;
        }
        if (x == sectorSizeX || y == sectorSizeY) {
          //central sector --> Cross
          noiseValue[y][x] = noise2D_centralSector(x, y);
        }
        if (x == 0 || y == 0 || x == (rightBoundary - 1) || y == (bottomBoundary - 1) || x == rightBoundary || y == bottomBoundary) {
          noiseValue[y][x] = 0;
        }
      }
    }

    //The next section is useful in the early game
    if (nodeInSectorCount[0] == 0) {
      const rand = Math.random();
      if (rand > 0.2) {
        let xRandom = Math.floor(Math.random() * sectorSizeX);
        let yRandom = Math.floor(Math.random() * sectorSizeY);
        if (xRandom == 0) xRandom++;
        if (yRandom == 0) yRandom++;

        noiseValue[yRandom][xRandom] = this.noiseValueThreshold;
      }
    }
    if (nodeInSectorCount[1] == 0) {
      const rand = Math.random();
      if (rand > 0.2) {
        let xRandom = Math.floor(Math.random() * sectorSizeX) + sectorSizeX;
        let yRandom = Math.floor(Math.random() * sectorSizeY);
        if (xRandom == rightBoundary - 1) xRandom--;
        if (yRandom == 0) yRandom++;
        noiseValue[yRandom][xRandom] = this.noiseValueThreshold;
      }
    }
    if (nodeInSectorCount[2] == 0) {
      const rand = Math.random();
      if (rand > 0.2) {
        let xRandom = Math.floor(Math.random() * sectorSizeX);
        let yRandom = Math.floor(Math.random() * sectorSizeY) + sectorSizeY;
        if (xRandom == 0) xRandom++;
        if (yRandom == bottomBoundary - 1) yRandom--;
        noiseValue[yRandom][xRandom] = this.noiseValueThreshold;
      }
    }
    if (nodeInSectorCount[3] == 0) {
      const rand = Math.random();
      if (rand > 0.2) {
        let xRandom = Math.floor(Math.random() * sectorSizeX) + sectorSizeX;
        let yRandom = Math.floor(Math.random() * sectorSizeY) + sectorSizeY;
        if (xRandom == rightBoundary - 1) xRandom--;
        if (yRandom == bottomBoundary - 1) yRandom--;
        noiseValue[yRandom][xRandom] = this.noiseValueThreshold;
      }
    }

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        if (noiseValue[y][x] >= this.noiseValueThreshold) {
          aboveTreshholdCoords.push({ x, y });
        }
      }
    }

    //Noise manip
    const wallNodeMap: Map<number, Array<[number, number]>> = new Map();
    let nodeId: number = 0;
    for (const { x, y } of aboveTreshholdCoords) {
      const wallDirection = this.wallDirectionCheck(x, y, sectorSizeX, sectorSizeY);
      nodeId++;
      this.drawWallSegment(wallDirection, x, y, wallLengthX, wallLengthY, noiseValue, wallNodeMap, nodeId, rightBoundary, bottomBoundary);
    }


    const manipulatedTreshholdCoords: { x: number, y: number }[] = [];
    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        if (noiseValue[y][x] >= this.noiseValueThreshold) {
          manipulatedTreshholdCoords.push({ x, y });
        }
      }
    }

    this.interactAcrossNodes(
      manipulatedTreshholdCoords, wallNodeMap,
      (a, b, nodeA, nodeB) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= Math.sqrt(10)) {
          noiseValue[b.y][b.x] = 0;
        }
      }
    )

    //clear player SpawnPoint
    const playerSpawn = { x: 1, y: this._maxNumberTilesY / 2 };
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        noiseValue[playerSpawn.y + j][playerSpawn.x + i] = 0;
      }
    }

    for (let y = 0; y < this._maxNumberTilesY; y++) {
      for (let x = 0; x < this._maxNumberTilesX; x++) {
        if (noiseValue[y][x] >= this.noiseValueThreshold) {
          this.generatedWalls.push({ x, y });
        } else {
          this.validSpawnTile.push({ x, y });
        }
      }
    }

    return noiseValue;
  }

  wallDirectionCheck(x: number, y: number, sectorSizeX: number, sectorSizeY: number): { x: number, y: number } {
    let wallDirectionX: number = 0;
    let wallDirectionY: number = 0;

    if (x >= sectorSizeX) x -= sectorSizeX;
    if (y >= sectorSizeY) y -= sectorSizeY;

    //check for center?
    if (x <= sectorSizeX / 2) {
      wallDirectionX = 1;
    }
    if (x > sectorSizeX / 2 && x < sectorSizeX) {
      wallDirectionX = -1;
    }

    if (y <= sectorSizeY / 2) {
      wallDirectionY = 1;
    }
    if (y > sectorSizeY / 2 && y < sectorSizeY) {
      wallDirectionY = -1;
    }

    return { x: wallDirectionX, y: wallDirectionY };
  }

  drawWallSegment(
    direction: { x: number; y: number },
    x: number,
    y: number,
    lengthX: number,
    lengthY: number,
    noiseValue: number[][],
    wallNodeMap: Map<number, Array<[number, number]>>,
    nodeId: number,
    rightBoundary: number,
    bottomBoundary: number,
  ) {

    if (!wallNodeMap.has(nodeId)) {
      wallNodeMap.set(nodeId, []);
    }

    if (direction.x !== 0) {
      const step = direction.x;
      for (let n = 0; n < lengthX; n++) {
        const nextX = x + n * step;
        if (nextX <= 0 || nextX >= rightBoundary - 1) continue;
        noiseValue[y][nextX] = this.noiseValueThreshold;
        wallNodeMap.get(nodeId)!.push([y, nextX]);
      }
    }

    if (direction.y !== 0) {
      const step = direction.y;
      for (let n = 0; n < lengthY; n++) {
        const nextY = y + n * step;
        if (nextY <= 0 || nextY >= bottomBoundary - 1) continue;
        noiseValue[nextY][x] = this.noiseValueThreshold;
        wallNodeMap.get(nodeId)!.push([nextY, x]);
      }
    }
  }

  interactAcrossNodes(
    manipulatedTreshholdCoords: { x: number, y: number }[],
    wallNodeMap: Map<number, Array<[number, number]>>,
    callback: (
      a: { x: number, y: number },
      b: { x: number, y: number },
      nodeA: number,
      nodeB: number,
    ) => void
  ) {
    const coordToNode = new Map<string, number>();
    for (const [nodeId, coords] of wallNodeMap.entries()) {
      for (const [y, x] of coords) {
        coordToNode.set(`${x},${y}`, nodeId);
      }
    }

    const nodes: Map<number, { x: number, y: number }[]> = new Map();
    for (const { x, y } of manipulatedTreshholdCoords) {
      const nodeId = coordToNode.get(`${x},${y}`);
      if (nodeId === undefined) continue;

      if (!nodes.has(nodeId)) {
        nodes.set(nodeId, []);
      }
      nodes.get(nodeId)!.push({ x, y });
    }

    const nodeIds = [...nodes.keys()];

    // Interacts with different nodes
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const idA = nodeIds[i];
        const idB = nodeIds[j];
        const coordsA = nodes.get(idA)!;
        const coordsB = nodes.get(idB)!;

        for (const a of coordsA) {
          for (const b of coordsB) {
            callback(a, b, idA, idB);
          }
        }
      }
    }
  }
}
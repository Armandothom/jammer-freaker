import { CameraManager } from './camera-manager.js';
import { CoordinateStringfied, TilemapWallTile, WorldMapCoordinates, WorldMapTileCoordinates } from './types/tilemap-tile.js';
import { WorldTilemapManager } from './world-tilemap-manager.js';

export class WorldImpassableChunkManager {
  private _chunkWidthSize : number;
  private _chunkHeightSize : number;
  private readonly _chunkCount : number = 64;
  private _chunks = new Map<CoordinateStringfied, Array<WorldMapTileCoordinates>>();

  constructor(
    private worldTilemapManager : WorldTilemapManager,
    private cameraManager : CameraManager) {
      this._chunkWidthSize = this.worldTilemapManager.worldWidth / this._chunkCount;
      this._chunkHeightSize = this.worldTilemapManager.worldHeight / this._chunkCount;
  }

  public generateChunks() {
    const impassableWallTiles = Array.from(this.worldTilemapManager.impassableWallTiles.values());
    this._chunks = new Map();
    for (let x = 0; x < this.worldTilemapManager.worldWidth; x += this._chunkWidthSize) {
      for (let y = 0; y < this.worldTilemapManager.worldHeight; y += this._chunkHeightSize) {
        const {xIndex, yIndex} = this.getChunkCoordinates({x, y});
        this._chunks.set(this.setKeyCoordinateChunk(xIndex, yIndex), []);
      }
    }
    for (const impassableWallTile of impassableWallTiles) {
      const tileBorderPoints = this.getTileBorderPoints(impassableWallTile);
      const points = [tileBorderPoints.bottomLeft, tileBorderPoints.bottomRight, tileBorderPoints.topLeft, tileBorderPoints.topRight];
      for (const tileBorderPoint of points) {
        const {xIndex, yIndex} = this.getChunkCoordinates({x : tileBorderPoint.x, y : tileBorderPoint.y});
        const keyCoordinates = this.setKeyCoordinateChunk(xIndex, yIndex);
        const mappedChunk = this._chunks.get(keyCoordinates);
        if(mappedChunk) {
          mappedChunk.push(tileBorderPoints);
        }
      }
    }
  }

  public getImpassableTileCoordsChunk() {
    const tileCoordinates : Array<WorldMapTileCoordinates> = [];
    const viewPort = this.cameraManager.getViewport();
    const indexStart = this.getChunkCoordinates({x : viewPort.left, y: viewPort.top});
    const indexEnd = this.getChunkCoordinates({x : viewPort.right, y: viewPort.bottom});
    for (let x = indexStart.xIndex; x <= indexEnd.xIndex; x++) {
      for (let y = indexStart.yIndex; y <= indexEnd.yIndex; y++) {
        const indexTileCoordinates = this._chunks.get(this.setKeyCoordinateChunk(x, y));
        if(indexTileCoordinates) {
          tileCoordinates.push(...indexTileCoordinates);;
        }
      }
    }
    return tileCoordinates;
  }

  private setKeyCoordinateChunk(x : number, y : number) : CoordinateStringfied {
    return `${x}_${y}`
  }

  private getChunkCoordinates(coordinates: WorldMapCoordinates) {
    const { x, y } = coordinates;
    const xIndex = this.clampIndex(Math.floor(x / this._chunkWidthSize));
    const yIndex = this.clampIndex(Math.floor(y / this._chunkHeightSize));
    return {
      xIndex,
      yIndex
    }
  }

  private clampIndex(value: number): number {
    return Math.max(0, Math.min(value, this._chunkCount - 1));
  }

  private getTileBorderPoints(tile : TilemapWallTile) : WorldMapTileCoordinates {
    const tileBoundary = this.worldTilemapManager.tileSize - 1;
    const tileWorldCoords = this.worldTilemapManager.tileToWorld(tile.x, tile.y);
    return {
      topLeft : {
        x : tileWorldCoords.worldX,
        y : tileWorldCoords.worldY
      },
      topRight : {
        x : tileWorldCoords.worldX + tileBoundary,
        y : tileWorldCoords.worldY
      },
      bottomLeft : {
        x : tileWorldCoords.worldX,
        y : tileWorldCoords.worldY + tileBoundary
      },
      bottomRight : {
        x : tileWorldCoords.worldX + tileBoundary,
        y : tileWorldCoords.worldY + tileBoundary
      },
    }
    
  }

}

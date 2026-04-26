import { CameraManager } from './camera-manager.js';
import { CoordinateStringfied, WorldMapCoordinates } from './types/tilemap-tile.js';
import { WorldEdgeManager } from './world-edge-manager.js';
import { WorldTilemapManager } from './world-tilemap-manager.js';

export class WorldEdgeChunkManager {
  private _chunkWidthSize : number;
  private _chunkHeightSize : number;
  private readonly _chunkCount : number = 64;
  private _chunks = new Map<CoordinateStringfied, Array<WorldMapCoordinates>>();

  constructor(
    private worldTilemapManager : WorldTilemapManager,
    private cameraManager : CameraManager,
    private worldEdgeManager : WorldEdgeManager) {
      this._chunkWidthSize = this.worldTilemapManager.worldWidth / this._chunkCount;
      this._chunkHeightSize = this.worldTilemapManager.worldHeight / this._chunkCount;
  }

  public generateChunks() {
    const edges = this.worldEdgeManager.verticesPositionWallEdge;
    this._chunks = new Map();
    for (let x = 0; x < this.worldTilemapManager.worldWidth; x += this._chunkWidthSize) {
      for (let y = 0; y < this.worldTilemapManager.worldHeight; y += this._chunkHeightSize) {
        const {xIndex, yIndex} = this.getChunkCoordinates({x, y});
        this._chunks.set(this.setKeyCoordinateChunk(xIndex, yIndex), []);
      }
    }
    for (const edge of edges) {
      const {xIndex, yIndex} = this.getChunkCoordinates({x : edge.x, y : edge.y});
      const keyCoordinates = this.setKeyCoordinateChunk(xIndex, yIndex);
      const mappedChunk = this._chunks.get(keyCoordinates);
      if(mappedChunk) {
        mappedChunk.push(edge);
      }
    }
  }

  public getEdgesFromCameraView() {
    const edges : Array<WorldMapCoordinates> = [];
    const viewPort = this.cameraManager.getViewport();
    //We set the corners of the screen as edges also
    edges.push(...[
      {
        x : viewPort.left,
        y : viewPort.top
      },
      {
        x : viewPort.left,
        y : viewPort.bottom
      },
      {
        x : viewPort.right,
        y : viewPort.top
      },
      {
        x : viewPort.right,
        y : viewPort.bottom
      },
    ]);
    const indexStart = this.getChunkCoordinates({x : viewPort.left, y: viewPort.top});
    const indexEnd = this.getChunkCoordinates({x : viewPort.right, y: viewPort.bottom});
    for (let x = indexStart.xIndex; x <= indexEnd.xIndex; x++) {
      for (let y = indexStart.yIndex; y <= indexEnd.yIndex; y++) {
        const indexEdges = this._chunks.get(this.setKeyCoordinateChunk(x, y));
        if(indexEdges) {
          edges.push(...indexEdges);;
        }
      }
    }
    return edges;
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

}

import { SpriteManager } from "../asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../asset-manager/types/sprite-sheet-name.enum.js";
import { CameraViewport } from "./types/camera-viewport.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class CameraManager {
  public viewportXAxisTiles: number;
  public viewportYAxisTiles: number;
  public tileSize: number;
  coordinateX: number = 0;
  coordinateY: number = 0;

  constructor(private tilemapManager: WorldTilemapManager, private spriteManager: SpriteManager) {

    this.tilemapManager = tilemapManager;
    this.tileSize = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.TERRAIN).originalRenderSpriteHeight;

    this.viewportXAxisTiles = 10;
    this.viewportYAxisTiles = 10;
    this.setInitialPosition();
  }

  public getViewport(): CameraViewport {
    //console.log("cameraManager", this.tileSize, this.viewportXAxisTiles, this.viewportYAxisTiles);
    this.coordinateX = this.viewportXAxisTiles / 2;
    this.coordinateY = this.viewportYAxisTiles / 2;
    return this.calcViewport(this.coordinateX, this.coordinateY);
  }

  public moveCamera(x: number, y: number) {
    const bounds = this.tilemapManager.worldMaxBoundsTiles;
    const newViewport = this.calcViewport(x, y);
    //If it is out of bounds, we don't move the camera.
    if (newViewport.bottom > bounds.bottom || newViewport.right > bounds.right ||
      newViewport.top < bounds.top || newViewport.left < bounds.left) {
      return;
    }
    this.coordinateX = x;
    this.coordinateY = y;
  }

  private calcViewport(x: number, y: number): CameraViewport {
    const halfH = this.viewportYAxisTiles / 2;
    const halfW = this.viewportXAxisTiles / 2;
    const left = (x - halfW) * this.tileSize;
    const right = (x + halfW) * this.tileSize;
    const top = (y - halfH) * this.tileSize;
    const bottom = (y + halfH) * this.tileSize;
    return {
      left,
      right,
      top,
      bottom
    }
  }

  private setInitialPosition() {
    this.coordinateX = this.viewportXAxisTiles / 2;
    this.coordinateY = this.viewportYAxisTiles / 2;
  }
}
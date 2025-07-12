import { CameraViewport } from "./types/camera-viewport.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class CameraManager {
  private viewportYAxisTiles : number = 50;
  private viewportXAxisTiles: number = 50;
  private tilemapManager : WorldTilemapManager;
  coordinateX : number = 0;
  coordinateY : number = 0;
  constructor(tilemapManager : WorldTilemapManager) {
    this.tilemapManager = tilemapManager;
    this.setInitialPosition();
  }

  public getViewport() : CameraViewport {
    return this.calcViewport(this.coordinateX, this.coordinateY);
  }

  public moveCamera(x : number, y : number) {
    const bounds = this.tilemapManager.worldMaxBoundsTiles;
    const newViewport = this.calcViewport(x, y);
    //If it is out of bounds, we don't move the camera.
    if(newViewport.bottom > bounds.bottom || newViewport.right > bounds.right ||
       newViewport.top < bounds.top || newViewport.left < bounds.left) {
        return;
    }
    this.coordinateX = x;
    this.coordinateY = y;
  }

  private calcViewport(x : number, y : number) : CameraViewport {
    const halfW = this.viewportYAxisTiles / 2;
    const halfH = this.viewportXAxisTiles / 2;
    const left = x - halfW;
    const right = x + halfW;
    const top = y - halfH;
    const bottom = y + halfH;
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
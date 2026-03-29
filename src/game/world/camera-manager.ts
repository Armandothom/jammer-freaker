import { CameraViewport } from "./types/camera-viewport.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class CameraManager {
  private cameraX = 0;
  private cameraY = 0;

  private viewportWidth: number;
  private viewportHeight: number;

  constructor(private worldTilemapManager: WorldTilemapManager) {
    const canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;

    this.viewportWidth = canvas.width;
    this.viewportHeight = canvas.height;
  }

  follow(worldX: number, worldY: number) {
    this.cameraX = worldX;
    this.cameraY = worldY;
  }

  getViewport(): CameraViewport {
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;

    return {
      left: this.cameraX - halfW,
      right: this.cameraX + halfW,
      top: this.cameraY - halfH,
      bottom: this.cameraY + halfH,
    };
  }

  isWithinViewport(xStart : number, xEnd : number, yStart : number, yEnd : number) {
    const viewport= this.getViewport();
    return xStart >= viewport.left &&
        xEnd <= viewport.right &&
        yStart >= viewport.top &&
        yEnd <= viewport.bottom;
  }

  screenToWorld(
    screenX: number,
    screenY: number,
    displayWidth: number = this.viewportWidth,
    displayHeight: number = this.viewportHeight,
  ): { x: number; y: number } {
    const viewport = this.getViewport();
    const normalizedX = displayWidth > 0 ? screenX / displayWidth : 0;
    const normalizedY = displayHeight > 0 ? screenY / displayHeight : 0;

    return {
      x: viewport.left + normalizedX * this.viewportWidth,
      y: viewport.top + normalizedY * this.viewportHeight,
    };
  }
}

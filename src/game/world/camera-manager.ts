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
}
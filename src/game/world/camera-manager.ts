import { CameraViewport } from "./types/camera-viewport.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class CameraManager {
  private cameraX = 0;
  private cameraY = 0;

  readonly viewportWidth = 800;
  readonly viewportHeight = 600;

  constructor(private worldTilemapManager: WorldTilemapManager) { }

  follow(worldX: number, worldY: number) {
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;

    this.cameraX = Math.max(
      halfW,
      Math.min(worldX, this.worldTilemapManager.worldWidth - halfW)
    );

    this.cameraY = Math.max(
      halfH,
      Math.min(worldY, this.worldTilemapManager.worldHeight - halfH)
    );
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
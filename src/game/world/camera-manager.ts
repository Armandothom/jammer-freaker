import { CameraViewport } from "./types/camera-viewport.js";
import { OutsideBondsSide } from "./types/camera.type.js";
import { WorldMapCoordinates } from "./types/tilemap-tile.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class CameraManager {
  private cameraX = 0;
  private cameraY = 0;
  private _canvas : HTMLCanvasElement;
  private viewportWidth: number;
  private viewportHeight: number;

  constructor(private worldTilemapManager: WorldTilemapManager) {
    this._canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;

    this.viewportWidth = this._canvas.width;
    this.viewportHeight = this._canvas.height;
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
    const viewport = this.getViewport();
    return xStart >= viewport.left &&
        xEnd <= viewport.right &&
        yStart >= viewport.top &&
        yEnd <= viewport.bottom;
  }

  isSideOutsideViewport(position: WorldMapCoordinates): OutsideBondsSide {
    const viewport = this.getViewport();
    let outsideBoundsCheck: OutsideBondsSide = {
      xAxis: null,
      yAxis: null,
      xDiff : 0,
      yDiff : 0
    }
    if (position.x < viewport.left) {
      outsideBoundsCheck.xAxis = "left";
      outsideBoundsCheck.xDiff = Math.abs(position.x - viewport.left);
    } else if (position.x > viewport.right) {
      outsideBoundsCheck.xAxis = "right";
      outsideBoundsCheck.xDiff = Math.abs(position.x - viewport.right);
    }
    if (position.y < viewport.top) {
      outsideBoundsCheck.yAxis = "top";
      outsideBoundsCheck.yDiff = Math.abs(position.y - viewport.top);
    } else if (position.y > viewport.bottom) {
      outsideBoundsCheck.yAxis = "bottom";
      outsideBoundsCheck.yDiff = Math.abs(position.y - viewport.bottom);
    }
    return outsideBoundsCheck;
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

  worldToScreen(x: number, y: number) {
    const viewport = this.getViewport();
    return {
      x: Math.max(0, x - viewport.left),
      y: Math.max(0, y - viewport.top)
    }
  }
}

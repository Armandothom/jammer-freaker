import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { RenderObjectLayer, RenderObject } from "../../game/renderer/types/render-objects.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { CameraViewport } from "../../game/world/types/camera-viewport.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { ISystem } from "./system.interface.js";

export class RenderSystem implements ISystem {

  constructor(
    private cameraManager : CameraManager, 
    private tilemapManager : WorldTilemapManager,
    private rendererEngine : RendererEngine,
    private spriteManager : SpriteManager) {

  }

  update(deltaTime: number): void {
    const viewport = this.cameraManager.getViewport();
    const terrainRenderObjects = this.getTerrainRenderObjects(viewport);
    const overTerrainRenderObjects = this.getOverTerrainRenderObjects(viewport);
    this.rendererEngine.render(terrainRenderObjects, overTerrainRenderObjects);
  }

  private getTerrainRenderObjects (viewport : CameraViewport): Array<RenderObject> {
    const terrainRenderObjects : Array<RenderObject> = [];
    const terrainTilesInViewport = this.tilemapManager.getTilesInArea(viewport);
    console.log("terrainTilesInViewport", terrainTilesInViewport)
    const terrainSpritesheet = this.tilemapManager.appliedSpriteSheetName;
    for (const terrainTile of terrainTilesInViewport) {
      const spriteDetails = this.spriteManager.getSpriteProperties(terrainTile.spriteName, terrainSpritesheet);
      terrainRenderObjects.push({
        xWorldPosition: terrainTile.x * spriteDetails.spriteSheet.afterRenderSpriteSize,
        yWorldPosition: terrainTile.y * spriteDetails.spriteSheet.afterRenderSpriteSize,
        spriteSheetTexture: spriteDetails.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(terrainTile.spriteName, terrainSpritesheet),
        height : spriteDetails.spriteSheet.afterRenderSpriteSize,
        width : spriteDetails.spriteSheet.afterRenderSpriteSize
      })
    }
    return terrainRenderObjects;
  }

  private getOverTerrainRenderObjects (viewport : CameraViewport): Array<RenderObject> {
    //tbd, take from entities
    const terrainRenderObjects : Array<RenderObject> = [];
    return terrainRenderObjects;
  }

}
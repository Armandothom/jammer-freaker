import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { RenderObjectLayer, RenderObject } from "../../game/renderer/types/render-objects.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { CameraViewport } from "../../game/world/types/camera-viewport.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import { ISystem } from "./system.interface.js";

export class RenderSystem implements ISystem {
  private readonly layerMultiplicator = {
    "1": 1,
    "2": 2,
    "3": 3
  };
  constructor(
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private cameraManager: CameraManager,
    private tilemapManager: WorldTilemapManager,
    private rendererEngine: RendererEngine,
    private spriteManager: SpriteManager,
    private directionAnimComponentStore : ComponentStore<DirectionAnimComponent>,
    private aimShootingComponentStore : ComponentStore<AimShootingComponent>,) {

  }

  update(deltaTime: number): void {
    const viewport = this.cameraManager.getViewport();
    const terrainRenderObjects = this.getTerrainRenderObjects(viewport);
    const overTerrainRenderObjects = this.getOverTerrainRenderObjects(viewport);
    const renderObjects = [...overTerrainRenderObjects, ...terrainRenderObjects]
    this.rendererEngine.render(renderObjects);
  }

  private getTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const terrainRenderObjects: Array<RenderObject> = [];
    const terrainTilesInViewport = this.tilemapManager.getTilesInArea(viewport);
    const terrainSpritesheet = this.tilemapManager.appliedSpriteSheetName;
    for (const terrainTile of terrainTilesInViewport) {
      const spriteDetails = this.spriteManager.getSpriteProperties(terrainTile.spriteName, terrainSpritesheet);
      terrainRenderObjects.push({
        xWorldPosition: terrainTile.x * spriteDetails.spriteSheet.originalRenderSpriteHeight,
        yWorldPosition: terrainTile.y * spriteDetails.spriteSheet.originalRenderSpriteWidth,
        spriteSheetTexture: spriteDetails.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(terrainTile.spriteName, terrainSpritesheet),
        height: spriteDetails.spriteSheet.originalRenderSpriteHeight,
        width: spriteDetails.spriteSheet.originalRenderSpriteWidth,
        angleRotation: null,
        offsetRotation : 0,
        zLevel: (terrainTile.y * 0.1) * this.layerMultiplicator["1"]
      })
    }
    return terrainRenderObjects;
  }

  private getOverTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    let renderObject: Array<RenderObject> = [];
    const entities = this.positionComponentStore.getAllEntities();    
    for (const entity of entities) {
      const sprite = this.spriteComponentStore.get(entity);
      const position = this.positionComponentStore.get(entity);
      if (position.x > viewport.right || position.x < viewport.left ||
        position.y < viewport.top || position.y > viewport.bottom
      ) {
        //Entity is not within viewport
        continue;
      }
      const aimComponent = this.aimShootingComponentStore.getOrNull(entity);
      const mirrorSprite = this.directionAnimComponentStore.getOrNull(entity)?.direction == AnimDirection.LEFT ? true : false;
      const spriteProperties = this.spriteManager.getSpriteProperties(sprite.spriteName, sprite.spriteSheetName);
      renderObject.push({
        xWorldPosition: position.x,
        yWorldPosition: position.y,
        spriteSheetTexture: spriteProperties.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(sprite.spriteName, sprite.spriteSheetName, mirrorSprite),
        height: sprite.height,
        width: sprite.width,
        angleRotation: aimComponent?.aimAngle || null,
        offsetRotation : aimComponent?.offsetAimAngle || 0,
        zLevel : (position.y * 0.1) * this.layerMultiplicator["2"]
      })
    }
    return renderObject;
  }

}
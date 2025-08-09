import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { RenderObjectLayer, RenderObject } from "../../game/renderer/types/render-objects.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { CameraViewport } from "../../game/world/types/camera-viewport.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { PositionComponent } from "../components/position.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import { LevelManager } from "../core/level-manager.js";
import { ISystem } from "./system.interface.js";

export class RenderSystem implements ISystem {
  private readonly layerMultiplicator: Record<string, number> = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4
  };
  constructor(
    private renderableComponentStore: ComponentStore<RenderableComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private cameraManager: CameraManager,
    private tilemapManager: WorldTilemapManager,
    private rendererEngine: RendererEngine,
    private spriteManager: SpriteManager,
    private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
    private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private levelManager: LevelManager,
  ) {

  }

  update(deltaTime: number): void {
    const viewport = this.cameraManager.getViewport();
    this.rendererEngine.clear();
    const terrainRenderObjects = this.getTerrainRenderObjects(viewport);
    const overTerrainRenderObjects = this.getOverTerrainRenderObjects(viewport);
    const renderObjects = [...overTerrainRenderObjects, ...terrainRenderObjects];
    this.rendererEngine.render(renderObjects);
    this.rendererEngine.uploadSpawnBatch();
    this.rendererEngine.updateParticles(deltaTime);
    this.rendererEngine.disarmSpawnStyleRects();
    this.rendererEngine.renderParticles();
  }

  private getTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const terrainRenderObjects: Array<RenderObject> = [];
    const terrainTilesInViewport = this.tilemapManager.getTilesInArea(viewport);
    const terrainSpritesheet = this.tilemapManager.appliedSpriteSheetName;
    const zoomProgressionFactor = this.levelManager.zoomProgressionFactor;

    for (const terrainTile of terrainTilesInViewport) {
      const spriteDetails = this.spriteManager.getSpriteProperties(terrainTile.spriteName, terrainSpritesheet);
      terrainRenderObjects.push({
        xWorldPosition: terrainTile.x * spriteDetails.sprite.originalRenderSpriteHeight * zoomProgressionFactor,
        yWorldPosition: terrainTile.y * spriteDetails.sprite.originalRenderSpriteWidth * zoomProgressionFactor,
        spriteSheetTexture: spriteDetails.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(terrainTile.spriteName, terrainSpritesheet),
        height: spriteDetails.sprite.originalRenderSpriteHeight * zoomProgressionFactor,
        width: spriteDetails.sprite.originalRenderSpriteWidth * zoomProgressionFactor,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: (terrainTile.y * 0.1) * this.layerMultiplicator["1"]
      })
    }
    return terrainRenderObjects;
  }

  private getOverTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    let renderObject: Array<RenderObject> = [];
    const entities = this.renderableComponentStore.getAllEntities();
    for (const entity of entities) {
      const sprite = this.spriteComponentStore.get(entity);
      const position = this.positionComponentStore.get(entity);
      const spriteProperties = this.spriteManager.getSpriteProperties(sprite.spriteName, sprite.spriteSheetName);
      const spriteHeight = spriteProperties.sprite.originalRenderSpriteHeight ?? sprite.height ?? 0;
      if (position.x > viewport.right || position.x < (viewport.left - sprite.width) ||
        position.y < (viewport.top - sprite.height) || position.y > viewport.bottom
      ) {
        //Entity is not within viewport
        continue;
      }
      const aimComponent = this.aimShootingComponentStore.getOrNull(entity);
      const mirrorSpriteX = this.directionAnimComponentStore.getOrNull(entity)?.xDirection == AnimDirection.LEFT ? true : false;
      const mirrorSpriteY = this.directionAnimComponentStore.getOrNull(entity)?.yDirection == AnimDirection.BOTTOM ? true : false;


      const layerComponent = this.zLayerComponentStore.get(entity);
      renderObject.push({
        xWorldPosition: position.x,
        yWorldPosition: position.y,
        spriteSheetTexture: spriteProperties.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(sprite.spriteName, sprite.spriteSheetName, mirrorSpriteX, mirrorSpriteY),
        height: sprite.height,
        width: sprite.width,
        angleRotation: aimComponent?.aimAngle || null,
        offsetRotation: aimComponent?.offsetAimAngle || 0,
        zLevel: (position.y * 0.1) * this.layerMultiplicator[layerComponent.layer]
      })
    }
    return renderObject;
  }

}
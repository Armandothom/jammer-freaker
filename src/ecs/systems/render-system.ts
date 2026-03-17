import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { RenderObject } from "../../game/renderer/types/render-objects.js";
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
import { LevelManager } from "../core/level-manager.js";
import { ISystem } from "./system.interface.js";

export class RenderSystem implements ISystem {
  private readonly layerMultiplicator: Record<string, number> = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
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
  ) { }

  update(deltaTime: number): void {
    const viewport = this.cameraManager.getViewport();

    this.rendererEngine.clear();

    const terrainRenderObjects = this.getTerrainRenderObjects(viewport);
    const overTerrainRenderObjects = this.getOverTerrainRenderObjects(viewport);

    const renderObjects = [...terrainRenderObjects, ...overTerrainRenderObjects];

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
      const spriteDetails = this.spriteManager.getSpriteProperties(
        terrainTile.spriteName,
        terrainSpritesheet
      );

      const tileWidth =
        spriteDetails.sprite.originalRenderSpriteWidth * zoomProgressionFactor;
      const tileHeight =
        spriteDetails.sprite.originalRenderSpriteHeight * zoomProgressionFactor;

      const worldX = terrainTile.x * tileWidth;
      const worldY = terrainTile.y * tileHeight;

      const screenX = worldX - viewport.left;
      const screenY = worldY - viewport.top;

      terrainRenderObjects.push({
        xWorldPosition: screenX,
        yWorldPosition: screenY,
        spriteSheetTexture: spriteDetails.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(
          terrainTile.spriteName,
          terrainSpritesheet
        ),
        height: tileHeight,
        width: tileWidth,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: (terrainTile.y * 0.1) * this.layerMultiplicator["1"],
      });
    }

    return terrainRenderObjects;
  }

  private getOverTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const renderObjects: Array<RenderObject> = [];
    const entities = this.renderableComponentStore.getAllEntities();

    for (const entity of entities) {
      const sprite = this.spriteComponentStore.getOrNull(entity);
      const position = this.positionComponentStore.getOrNull(entity);
      const layerComponent = this.zLayerComponentStore.getOrNull(entity);

      if (!sprite || !position || !layerComponent) {
        continue;
      }

      const spriteProperties = this.spriteManager.getSpriteProperties(
        sprite.spriteName,
        sprite.spriteSheetName
      );

      const spriteWidth =
        sprite.width ?? spriteProperties.sprite.originalRenderSpriteWidth;
      const spriteHeight =
        sprite.height ?? spriteProperties.sprite.originalRenderSpriteHeight;

      const worldLeft = position.x;
      const worldRight = position.x + spriteWidth;
      const worldTop = position.y;
      const worldBottom = position.y + spriteHeight;

      const isOutsideViewport =
        worldRight < viewport.left ||
        worldLeft > viewport.right ||
        worldBottom < viewport.top ||
        worldTop > viewport.bottom;

      if (isOutsideViewport) {
        continue;
      }

      const aimComponent = this.aimShootingComponentStore.getOrNull(entity);
      const directionAnim = this.directionAnimComponentStore.getOrNull(entity);

      const mirrorSpriteX = directionAnim?.xDirection === AnimDirection.LEFT;
      const mirrorSpriteY = directionAnim?.yDirection === AnimDirection.BOTTOM;

      const screenX = position.x - viewport.left;
      const screenY = position.y - viewport.top;

      renderObjects.push({
        xWorldPosition: screenX,
        yWorldPosition: screenY,
        spriteSheetTexture: spriteProperties.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(
          sprite.spriteName,
          sprite.spriteSheetName,
          mirrorSpriteX,
          mirrorSpriteY
        ),
        height: spriteHeight,
        width: spriteWidth,
        angleRotation: aimComponent?.aimAngle || null,
        offsetRotation: aimComponent?.offsetAimAngle || 0,
        zLevel: (position.y * 0.1) * this.layerMultiplicator[layerComponent.layer],
      });
    }

    return renderObjects;
  }
}
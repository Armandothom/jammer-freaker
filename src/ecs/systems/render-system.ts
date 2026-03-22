import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { RenderObject } from "../../game/renderer/types/render-objects.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { CameraViewport } from "../../game/world/types/camera-viewport.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { PositionComponent } from "../components/position.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
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
    private visibilityManager: VisibilityManager,
  ) { }

  update(deltaTime: number): void {
    const viewport = this.cameraManager.getViewport();

    this.rendererEngine.clear();

    const terrainRenderObjects = this.getTerrainRenderObjects(viewport);
    const wallRenderObjects = this.getWallRenderObjects(viewport);
    const overTerrainRenderObjects = this.getOverTerrainRenderObjects(viewport);
    const fogOverlayRenderObjects = this.getFogOverlayRenderObjects(viewport);

    const renderObjects = [
      ...terrainRenderObjects,
      ...wallRenderObjects,
      ...overTerrainRenderObjects,
    ];

    this.rendererEngine.render(renderObjects);
    this.rendererEngine.uploadSpawnBatch();
    this.rendererEngine.updateParticles(deltaTime);
    this.rendererEngine.disarmSpawnStyleRects();
    this.rendererEngine.renderParticles();

    if (fogOverlayRenderObjects.length > 0) {
      this.rendererEngine.render(fogOverlayRenderObjects);
    }
  }

  private getTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const terrainRenderObjects: Array<RenderObject> = [];
    const terrainTilesInViewport = this.tilemapManager.getTilesInArea(viewport);
    const terrainSpritesheet = this.tilemapManager.appliedSpriteSheetName;
    const tileSize = this.tilemapManager.tileSize;

    for (const terrainTile of terrainTilesInViewport) {
      const spriteDetails = this.spriteManager.getSpriteProperties(
        terrainTile.spriteName,
        terrainSpritesheet
      );

      const worldX = terrainTile.x * tileSize;
      const worldY = terrainTile.y * tileSize;

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
        height: tileSize,
        width: tileSize,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: terrainTile.y * 0.1,
      });
    }

    return terrainRenderObjects;
  }

  private getWallRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const wallRenderObjects: Array<RenderObject> = [];
    const wallTilesInViewport = this.tilemapManager.getWallTilesInArea(viewport);
    const wallSpritesheet = this.tilemapManager.appliedSpriteSheetName;
    const tileSize = this.tilemapManager.tileSize;

    for (const wallTile of wallTilesInViewport) {
      const spriteDetails = this.spriteManager.getSpriteProperties(
        wallTile.spriteName,
        wallSpritesheet
      );

      const worldX = wallTile.x * tileSize;
      const worldY = wallTile.y * tileSize;

      const screenX = worldX - viewport.left;
      const screenY = worldY - viewport.top;

      wallRenderObjects.push({
        xWorldPosition: screenX,
        yWorldPosition: screenY,
        spriteSheetTexture: spriteDetails.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(
          wallTile.spriteName,
          wallSpritesheet
        ),
        height: tileSize,
        width: tileSize,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: (wallTile.y * 0.1) * this.layerMultiplicator["2"],
      });
    }

    return wallRenderObjects;
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
        //console.log('entity culled by viewport', entity);
        continue;
      }

      const aimComponent = this.aimShootingComponentStore.getOrNull(entity);
      const directionAnim = this.directionAnimComponentStore.getOrNull(entity);

      const mirrorSpriteX = directionAnim?.xDirection === AnimDirection.LEFT;
      const mirrorSpriteY = directionAnim?.yDirection === AnimDirection.BOTTOM;

      const screenX = position.x - viewport.left;
      const screenY = position.y - viewport.top;
      const visibilitySampleX = position.x + (spriteWidth / 2);
      const visibilitySampleY = position.y + (spriteHeight / 2);

      if (
        !this.visibilityManager.isWorldPositionVisible(
          visibilitySampleX,
          visibilitySampleY,
          this.tilemapManager,
        )
      ) {
        continue;
      }

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

  private getFogOverlayRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    if (!this.visibilityManager.fogOfWarEnabled) {
      return [];
    }

    const fogOverlayRenderObjects: Array<RenderObject> = [];
    const terrainTilesInViewport = this.tilemapManager.getTilesInArea(viewport);
    const fogSpriteDetails = this.spriteManager.getSpriteProperties(
      SpriteName.BLANK,
      SpriteSheetName.BLANK,
    );
    const fogUvCoordinates = this.spriteManager.getUvCoordinates(
      SpriteName.BLANK,
      SpriteSheetName.BLANK,
    );
    const tileSize = this.tilemapManager.tileSize;

    for (const terrainTile of terrainTilesInViewport) {
      if (this.visibilityManager.isTileVisible(terrainTile.x, terrainTile.y)) {
        continue;
      }

      const worldX = terrainTile.x * tileSize;
      const worldY = terrainTile.y * tileSize;

      fogOverlayRenderObjects.push({
        xWorldPosition: worldX - viewport.left,
        yWorldPosition: worldY - viewport.top,
        spriteSheetTexture: fogSpriteDetails.spriteSheet.texture,
        uvCoordinates: fogUvCoordinates,
        height: tileSize,
        width: tileSize,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: 999,
      });
    }

    return fogOverlayRenderObjects;
  }
}

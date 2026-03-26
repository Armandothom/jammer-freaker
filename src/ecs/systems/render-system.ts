import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { RenderObject } from "../../game/renderer/types/render-objects.js";
import { TextLayoutHelper, BitmapTextLayout } from "../../game/text/text-layout-helper.js";
import { TextManager } from "../../game/text/text-manager.js";
import { BitmapFontAsset } from "../../game/text/types/bitmap-font.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { CameraViewport } from "../../game/world/types/camera-viewport.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { PositionComponent } from "../components/position.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { DebugManager } from "../core/debug-manager.js";
import { DebugSettingKey } from "../core/types/debug-manager-settings.js";

interface BitmapTextRenderContext {
  font: BitmapFontAsset;
  layout: BitmapTextLayout;
  bubbleWidth: number;
  bubbleHeight: number;
  textBoxWidth: number;
  textBoxHeight: number;
}

export class RenderSystem implements ISystem {
  private readonly layerMultiplicator: Record<string, number> = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
  };
  private readonly maxLayerMultiplier = 4;
  private readonly maxDepthLevel = 1000;

  constructor(
    private renderableComponentStore: ComponentStore<RenderableComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private cameraManager: CameraManager,
    private tilemapManager: WorldTilemapManager,
    private rendererEngine: RendererEngine,
    private spriteManager: SpriteManager,
    private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
    private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private visibilityManager: VisibilityManager,
    private debugManager: DebugManager,
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent>,
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    private textManager: TextManager,
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
    this.rendererEngine.toggleDebugBorderSprite(this.debugManager.getDebugSetting(DebugSettingKey.SPRITE_BOUNDS));
    this.rendererEngine.renderSprites(renderObjects);
    this.rendererEngine.uploadSpawnBatch();
    this.rendererEngine.updateParticles(deltaTime);
    this.rendererEngine.disarmSpawnStyleRects();
    this.rendererEngine.renderParticles();
    if (fogOverlayRenderObjects.length > 0) {
      this.rendererEngine.renderSprites(fogOverlayRenderObjects);
    }
    if (this.debugManager.getDebugSetting(DebugSettingKey.DEBUG_PAINT)) {
      this.renderDebugPaint(viewport);
    }
  }

  private renderDebugPaint(viewport: CameraViewport) {
    for (const order of OrderDebuggerOrchestrator.retrievePaintOrders()) {
      switch (order.type) {
        case 'circle':
          order.centroidX = order.centroidX - viewport.left;
          order.centroidY = order.centroidY - viewport.top;
          break;
        case 'fill':
          order.x = order.x - viewport.left;
          order.y = order.y - viewport.top;
          break;
      }
      this.rendererEngine.renderDebugPaint(order);
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
        zLevel: this.getDepthLevel(worldY, this.layerMultiplicator["1"]),
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
        zLevel: this.getDepthLevel(worldY, this.layerMultiplicator["2"]),
      });
    }

    return wallRenderObjects;
  }

  private getOverTerrainRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const renderObjects: Array<RenderObject> = [];
    const entities = this.renderableComponentStore.getAllEntities();

    for (const entity of entities) {
      const position = this.positionComponentStore.getOrNull(entity);
      const layerComponent = this.zLayerComponentStore.getOrNull(entity);
      const dialogBubble = this.dialogBubbleSpriteComponentStore.getOrNull(entity);
      const bitmapText = this.bitmapTextComponentStore.getOrNull(entity);

      if (!position || !layerComponent) {
        continue;
      }

      if (dialogBubble || bitmapText) {
        renderObjects.push(
          ...this.getDialogRenderObjects(
            entity,
            viewport,
            position,
            layerComponent,
            dialogBubble,
            bitmapText,
          ),
        );
        continue;
      }

      const sprite = this.spriteComponentStore.getOrNull(entity);
      if (!sprite) {
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
      const layerMultiplier = this.layerMultiplicator[layerComponent.layer] ?? 1;

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
        offsetRotation: aimComponent?.pivotPointSprite || 0,
        zLevel: this.getDepthLevel(position.y, layerMultiplier),
      });
    }

    return renderObjects;
  }

  private getDialogRenderObjects(
    entity: number,
    viewport: CameraViewport,
    position: PositionComponent,
    layerComponent: ZLayerComponent,
    dialogBubble: DialogBubbleSpriteComponent | null,
    bitmapText: BitmapTextComponent | null,
  ) {
    const renderObjects: Array<RenderObject> = [];
    const textContext = bitmapText
      ? this.buildBitmapTextRenderContext(bitmapText, dialogBubble)
      : null;

    const bubbleWidth = dialogBubble
      ? textContext?.bubbleWidth ?? dialogBubble.minWidth
      : 0;
    const bubbleHeight = dialogBubble
      ? textContext?.bubbleHeight ?? dialogBubble.minHeight
      : 0;
    const boundsWidth = dialogBubble
      ? bubbleWidth
      : textContext?.textBoxWidth ?? 0;
    const boundsHeight = dialogBubble
      ? bubbleHeight
      : textContext?.textBoxHeight ?? 0;

    if (boundsWidth <= 0 && boundsHeight <= 0) {
      return renderObjects;
    }

    const worldLeft = dialogBubble
      ? position.x - (bubbleWidth / 2)
      : position.x;
    const worldTop = dialogBubble
      ? position.y - bubbleHeight
      : position.y;

    if (this.isOutsideViewport(worldLeft, worldTop, boundsWidth, boundsHeight, viewport)) {
      return renderObjects;
    }

    const visibilitySampleX = dialogBubble
      ? position.x
      : worldLeft + (boundsWidth / 2);
    const visibilitySampleY = dialogBubble
      ? position.y
      : worldTop + (boundsHeight / 2);

    if (
      !this.visibilityManager.isWorldPositionVisible(
        visibilitySampleX,
        visibilitySampleY,
        this.tilemapManager,
      )
    ) {
      return renderObjects;
    }

    const layerMultiplier = this.layerMultiplicator[layerComponent.layer] ?? 1;
    const baseZLevel = this.getDepthLevel(position.y, layerMultiplier);
    const bubbleScreenX = Math.round(worldLeft - viewport.left);
    const bubbleScreenY = Math.round(worldTop - viewport.top);

    if (dialogBubble) {
      const bubbleSprite = this.spriteComponentStore.getOrNull(entity);
      const bubbleSpriteName = bubbleSprite?.spriteName ?? dialogBubble.spriteName;
      const bubbleSpriteSheetName = bubbleSprite?.spriteSheetName ?? dialogBubble.spriteSheetName;
      const bubbleSpriteProperties = this.spriteManager.getSpriteProperties(
        bubbleSpriteName,
        bubbleSpriteSheetName,
      );

      renderObjects.push({
        xWorldPosition: bubbleScreenX,
        yWorldPosition: bubbleScreenY,
        spriteSheetTexture: bubbleSpriteProperties.spriteSheet.texture,
        uvCoordinates: this.spriteManager.getUvCoordinates(
          bubbleSpriteName,
          bubbleSpriteSheetName,
        ),
        height: bubbleHeight,
        width: bubbleWidth,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: baseZLevel,
      });
    }

    if (!textContext) {
      return renderObjects;
    }

    const textWorldLeft = worldLeft + (dialogBubble?.textOffsetX ?? 0);
    const textWorldTop = worldTop + (dialogBubble?.textOffsetY ?? 0);

    for (const glyph of textContext.layout.glyphs) {
      renderObjects.push({
        xWorldPosition: Math.round((textWorldLeft + glyph.x) - viewport.left),
        yWorldPosition: Math.round((textWorldTop + glyph.y) - viewport.top),
        spriteSheetTexture: textContext.font.texture,
        uvCoordinates: this.textManager.getGlyphUvCoordinatesForFont(
          textContext.font,
          glyph.glyph,
        ),
        height: glyph.height,
        width: glyph.width,
        angleRotation: null,
        offsetRotation: 0,
        zLevel: baseZLevel + 0.01,
      });
    }

    return renderObjects;
  }

  private buildBitmapTextRenderContext(
    bitmapText: BitmapTextComponent,
    dialogBubble: DialogBubbleSpriteComponent | null,
  ): BitmapTextRenderContext {
    const font = this.textManager.getFont(bitmapText.fontId);
    const initialContentWidth = this.getInitialContentWidth(bitmapText, dialogBubble);
    const measuredLayout = TextLayoutHelper.measure(bitmapText, font, initialContentWidth);

    if (!dialogBubble) {
      const finalContentWidth = this.getTextOnlyContentWidth(bitmapText, measuredLayout.width);
      const layout = TextLayoutHelper.layout(bitmapText, font, finalContentWidth);

      return {
        font,
        layout,
        bubbleWidth: 0,
        bubbleHeight: 0,
        textBoxWidth: layout.contentWidth,
        textBoxHeight: layout.height,
      };
    }

    const initialBubbleWidth = Math.max(
      dialogBubble.minWidth,
      measuredLayout.width + dialogBubble.textOffsetX + dialogBubble.paddingX,
    );
    const initialBubbleHeight = Math.max(
      dialogBubble.minHeight,
      measuredLayout.height + dialogBubble.textOffsetY + dialogBubble.paddingY,
    );
    const finalContentWidth = Math.max(
      0,
      initialBubbleWidth - dialogBubble.textOffsetX - dialogBubble.paddingX,
    );
    const layout = TextLayoutHelper.layout(bitmapText, font, finalContentWidth);
    const bubbleWidth = Math.max(
      dialogBubble.minWidth,
      layout.width + dialogBubble.textOffsetX + dialogBubble.paddingX,
    );
    const bubbleHeight = Math.max(
      dialogBubble.minHeight,
      layout.height + dialogBubble.textOffsetY + dialogBubble.paddingY,
    );

    return {
      font,
      layout,
      bubbleWidth,
      bubbleHeight,
      textBoxWidth: Math.max(0, bubbleWidth - dialogBubble.textOffsetX - dialogBubble.paddingX),
      textBoxHeight: Math.max(initialBubbleHeight, bubbleHeight),
    };
  }

  private getInitialContentWidth(
    bitmapText: BitmapTextComponent,
    dialogBubble: DialogBubbleSpriteComponent | null,
  ) {
    if (!dialogBubble) {
      return this.getTextOnlyContentWidth(bitmapText, bitmapText.maxWidth ?? 0);
    }

    if (bitmapText.maxWidth && bitmapText.maxWidth > 0) {
      return bitmapText.maxWidth;
    }

    return Number.POSITIVE_INFINITY;
  }

  private getTextOnlyContentWidth(
    bitmapText: BitmapTextComponent,
    fallbackWidth: number,
  ) {
    if (bitmapText.maxWidth && bitmapText.maxWidth > 0) {
      return bitmapText.maxWidth;
    }
    return Math.max(fallbackWidth, 0);
  }

  private isOutsideViewport(
    worldLeft: number,
    worldTop: number,
    width: number,
    height: number,
    viewport: CameraViewport,
  ) {
    const worldRight = worldLeft + width;
    const worldBottom = worldTop + height;

    return (
      worldRight < viewport.left ||
      worldLeft > viewport.right ||
      worldBottom < viewport.top ||
      worldTop > viewport.bottom
    );
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
        zLevel: this.maxDepthLevel,
      });
    }

    return fogOverlayRenderObjects;
  }

  private getDepthLevel(worldY: number, layerMultiplier: number): number {
    const clampedWorldY = Math.max(0, Math.min(worldY, this.tilemapManager.worldHeight));
    const maxDepthSource = this.tilemapManager.worldHeight * this.maxLayerMultiplier;

    if (maxDepthSource === 0) {
      return 0;
    }

    // Keeps the existing Y/layer ordering while staying inside the clip-space depth range.
    return (clampedWorldY * layerMultiplier / maxDepthSource) * this.maxDepthLevel;
  }
}

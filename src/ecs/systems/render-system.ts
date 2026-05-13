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
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { GrenadeTravelComponent } from "../components/grenade-travel.component.js";
import { PositionComponent } from "../components/position.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { SpriteClipComponent } from "../components/sprite-clip.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { TransformComponent } from "../components/transform-component.js";
import { UIRuntimeElementComponent } from "../components/ui-runtime-element.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { DebugManager } from "../core/debug-manager.js";
import { DebugSettingKey } from "../core/types/debug-manager-settings.js";
import { DebuggerPaintOrder } from "../debugger-orders/types/debugger.js";

interface BitmapTextRenderContext {
  font: BitmapFontAsset;
  layout: BitmapTextLayout;
  bubbleWidth: number;
  bubbleHeight: number;
  textBoxWidth: number;
  textBoxHeight: number;
}

interface BitmapTextBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

const SCREEN_SPACE_DIALOG_Z_OFFSET = 1000;

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
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private spriteClipComponentStore: ComponentStore<SpriteClipComponent>,
    private uiRuntimeElementComponentStore: ComponentStore<UIRuntimeElementComponent>,
    private cameraManager: CameraManager,
    private tilemapManager: WorldTilemapManager,
    private rendererEngine: RendererEngine,
    private spriteManager: SpriteManager,
    private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
    private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
    private transformComponentStore: ComponentStore<TransformComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private visibilityManager: VisibilityManager,
    private debugManager: DebugManager,
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent>,
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    private textManager: TextManager,
    private grenadeComponentStore: ComponentStore<GrenadeComponent>,
    private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent>,
    private grenadeTravelComponentStore: ComponentStore<GrenadeTravelComponent>,
  ) { }

  update(deltaTime: number): void {
    const viewport = this.cameraManager.getViewport();
    const viewportBackgroundRenderObjects = this.getViewportBackgroundRenderObjects(viewport);
    const terrainRenderObjects = this.getTerrainRenderObjects(viewport);
    const wallRenderObjects = this.getWallRenderObjects(viewport);
    const overTerrainRenderObjects = this.getOverTerrainRenderObjects(viewport);
    const fogOverlayRenderObjects = this.getFogOverlayRenderObjects(viewport);
    const gameUiDepthThreshold = this.maxDepthLevel + 1;
    const worldSpaceRenderObjects = overTerrainRenderObjects.filter(
      (renderObject) => renderObject.zLevel <= gameUiDepthThreshold,
    );
    const gameUiRenderObjects = overTerrainRenderObjects.filter(
      (renderObject) => renderObject.zLevel > gameUiDepthThreshold,
    );
    const worldRenderObjects = [
      ...viewportBackgroundRenderObjects,
      ...terrainRenderObjects,
      ...wallRenderObjects,
      ...worldSpaceRenderObjects,
      ...fogOverlayRenderObjects,
    ];
    const debugBorderSprites = this.debugManager.getDebugSetting(DebugSettingKey.SPRITE_BOUNDS);
    const debugPaintOrders = this.debugManager.getDebugSetting(DebugSettingKey.DEBUG_PAINT)
      ? this.getDebugPaintOrders(viewport)
      : [];

    this.rendererEngine.renderFrame({
      deltaTime,
      viewport,
      worldWidth: this.tilemapManager.worldWidth,
      worldHeight: this.tilemapManager.worldHeight,
      worldRenderObjects,
      uiRenderObjects: gameUiRenderObjects,
      debugBorderSprites,
      debugPaintOrders,
    });
  }

  private getDebugPaintOrders(viewport: CameraViewport): DebuggerPaintOrder[] {
    return OrderDebuggerOrchestrator.retrievePaintOrders().map((order) => {
      if (order.type === "circle") {
        return {
          ...order,
          centroidX: order.centroidX - viewport.left,
          centroidY: order.centroidY - viewport.top,
        };
      }

      return {
        ...order,
        x: order.x - viewport.left,
        y: order.y - viewport.top,
      };
    });
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

  private getViewportBackgroundRenderObjects(viewport: CameraViewport): Array<RenderObject> {
    const renderObjects: Array<RenderObject> = [];
    const { width: viewportWidth, height: viewportHeight } = this.cameraManager.getViewportSize();
    const backgroundSpriteName = SpriteName.WORLD_BACKGROUND;
    const backgroundSpriteSheet = SpriteSheetName.WORLD_BACKGROUND;
    const spriteDetails = this.spriteManager.getSpriteProperties(
      backgroundSpriteName,
      backgroundSpriteSheet,
    );
    const uvCoordinates = this.spriteManager.getUvCoordinates(
      backgroundSpriteName,
      backgroundSpriteSheet,
    );
    const tileWidth = spriteDetails.sprite.originalRenderSpriteWidth;
    const tileHeight = spriteDetails.sprite.originalRenderSpriteHeight;
    const startWorldX = Math.floor(viewport.left / tileWidth) * tileWidth;
    const startWorldY = Math.floor(viewport.top / tileHeight) * tileHeight;

    for (let worldY = startWorldY; (worldY - viewport.top) < viewportHeight; worldY += tileHeight) {
      for (let worldX = startWorldX; (worldX - viewport.left) < viewportWidth; worldX += tileWidth) {
        renderObjects.push({
          xWorldPosition: worldX - viewport.left,
          yWorldPosition: worldY - viewport.top,
          spriteSheetTexture: spriteDetails.spriteSheet.texture,
          uvCoordinates,
          height: tileHeight,
          width: tileWidth,
          angleRotation: null,
          offsetRotation: 0,
          zLevel: 0,
        });
      }
    }

    return renderObjects;
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
      const screenPosition = this.screenPositionComponentStore.getOrNull(entity);
      const layerComponent = this.zLayerComponentStore.getOrNull(entity);
      const dialogBubble = this.dialogBubbleSpriteComponentStore.getOrNull(entity);
      const bitmapText = this.bitmapTextComponentStore.getOrNull(entity);
      const isScreenSpace = !!screenPosition;
      const uiRuntimeElement = this.uiRuntimeElementComponentStore.getOrNull(entity);

      if ((!position && !screenPosition) || !layerComponent) {
        continue;
      }

      if (dialogBubble) {
        renderObjects.push(
          ...this.getDialogRenderObjects(
            entity,
            viewport,
            position,
            screenPosition,
            layerComponent,
            dialogBubble,
            bitmapText,
          ),
        );
        continue;
      }

      const sprite = this.spriteComponentStore.getOrNull(entity);
      if (sprite) {
        const spriteProperties = this.spriteManager.getSpriteProperties(
          sprite.spriteName,
          sprite.spriteSheetName
        );
        const spriteClip = this.spriteClipComponentStore.getOrNull(entity);

        let spriteWidth =
          sprite.width ?? spriteProperties.sprite.originalRenderSpriteWidth;
        let spriteHeight =
          sprite.height ?? spriteProperties.sprite.originalRenderSpriteHeight;
        const layerMultiplier = this.layerMultiplicator[layerComponent.layer] ?? 1;

        const aimComponent = this.aimShootingComponentStore.getOrNull(entity);
        const transformComponent = this.transformComponentStore.getOrNull(entity);
        const directionAnim = this.directionAnimComponentStore.getOrNull(entity);

        const mirrorSpriteX = directionAnim?.xDirection === AnimDirection.LEFT;
        const mirrorSpriteY = directionAnim?.yDirection === AnimDirection.BOTTOM;
        let screenX = 0;
        let screenY = 0;
        let zLevel = this.getGameUiDepthLevel(layerMultiplier);
        let uvCoordinates = spriteClip
          ? this.spriteManager.getClippedUvCoordinates(
            sprite.spriteName,
            sprite.spriteSheetName,
            {
              sourceHeight: spriteClip.sourceHeight,
              sourceOffsetX: spriteClip.sourceOffsetX,
              sourceOffsetY: spriteClip.sourceOffsetY,
              sourceWidth: spriteClip.sourceWidth,
            },
            mirrorSpriteX,
            mirrorSpriteY,
          )
          : this.spriteManager.getUvCoordinates(
            sprite.spriteName,
            sprite.spriteSheetName,
            mirrorSpriteX,
            mirrorSpriteY,
          );

        if (spriteClip?.trimRenderedSize) {
          const originalSourceWidth = spriteProperties.sprite.spriteCellOffset.width;
          const originalSourceHeight = spriteProperties.sprite.spriteCellOffset.height;

          if (originalSourceWidth > 0) {
            spriteWidth = spriteWidth * (spriteClip.sourceWidth / originalSourceWidth);
          }

          if (originalSourceHeight > 0) {
            spriteHeight = spriteHeight * (spriteClip.sourceHeight / originalSourceHeight);
          }
        }

        if (isScreenSpace) {
          screenX = screenPosition.x + (transformComponent?.xOffset ?? 0);
          screenY = screenPosition.y + (transformComponent?.yOffset ?? 0);
          zLevel += this.getUiRenderOrderOffset(uiRuntimeElement);
        } else {
          const worldPosition = position!;
          const worldLeft = worldPosition.x;
          const worldRight = worldPosition.x + spriteWidth;
          const worldTop = worldPosition.y;
          const worldBottom = worldPosition.y + spriteHeight;

          const isOutsideViewport =
            worldRight < viewport.left ||
            worldLeft > viewport.right ||
            worldBottom < viewport.top ||
            worldTop > viewport.bottom;

          if (isOutsideViewport) {
            continue;
          }

          const visibilitySampleX = worldPosition.x + (spriteWidth / 2);
          const visibilitySampleY = worldPosition.y + (spriteHeight / 2);

          if (
            !this.visibilityManager.isWorldPositionVisible(
              visibilitySampleX,
              visibilitySampleY,
              this.tilemapManager,
            )
          ) {
            continue;
          }

          screenX = worldPosition.x + (transformComponent?.xOffset ?? 0) - viewport.left;
          screenY = worldPosition.y + (transformComponent?.yOffset ?? 0) - viewport.top - this.getPossibleRenderOffsetY(entity);
          zLevel = this.getDepthLevel(worldPosition.y, layerMultiplier);
        }
        const angleRotation = aimComponent || transformComponent?.rotationOffset
          ? (aimComponent?.aimAngle ?? 0) + (transformComponent?.rotationOffset ?? 0)
          : null;

        renderObjects.push({
          xWorldPosition: screenX,
          yWorldPosition: screenY,
          spriteSheetTexture: spriteProperties.spriteSheet.texture,
          uvCoordinates,
          height: spriteHeight,
          width: spriteWidth,
          angleRotation,
          offsetRotation: aimComponent?.pivotPointSprite || 0,
          opacity: uiRuntimeElement?.opacity,
          zLevel,
        });
      }

      if (bitmapText) {
        renderObjects.push(
          ...this.getBitmapTextRenderObjects(
            entity,
            viewport,
            position,
            screenPosition,
            layerComponent,
            bitmapText,
            sprite,
          ),
        );
      }
    }

    return renderObjects;
  }

  private getDialogRenderObjects(
    entity: number,
    viewport: CameraViewport,
    position: PositionComponent | null,
    screenPosition: ScreenPositionComponent | null,
    layerComponent: ZLayerComponent,
    dialogBubble: DialogBubbleSpriteComponent | null,
    bitmapText: BitmapTextComponent | null,
  ) {
    const renderObjects: Array<RenderObject> = [];
    const isScreenSpace = !!screenPosition;
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

    const baseX = isScreenSpace ? screenPosition.x : position?.x;
    const baseY = isScreenSpace ? screenPosition.y : position?.y;

    if (baseX === undefined || baseY === undefined) {
      return renderObjects;
    }

    const left = dialogBubble
      ? baseX - (bubbleWidth / 2)
      : baseX;
    const top = dialogBubble
      ? baseY - bubbleHeight
      : baseY;

    if (!isScreenSpace) {
      if (this.isOutsideViewport(left, top, boundsWidth, boundsHeight, viewport)) {
        return renderObjects;
      }

      const visibilitySampleX = dialogBubble
        ? baseX
        : left + (boundsWidth / 2);
      const visibilitySampleY = dialogBubble
        ? baseY
        : top + (boundsHeight / 2);

      if (
        !this.visibilityManager.isWorldPositionVisible(
          visibilitySampleX,
          visibilitySampleY,
          this.tilemapManager,
        )
      ) {
        return renderObjects;
      }
    }

    const layerMultiplier = this.layerMultiplicator[layerComponent.layer] ?? 1;
    const baseZLevel = isScreenSpace
      ? this.getGameUiDepthLevel(layerMultiplier) + SCREEN_SPACE_DIALOG_Z_OFFSET
      : this.getDepthLevel(position!.y, layerMultiplier);
    const bubbleScreenX = Math.round(isScreenSpace ? left : left - viewport.left);
    const bubbleScreenY = Math.round(isScreenSpace ? top : top - viewport.top);

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

    const textLeft = left + (dialogBubble?.textOffsetX ?? 0);
    const textTop = top
      + (dialogBubble?.textOffsetY ?? 0)
      + Math.round((textContext.textBoxHeight - textContext.layout.height) / 2);

    for (const glyph of textContext.layout.glyphs) {
      renderObjects.push({
        xWorldPosition: Math.round(
          isScreenSpace ? textLeft + glyph.x : (textLeft + glyph.x) - viewport.left,
        ),
        yWorldPosition: Math.round(
          isScreenSpace ? textTop + glyph.y : (textTop + glyph.y) - viewport.top,
        ),
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

  private getBitmapTextRenderObjects(
    entity: number,
    viewport: CameraViewport,
    position: PositionComponent | null,
    screenPosition: ScreenPositionComponent | null,
    layerComponent: ZLayerComponent,
    bitmapText: BitmapTextComponent,
    containerSprite: SpriteComponent | null,
  ) {
    const renderObjects: Array<RenderObject> = [];
    const isScreenSpace = !!screenPosition;
    const textContext = this.buildBitmapTextRenderContext(bitmapText, null);
    const glyphBounds = this.getBitmapTextBounds(textContext.layout);
    const baseX = isScreenSpace ? screenPosition.x : position?.x;
    const baseY = isScreenSpace ? screenPosition.y : position?.y;

    if (baseX === undefined || baseY === undefined) {
      return renderObjects;
    }

    const boundsWidth = containerSprite
      ? containerSprite.width
      : textContext.textBoxWidth;
    const boundsHeight = containerSprite
      ? containerSprite.height
      : textContext.textBoxHeight;

    if (boundsWidth <= 0 && boundsHeight <= 0) {
      return renderObjects;
    }

    if (!isScreenSpace) {
      if (this.isOutsideViewport(baseX, baseY, boundsWidth, boundsHeight, viewport)) {
        return renderObjects;
      }

      if (
        !this.visibilityManager.isWorldPositionVisible(
          baseX + (boundsWidth / 2),
          baseY + (boundsHeight / 2),
          this.tilemapManager,
        )
      ) {
        return renderObjects;
      }
    }

    const layerMultiplier = this.layerMultiplicator[layerComponent.layer] ?? 1;
    const uiRuntimeElement = this.uiRuntimeElementComponentStore.getOrNull(entity);
    const baseZLevel = isScreenSpace
      ? this.getGameUiDepthLevel(layerMultiplier) + this.getUiRenderOrderOffset(uiRuntimeElement)
      : this.getDepthLevel(position!.y, layerMultiplier);
    const textLeft = containerSprite
      ? baseX + Math.round(((containerSprite.width - glyphBounds.width) / 2) - glyphBounds.left)
      : baseX;
    const textTop = containerSprite
      ? baseY + Math.round(((containerSprite.height - glyphBounds.height) / 2) - glyphBounds.top)
      : baseY;

    for (const glyph of textContext.layout.glyphs) {
      renderObjects.push({
        xWorldPosition: Math.round(
          isScreenSpace ? textLeft + glyph.x : (textLeft + glyph.x) - viewport.left,
        ),
        yWorldPosition: Math.round(
          isScreenSpace ? textTop + glyph.y : (textTop + glyph.y) - viewport.top,
        ),
        spriteSheetTexture: textContext.font.texture,
        uvCoordinates: this.textManager.getGlyphUvCoordinatesForFont(
          textContext.font,
          glyph.glyph,
        ),
        height: glyph.height,
        width: glyph.width,
        angleRotation: null,
        offsetRotation: 0,
        opacity: uiRuntimeElement?.opacity,
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
      textBoxHeight: Math.max(0, bubbleHeight - dialogBubble.textOffsetY - dialogBubble.paddingY),
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

  private getBitmapTextBounds(layout: BitmapTextLayout): BitmapTextBounds {
    if (layout.glyphs.length === 0) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const glyph of layout.glyphs) {
      minX = Math.min(minX, glyph.x);
      minY = Math.min(minY, glyph.y);
      maxX = Math.max(maxX, glyph.x + glyph.width);
      maxY = Math.max(maxY, glyph.y + glyph.height);
    }

    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
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

  private getGameUiDepthLevel(layerMultiplier: number): number {
    return this.maxDepthLevel + layerMultiplier + 1;
  }

  private getUiRenderOrderOffset(uiRuntimeElement: UIRuntimeElementComponent | null): number {
    if (!uiRuntimeElement) {
      return 0;
    }

    return uiRuntimeElement.renderOrder * 0.1;
  }

  private getPossibleRenderOffsetY(entity: number): number {
    if (!this.grenadeComponentStore.has(entity) || this.grenadeExplosionComponentStore.has(entity)) {
      return 0;
    }

    const grenadeTravel = this.grenadeTravelComponentStore.getOrNull(entity);
    if (!grenadeTravel) {
      return 0;
    }

    return grenadeTravel.currentRenderOffsetY;
  }
}

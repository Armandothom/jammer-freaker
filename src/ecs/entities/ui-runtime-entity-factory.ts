import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { SpriteClipComponent } from "../components/sprite-clip.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { UIRuntimeElementComponent } from "../components/ui-runtime-element.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import type { UIRenderableNode } from "../../ui/runtime/ui-document.js";

const DEFAULT_UI_FONT_ID = "04b_03";
const DEFAULT_UI_TEXT_SCALE = 2;
const DEFAULT_UI_Z_LAYER = 4;

export class UIRuntimeEntityFactory {
  constructor(
    private entityManager: EntityManager,
    private renderableComponentStore: ComponentStore<RenderableComponent>,
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private uiRuntimeElementComponentStore: ComponentStore<UIRuntimeElementComponent>,
    private spriteClipComponentStore: ComponentStore<SpriteClipComponent>,
  ) { }

  public createNodeEntity(node: UIRenderableNode): number {
    const entityId = this.entityManager.registerEntity();

    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.screenPositionComponentStore.add(
      entityId,
      new ScreenPositionComponent(Math.round(node.x), Math.round(node.y)),
    );
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(DEFAULT_UI_Z_LAYER));
    this.uiRuntimeElementComponentStore.add(
      entityId,
      new UIRuntimeElementComponent(node.nodeId, node.screenId, node.renderOrder),
    );
    this.syncVisualState(entityId, node);

    return entityId;
  }

  public destroyNodeEntity(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.screenPositionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.bitmapTextComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
    this.uiRuntimeElementComponentStore.remove(entityId);
    this.spriteClipComponentStore.remove(entityId);
  }

  public updateNodeEntity(entityId: number, node: UIRenderableNode): void {
    const screenPosition = this.screenPositionComponentStore.getOrNull(entityId);
    if (screenPosition) {
      screenPosition.x = Math.round(node.x);
      screenPosition.y = Math.round(node.y);
    } else {
      this.screenPositionComponentStore.add(
        entityId,
        new ScreenPositionComponent(Math.round(node.x), Math.round(node.y)),
      );
    }

    const zLayer = this.zLayerComponentStore.getOrNull(entityId);
    if (zLayer) {
      zLayer.layer = DEFAULT_UI_Z_LAYER;
    } else {
      this.zLayerComponentStore.add(entityId, new ZLayerComponent(DEFAULT_UI_Z_LAYER));
    }

    const runtimeElement = this.uiRuntimeElementComponentStore.getOrNull(entityId);
    if (runtimeElement) {
      runtimeElement.nodeId = node.nodeId;
      runtimeElement.screenId = node.screenId;
      runtimeElement.renderOrder = node.renderOrder;
    } else {
      this.uiRuntimeElementComponentStore.add(
        entityId,
        new UIRuntimeElementComponent(node.nodeId, node.screenId, node.renderOrder),
      );
    }

    this.syncVisualState(entityId, node);
  }

  private syncBitmapText(entityId: number, node: UIRenderableNode): void {
    const textVisual = node.visual.text;
    if (!textVisual) {
      this.bitmapTextComponentStore.remove(entityId);
      return;
    }

    const maxWidth = node.resolvedWidth > 0
      ? Math.round(node.resolvedWidth)
      : textVisual.maxWidth ?? null;
    const bitmapText = this.bitmapTextComponentStore.getOrNull(entityId);

    if (bitmapText) {
      bitmapText.autoWrap = textVisual.autoWrap ?? false;
      bitmapText.fontId = textVisual.fontId ?? DEFAULT_UI_FONT_ID;
      bitmapText.horizontalAlign = textVisual.horizontalAlign ?? "left";
      bitmapText.maxWidth = maxWidth;
      bitmapText.scale = textVisual.scale ?? DEFAULT_UI_TEXT_SCALE;
      bitmapText.text = textVisual.text;
      return;
    }

    this.bitmapTextComponentStore.add(
      entityId,
      new BitmapTextComponent(
        textVisual.text,
        textVisual.fontId ?? DEFAULT_UI_FONT_ID,
        textVisual.scale ?? DEFAULT_UI_TEXT_SCALE,
        maxWidth,
        textVisual.autoWrap ?? false,
        textVisual.horizontalAlign ?? "left",
      ),
    );
  }

  private syncSprite(entityId: number, node: UIRenderableNode): void {
    const spriteVisual = node.visual.sprite;
    if (!spriteVisual) {
      this.spriteComponentStore.remove(entityId);
      this.spriteClipComponentStore.remove(entityId);
      return;
    }

    const sprite = this.spriteComponentStore.getOrNull(entityId);
    const width = Math.round(node.resolvedWidth);
    const height = Math.round(node.resolvedHeight);

    if (sprite) {
      sprite.height = height;
      sprite.spriteName = spriteVisual.spriteName;
      sprite.spriteSheetName = spriteVisual.spriteSheetName;
      sprite.width = width;
    } else {
      this.spriteComponentStore.add(
        entityId,
        new SpriteComponent(
          spriteVisual.spriteName,
          spriteVisual.spriteSheetName,
          width,
          height,
        ),
      );
    }

    if (!spriteVisual.clip) {
      this.spriteClipComponentStore.remove(entityId);
      return;
    }

    const spriteClip = this.spriteClipComponentStore.getOrNull(entityId);
    if (spriteClip) {
      spriteClip.sourceHeight = spriteVisual.clip.sourceHeight;
      spriteClip.sourceOffsetX = spriteVisual.clip.sourceOffsetX;
      spriteClip.sourceOffsetY = spriteVisual.clip.sourceOffsetY;
      spriteClip.sourceWidth = spriteVisual.clip.sourceWidth;
      spriteClip.trimRenderedSize = spriteVisual.clip.trimRenderedSize ?? true;
      return;
    }

    this.spriteClipComponentStore.add(
      entityId,
      new SpriteClipComponent(
        spriteVisual.clip.sourceOffsetX,
        spriteVisual.clip.sourceOffsetY,
        spriteVisual.clip.sourceWidth,
        spriteVisual.clip.sourceHeight,
        spriteVisual.clip.trimRenderedSize ?? true,
      ),
    );
  }

  private syncVisualState(entityId: number, node: UIRenderableNode): void {
    this.syncSprite(entityId, node);
    this.syncBitmapText(entityId, node);
  }
}

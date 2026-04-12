import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AnimationComponent } from "../components/animation.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { createDialogBitmapTextComponent } from "../core/dialog-text-layout.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";

const DEFAULT_DIALOG_FONT_ID = "04b_03";
const DEFAULT_DIALOG_TEXT_SCALE = 2;
const DEFAULT_DIALOG_PADDING_X = 16;
const DEFAULT_DIALOG_PADDING_Y = 24;
const DEFAULT_DIALOG_TEXT_OFFSET_X = 16;
const DEFAULT_DIALOG_TEXT_OFFSET_Y = 16;
const DEFAULT_DIALOG_MIN_WIDTH = 48;
const DEFAULT_DIALOG_MIN_HEIGHT = 48;
const DEFAULT_DIALOG_Z_LAYER = 4;

export class DialogEntityFactory {
  constructor(
    private entityManager: EntityManager,
    private renderableComponentStore: ComponentStore<RenderableComponent>,
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private animationComponentStore: ComponentStore<AnimationComponent>,
    private dialogComponentStore: ComponentStore<DialogComponent>,
    private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent>,
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent>,
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    private dialogAnimComponentStore: ComponentStore<DialogAnimComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private fallbackMaxWidth: number,
  ) { }

  public createScreenSpaceDialog(
    sourceEntityId: number,
    text: string,
    remainingTime: number,
    screenX: number,
    screenY: number,
    dialogType: string = "speech",
    followSource: boolean = false,
    destroyOnExpire: boolean = true,
  ): number {
    const entityId = this.entityManager.registerEntity();
    const dialogAnimation = new DialogAnimComponent(AnimationName.DIALOG_BALLOON_IDLE);
    const animationComponent = new AnimationComponent(
      dialogAnimation.animationName,
      dialogAnimation.loop,
    );
    animationComponent.startAnimationTime = dialogAnimation.startAnimationTime;

    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.screenPositionComponentStore.add(entityId, new ScreenPositionComponent(screenX, screenY));
    this.dialogComponentStore.add(entityId, new DialogComponent(
      sourceEntityId,
      dialogType,
      text,
      followSource,
      destroyOnExpire,
    ));
    this.dialogLifetimeComponentStore.add(entityId, new DialogLifetimeComponent(remainingTime));
    this.dialogBubbleSpriteComponentStore.add(entityId, new DialogBubbleSpriteComponent(
      SpriteName.DIALOG_BALLOON_1,
      SpriteSheetName.DIALOG_BALLOON,
      DEFAULT_DIALOG_PADDING_X,
      DEFAULT_DIALOG_PADDING_Y,
      DEFAULT_DIALOG_TEXT_OFFSET_X,
      DEFAULT_DIALOG_TEXT_OFFSET_Y,
      DEFAULT_DIALOG_MIN_WIDTH,
      DEFAULT_DIALOG_MIN_HEIGHT,
    ));
    this.bitmapTextComponentStore.add(
      entityId,
      createDialogBitmapTextComponent(
        text,
        DEFAULT_DIALOG_FONT_ID,
        DEFAULT_DIALOG_TEXT_SCALE,
        this.fallbackMaxWidth,
      ),
    );
    this.dialogAnimComponentStore.add(entityId, dialogAnimation);
    this.animationComponentStore.add(entityId, animationComponent);
    this.spriteComponentStore.add(entityId, new SpriteComponent(
      SpriteName.DIALOG_BALLOON_1,
      SpriteSheetName.DIALOG_BALLOON,
      DEFAULT_DIALOG_MIN_WIDTH,
      DEFAULT_DIALOG_MIN_HEIGHT,
    ));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(DEFAULT_DIALOG_Z_LAYER));

    return entityId;
  }

  public destroyDialog(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.screenPositionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.animationComponentStore.remove(entityId);
    this.dialogComponentStore.remove(entityId);
    this.dialogLifetimeComponentStore.remove(entityId);
    this.dialogBubbleSpriteComponentStore.remove(entityId);
    this.bitmapTextComponentStore.remove(entityId);
    this.dialogAnimComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
  }
}

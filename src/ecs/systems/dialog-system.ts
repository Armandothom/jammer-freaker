import { AnimationComponent } from "../components/animation.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogIntentComponent } from "../components/dialog-intent.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const MIN_DIALOG_DURATION_SECONDS = 1.8;
const DIALOG_DURATION_PER_CHARACTER_SECONDS = 0.06;
const DIALOG_FOLLOW_OFFSET_Y = 8;
let debugDialogShortcutRequested = false;

window.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  if (event.key.toLowerCase() === "o") {
    debugDialogShortcutRequested = true;
  }
});

export class DialogSystem implements ISystem {
  constructor(
    private entityFactory: EntityFactory,
    private dialogIntentComponentStore: ComponentStore<DialogIntentComponent>,
    private dialogComponentStore: ComponentStore<DialogComponent>,
    private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent>,
    private dialogAnimComponentStore: ComponentStore<DialogAnimComponent>,
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    private animationComponentStore: ComponentStore<AnimationComponent>,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
  ) { }

  update(deltaTime: number): void {
    this.handleDebugDialogShortcut();
    this.consumeDialogIntents();
    this.syncDialogText();
    this.syncDialogAnimations();
    this.updateDialogPositions();
    this.updateDialogTimers(deltaTime);
  }

  private handleDebugDialogShortcut() {
    debugDialogShortcutRequested = false;

    if (!debugDialogShortcutRequested) {
      return;
    }

    const sourceEntityId = this.playerComponentStore.getAllEntities()[0];
    if (sourceEntityId === undefined) {
      return;
    }
    const debugDialogText = "Follow me!";
    this.dialogIntentComponentStore.add(
      sourceEntityId,
      new DialogIntentComponent(debugDialogText),
    );
  }

  private consumeDialogIntents() {
    for (const [sourceEntityId, intent] of this.dialogIntentComponentStore.getValuesAndEntityId()) {
      this.dialogIntentComponentStore.remove(sourceEntityId);

      const trimmedText = intent.text.trim();
      if (trimmedText.length === 0 || !this.positionComponentStore.has(sourceEntityId)) {
        continue;
      }

      this.destroyDialogsFromSource(sourceEntityId);
      this.entityFactory.createDialog(
        sourceEntityId,
        trimmedText,
        this.calculateDialogDuration(trimmedText),
      );
    }
  }

  private syncDialogText() {
    for (const [dialogEntityId, dialog] of this.dialogComponentStore.getValuesAndEntityId()) {
      const bitmapText = this.bitmapTextComponentStore.getOrNull(dialogEntityId);
      if (!bitmapText || bitmapText.text === dialog.text) {
        continue;
      }
      bitmapText.text = dialog.text;
    }
  }

  private syncDialogAnimations() {
    for (const [dialogEntityId, dialogAnim] of this.dialogAnimComponentStore.getValuesAndEntityId()) {
      const currentAnimation = this.animationComponentStore.getOrNull(dialogEntityId);
      const animationOutOfSync = !currentAnimation
        || currentAnimation.animationName !== dialogAnim.animationName
        || currentAnimation.loop !== dialogAnim.loop
        || currentAnimation.startAnimationTime !== dialogAnim.startAnimationTime;

      if (!animationOutOfSync) {
        continue;
      }

      const animationComponent = new AnimationComponent(
        dialogAnim.animationName,
        dialogAnim.loop,
      );
      animationComponent.startAnimationTime = dialogAnim.startAnimationTime;
      this.animationComponentStore.add(dialogEntityId, animationComponent);
    }
  }

  private updateDialogPositions() {
    for (const [dialogEntityId, dialog] of this.dialogComponentStore.getValuesAndEntityId()) {
      if (!dialog.followSource) {
        continue;
      }

      const sourcePosition = this.positionComponentStore.getOrNull(dialog.sourceEntityId);
      if (!sourcePosition) {
        this.entityFactory.destroyDialog(dialogEntityId);
        continue;
      }

      const dialogPosition = this.positionComponentStore.get(dialogEntityId);
      const dialogAnchorPosition = this.getDialogAnchorPosition(dialog.sourceEntityId, sourcePosition);
      dialogPosition.x = dialogAnchorPosition.x;
      dialogPosition.y = dialogAnchorPosition.y;
    }
  }

  private getDialogAnchorPosition(
    sourceEntityId: number,
    sourcePosition: PositionComponent,
  ) {
    const sourceSprite = this.spriteComponentStore.getOrNull(sourceEntityId);
    const sourceWidth = sourceSprite?.width ?? 0;

    return {
      x: sourcePosition.x + (sourceWidth / 2),
      y: sourcePosition.y - DIALOG_FOLLOW_OFFSET_Y,
    };
  }

  private updateDialogTimers(deltaTime: number) {
    for (const [dialogEntityId, lifetime] of this.dialogLifetimeComponentStore.getValuesAndEntityId()) {
      lifetime.remainingTime -= deltaTime;

      if (lifetime.remainingTime > 0) {
        continue;
      }

      const dialog = this.dialogComponentStore.getOrNull(dialogEntityId);
      if (!dialog?.destroyOnExpire) {
        lifetime.remainingTime = 0;
        continue;
      }

      this.entityFactory.destroyDialog(dialogEntityId);
    }
  }

  private destroyDialogsFromSource(sourceEntityId: number) {
    for (const [dialogEntityId, dialog] of this.dialogComponentStore.getValuesAndEntityId()) {
      if (dialog.sourceEntityId !== sourceEntityId) {
        continue;
      }
      this.entityFactory.destroyDialog(dialogEntityId);
    }
  }

  private calculateDialogDuration(text: string) {
    return Math.max(
      MIN_DIALOG_DURATION_SECONDS,
      text.length * DIALOG_DURATION_PER_CHARACTER_SECONDS,
    );
  }
}

import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { createExecuteChoicesOverlayAction } from "../../ui/input/choices-overlay-ui-actions.js";
import { ChoicesOverlayPresenter } from "../../ui/presenters/choices-overlay.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  CHOICES_OVERLAY_MAX_CHOICES,
  CHOICES_OVERLAY_NODE_IDS,
  CHOICES_OVERLAY_SCREEN_ID,
} from "../../ui/screens/node-ids/choices-overlay-node-ids.js";
import { CONTAINER_CONTENT_NODE_IDS } from "../../ui/screens/node-ids/container-content-node-ids.js";
import { INVENTORY_OVERLAY_NODE_IDS } from "../../ui/screens/node-ids/inventory-overlay-node-ids.js";
import { ISystem } from "./system.interface.js";

export class ChoicesOverlayRuntimeSystem implements ISystem {
  private canvas: HTMLCanvasElement;
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private choicesOverlayPresenter: ChoicesOverlayPresenter,
  ) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("ChoicesOverlayRuntimeSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
  }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(CHOICES_OVERLAY_NODE_IDS.root);

    if (!rootNode) {
      return;
    }

    if (!this.hasActiveSourceScreen()) {
      this.closeOverlay();
      return;
    }

    const viewModel = this.choicesOverlayPresenter.buildViewModel();

    if (!viewModel) {
      this.closeOverlay();
      return;
    }

    const binder = this.getBinder();
    const frameX = Math.round(Math.min(
      Math.max(0, viewModel.x),
      Math.max(0, this.canvas.width - viewModel.frameWidth),
    ));
    const frameY = Math.round(Math.min(
      Math.max(0, viewModel.y),
      Math.max(0, this.canvas.height - viewModel.frameHeight),
    ));

    binder.setVisibility(CHOICES_OVERLAY_NODE_IDS.frame, true);
    binder.patchLayout(CHOICES_OVERLAY_NODE_IDS.frame, {
      height: viewModel.frameHeight,
      offsetX: frameX,
      offsetY: frameY,
      width: viewModel.frameWidth,
    });
    binder.patchSprite(CHOICES_OVERLAY_NODE_IDS.frame, {
      height: viewModel.frameHeight,
      width: viewModel.frameWidth,
    });

    const visibleChoiceIndexes = new Set<number>();

    for (const [choiceIndex, choice] of viewModel.choices.entries()) {
      const nodeIds = CHOICES_OVERLAY_NODE_IDS.choice(choiceIndex);
      visibleChoiceIndexes.add(choiceIndex);
      binder.setVisibility(nodeIds.root, choice.visible);
      binder.patchLayout(nodeIds.root, {
        offsetX: choice.x,
        offsetY: choice.y,
      });
      binder.patchInteraction(nodeIds.root, {
        action: createExecuteChoicesOverlayAction(choice.choiceId),
      });
      binder.patchText(nodeIds.label, {
        text: choice.label,
      });
    }

    for (let choiceIndex = 0; choiceIndex < CHOICES_OVERLAY_MAX_CHOICES; choiceIndex++) {
      if (visibleChoiceIndexes.has(choiceIndex)) {
        continue;
      }

      binder.setVisibility(CHOICES_OVERLAY_NODE_IDS.choice(choiceIndex).root, false);
    }

    this.uiRuntime.relayout();
  }

  private closeOverlay(): void {
    this.choicesOverlayPresenter.close();
    this.uiRuntime.popOverlay(CHOICES_OVERLAY_SCREEN_ID);
  }

  private getBinder(): UINodeBinder {
    if (!this.uiNodeBinder) {
      this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
    }

    return this.uiNodeBinder;
  }

  private hasActiveSourceScreen(): boolean {
    const context = this.choicesOverlayPresenter.getContext();

    if (!context) {
      return false;
    }

    const document = this.uiRuntime.getDocument();

    if (context.source === "container") {
      return document.getNodeOrNull(CONTAINER_CONTENT_NODE_IDS.root) !== null;
    }

    return document.getNodeOrNull(INVENTORY_OVERLAY_NODE_IDS.root) !== null;
  }
}

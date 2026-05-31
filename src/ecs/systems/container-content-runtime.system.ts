import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { CONTAINER_CONTENT_UI_ACTION } from "../../ui/input/container-content-ui-actions.js";
import { UIHitTest } from "../../ui/input/ui-hit-test.js";
import { ContainerContentPresenter } from "../../ui/presenters/container-content.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonState,
  UIButtonVariant,
} from "../../ui/style/ui-button-config.js";
import { CONTAINER_CONTENT_NODE_IDS } from "../../ui/screens/node-ids/container-content-node-ids.js";
import { ISystem } from "./system.interface.js";

type UIScreenPosition = {
  x: number;
  y: number;
};

export class ContainerContentRuntimeSystem implements ISystem {
  private canvas: HTMLCanvasElement;
  private mouseScreenPosition: UIScreenPosition | null = null;
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private containerContentPresenter: ContainerContentPresenter,
  ) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("ContainerContentRuntimeSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.canvas.addEventListener("mousemove", this.updateMousePosition);
    this.canvas.addEventListener("mouseleave", this.clearMousePosition);
  }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(CONTAINER_CONTENT_NODE_IDS.root);

    if (!rootNode) {
      this.containerContentPresenter.setHoveredSlotIndex(null);
      return;
    }

    this.syncHoveredSlotFromMouse();

    const binder = this.getBinder();
    const viewModel = this.containerContentPresenter.buildViewModel();

    if (!viewModel) {
      binder.setVisibility(CONTAINER_CONTENT_NODE_IDS.root, false);
      this.uiRuntime.relayout();
      return;
    }

    binder.setVisibility(CONTAINER_CONTENT_NODE_IDS.root, true);
    binder.patchLayout(CONTAINER_CONTENT_NODE_IDS.containerFrame, {
      height: viewModel.containerHeight,
      width: viewModel.containerWidth,
    });
    binder.patchSprite(CONTAINER_CONTENT_NODE_IDS.containerFrame, {
      height: viewModel.containerHeight,
      width: viewModel.containerWidth,
    });
    binder.patchLayout(CONTAINER_CONTENT_NODE_IDS.hoveredItemName, {
      width: viewModel.hoveredItemNameWidth,
    });
    binder.patchText(CONTAINER_CONTENT_NODE_IDS.hoveredItemName, {
      maxWidth: viewModel.hoveredItemNameWidth,
      text: viewModel.hoveredItemName,
    });
    binder.patchLayout(CONTAINER_CONTENT_NODE_IDS.closeButton, {
      offsetX: viewModel.closeButtonX,
      offsetY: viewModel.closeButtonY,
    });
    binder.patchLayout(CONTAINER_CONTENT_NODE_IDS.takeAllButton, {
      offsetX: viewModel.takeAllButtonX,
      offsetY: viewModel.takeAllButtonY,
    });
    binder.patchInteraction(CONTAINER_CONTENT_NODE_IDS.takeAllButton, {
      disabled: viewModel.takeAllButtonDisabled,
    });
    binder.patchSprite(CONTAINER_CONTENT_NODE_IDS.takeAllButton, {
      spriteName: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].states[
        viewModel.takeAllButtonDisabled ? UIButtonState.DISABLED : UIButtonState.NORMAL
      ].spriteName,
    });

    const visibleSlotIndexes = new Set<number>();

    for (const slotViewModel of viewModel.slots) {
      const nodeIds = CONTAINER_CONTENT_NODE_IDS.slot(slotViewModel.slotIndex);
      visibleSlotIndexes.add(slotViewModel.slotIndex);
      binder.setVisibility(nodeIds.root, slotViewModel.visible);
      binder.patchLayout(nodeIds.root, {
        offsetX: slotViewModel.x,
        offsetY: slotViewModel.y,
      });
      binder.setVisibility(nodeIds.icon, slotViewModel.iconVisible);
      binder.patchSprite(nodeIds.icon, {
        height: slotViewModel.iconHeight,
        spriteName: slotViewModel.iconSpriteName,
        spriteSheetName: slotViewModel.iconSpriteSheetName,
        width: slotViewModel.iconWidth,
      });
      binder.setVisibility(nodeIds.label, slotViewModel.labelVisible);
      binder.patchText(nodeIds.label, {
        text: slotViewModel.labelText,
      });
      binder.setVisibility(nodeIds.quantity, slotViewModel.quantityVisible);
      binder.patchText(nodeIds.quantity, {
        text: slotViewModel.amountText,
      });
    }

    binder.setVisibility(CONTAINER_CONTENT_NODE_IDS.dragVisual.root, viewModel.dragVisual.visible);
    binder.patchLayout(CONTAINER_CONTENT_NODE_IDS.dragVisual.root, {
      offsetX: viewModel.dragVisual.x,
      offsetY: viewModel.dragVisual.y,
    });
    binder.setVisibility(CONTAINER_CONTENT_NODE_IDS.dragVisual.icon, viewModel.dragVisual.iconVisible);
    binder.patchSprite(CONTAINER_CONTENT_NODE_IDS.dragVisual.icon, {
      height: viewModel.dragVisual.iconHeight,
      spriteName: viewModel.dragVisual.iconSpriteName,
      spriteSheetName: viewModel.dragVisual.iconSpriteSheetName,
      width: viewModel.dragVisual.iconWidth,
    });
    binder.setVisibility(CONTAINER_CONTENT_NODE_IDS.dragVisual.label, viewModel.dragVisual.labelVisible);
    binder.patchText(CONTAINER_CONTENT_NODE_IDS.dragVisual.label, {
      text: viewModel.dragVisual.labelText,
    });
    binder.setVisibility(CONTAINER_CONTENT_NODE_IDS.dragVisual.quantity, viewModel.dragVisual.quantityVisible);
    binder.patchText(CONTAINER_CONTENT_NODE_IDS.dragVisual.quantity, {
      text: viewModel.dragVisual.amountText,
    });

    this.hideUnusedSlots(visibleSlotIndexes);
    this.uiRuntime.relayout();
  }

  private clearMousePosition = (): void => {
    this.mouseScreenPosition = null;
  };

  private getBinder(): UINodeBinder {
    if (!this.uiNodeBinder) {
      this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
    }

    return this.uiNodeBinder;
  }

  private hideUnusedSlots(visibleSlotIndexes: Set<number>): void {
    const document = this.uiRuntime.getDocument();

    for (let slotIndex = 0; ; slotIndex++) {
      const nodeIds = CONTAINER_CONTENT_NODE_IDS.slot(slotIndex);

      if (!document.getNodeOrNull(nodeIds.root)) {
        return;
      }

      if (visibleSlotIndexes.has(slotIndex)) {
        continue;
      }

      this.getBinder().setVisibility(nodeIds.root, false);
    }
  }

  private syncHoveredSlotFromMouse(): void {
    if (!this.mouseScreenPosition) {
      this.containerContentPresenter.setHoveredSlotIndex(null);
      return;
    }

    const action = new UIHitTest(this.uiRuntime.getDocument()).pickAction(this.mouseScreenPosition);

    if (action?.type !== CONTAINER_CONTENT_UI_ACTION.ITEM_PLACEMENT_BIND
      || action.payload?.source !== "container") {
      this.containerContentPresenter.setHoveredSlotIndex(null);
      return;
    }

    const slotIndex = Number(action.payload?.slotIndex);
    this.containerContentPresenter.setHoveredSlotIndex(
      Number.isInteger(slotIndex) ? slotIndex : null,
    );
  }

  private updateMousePosition = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.mouseScreenPosition = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };
}

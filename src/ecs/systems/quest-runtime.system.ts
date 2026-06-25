import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { UIHitTest } from "../../ui/input/ui-hit-test.js";
import { QUEST_UI_ACTION } from "../../ui/input/quest-ui-actions.js";
import { QuestPresenter } from "../../ui/presenters/quest.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS,
} from "../../ui/style/inventory-overlay-skin-map.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonState,
  UIButtonVariant,
} from "../../ui/style/ui-button-config.js";
import type { QuestSlotViewModel } from "../../ui/view-models/quest.view-model.js";
import {
  QUEST_SCREEN_NODE_IDS,
} from "../../ui/screens/node-ids/quest-screen-node-ids.js";
import type { QuestItemPlacementSource } from "../components/states/quest-state.js";
import { ISystem } from "./system.interface.js";

type UIScreenPosition = {
  x: number;
  y: number;
};

export class QuestRuntimeSystem implements ISystem {
  private canvas: HTMLCanvasElement;
  private mouseScreenPosition: UIScreenPosition | null = null;
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private questPresenter: QuestPresenter,
  ) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("QuestRuntimeSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.canvas.addEventListener("mousemove", this.updateMousePosition);
    this.canvas.addEventListener("mouseleave", this.clearMousePosition);
  }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(QUEST_SCREEN_NODE_IDS.root);

    if (!rootNode) {
      return;
    }

    this.syncHoveredSlotFromMouse();

    const binder = this.getBinder();
    const viewModel = this.questPresenter.buildViewModel();

    binder.patchText(QUEST_SCREEN_NODE_IDS.quest.title, {
      text: viewModel.quest.titleText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.quest.type, {
      text: viewModel.quest.typeText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.quest.objectives, {
      text: viewModel.quest.objectivesText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.quest.bestSources, {
      text: viewModel.quest.bestSourcesText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.quest.rewards, {
      text: viewModel.quest.rewardsText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.quest.status, {
      text: viewModel.statusText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.mainActionButton, {
      text: viewModel.mainActionButtonText,
    });
    this.applyButtonState(
      QUEST_SCREEN_NODE_IDS.mainActionButton,
      UIButtonVariant.PROMINENT,
      viewModel.mainActionButtonState,
    );
    binder.patchInteraction(QUEST_SCREEN_NODE_IDS.mainActionButton, {
      disabled: viewModel.mainActionButtonDisabled,
    });

    this.patchFinalPreview(viewModel.finalPreview);

    binder.setVisibility(QUEST_SCREEN_NODE_IDS.delivery.popup, viewModel.deliveryPopupVisible);
    binder.patchText(QUEST_SCREEN_NODE_IDS.hoveredItemName, {
      text: viewModel.hoveredItemName,
    });

    this.applyButtonState(
      QUEST_SCREEN_NODE_IDS.tabs.campStorage,
      UIButtonVariant.TAB,
      viewModel.tabs[0].buttonState,
    );
    this.applyButtonState(
      QUEST_SCREEN_NODE_IDS.tabs.backpack,
      UIButtonVariant.TAB,
      viewModel.tabs[1].buttonState,
    );

    binder.setVisibility(QUEST_SCREEN_NODE_IDS.storageFrame, viewModel.storageFrameVisible);
    binder.patchLayout(QUEST_SCREEN_NODE_IDS.storageFrame, {
      height: viewModel.storageFrameHeight,
      width: viewModel.storageFrameWidth,
    });
    binder.patchSprite(QUEST_SCREEN_NODE_IDS.storageFrame, {
      height: viewModel.storageFrameHeight,
      width: viewModel.storageFrameWidth,
    });

    binder.setVisibility(QUEST_SCREEN_NODE_IDS.inventoryFrame, viewModel.inventoryFrameVisible);
    binder.patchLayout(QUEST_SCREEN_NODE_IDS.inventoryFrame, {
      height: viewModel.inventoryFrameHeight,
      width: viewModel.inventoryFrameWidth,
    });
    binder.patchSprite(QUEST_SCREEN_NODE_IDS.inventoryFrame, {
      height: viewModel.inventoryFrameHeight,
      width: viewModel.inventoryFrameWidth,
    });

    binder.patchLayout(QUEST_SCREEN_NODE_IDS.delivery.frame, {
      height: viewModel.deliveryFrameHeight,
      width: viewModel.deliveryFrameWidth,
    });
    binder.patchSprite(QUEST_SCREEN_NODE_IDS.delivery.frame, {
      height: viewModel.deliveryFrameHeight,
      width: viewModel.deliveryFrameWidth,
    });

    for (const slotViewModel of viewModel.storageSlots) {
      this.patchSlot(
        QUEST_SCREEN_NODE_IDS.storageSlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    const visibleInventorySlotIndexes = new Set<number>();

    for (const slotViewModel of viewModel.inventorySlots) {
      visibleInventorySlotIndexes.add(slotViewModel.slotIndex);
      this.patchSlot(
        QUEST_SCREEN_NODE_IDS.inventorySlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    this.hideUnusedInventorySlots(visibleInventorySlotIndexes);

    for (const slotViewModel of viewModel.deliverySlots) {
      this.patchSlot(
        QUEST_SCREEN_NODE_IDS.deliverySlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    this.patchDragVisual(viewModel.dragVisual);
    this.uiRuntime.relayout();
  }

  private applyButtonState(
    nodeId: string,
    buttonVariant: UIButtonVariant,
    buttonState: UIButtonState,
  ): void {
    const binder = this.getBinder();

    binder.patchInteraction(nodeId, {
      disabled: buttonState === UIButtonState.DISABLED,
    });
    binder.patchSprite(nodeId, {
      spriteName: UI_BUTTON_CONFIG[buttonVariant].states[buttonState].spriteName,
    });
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

  private hideUnusedInventorySlots(visibleSlotIndexes: Set<number>): void {
    const binder = this.getBinder();

    for (let slotIndex = 0; slotIndex < INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS; slotIndex++) {
      if (visibleSlotIndexes.has(slotIndex)) {
        continue;
      }

      binder.setVisibility(QUEST_SCREEN_NODE_IDS.inventorySlot(slotIndex).root, false);
    }
  }

  private isItemPlacementSource(
    value: string | undefined,
  ): value is QuestItemPlacementSource {
    return value === "storage" || value === "inventory" || value === "delivery";
  }

  private patchDragVisual(
    dragVisual: ReturnType<QuestPresenter["buildViewModel"]>["dragVisual"],
  ): void {
    const binder = this.getBinder();

    binder.setVisibility(QUEST_SCREEN_NODE_IDS.dragVisual.root, dragVisual.visible);
    binder.patchLayout(QUEST_SCREEN_NODE_IDS.dragVisual.root, {
      offsetX: dragVisual.x,
      offsetY: dragVisual.y,
    });
    binder.setVisibility(QUEST_SCREEN_NODE_IDS.dragVisual.icon, dragVisual.iconVisible);
    binder.patchSprite(QUEST_SCREEN_NODE_IDS.dragVisual.icon, {
      height: dragVisual.iconHeight,
      spriteName: dragVisual.iconSpriteName,
      spriteSheetName: dragVisual.iconSpriteSheetName,
      width: dragVisual.iconWidth,
    });
    binder.setVisibility(QUEST_SCREEN_NODE_IDS.dragVisual.label, dragVisual.labelVisible);
    binder.patchText(QUEST_SCREEN_NODE_IDS.dragVisual.label, {
      text: dragVisual.labelText,
    });
    binder.setVisibility(QUEST_SCREEN_NODE_IDS.dragVisual.quantity, dragVisual.quantityVisible);
    binder.patchText(QUEST_SCREEN_NODE_IDS.dragVisual.quantity, {
      text: dragVisual.amountText,
    });
  }

  private patchFinalPreview(
    finalPreview: ReturnType<QuestPresenter["buildViewModel"]>["finalPreview"],
  ): void {
    const binder = this.getBinder();

    binder.setVisibility(QUEST_SCREEN_NODE_IDS.finalPreview.root, finalPreview !== null);

    if (!finalPreview) {
      return;
    }

    binder.patchText(QUEST_SCREEN_NODE_IDS.finalPreview.title, {
      text: finalPreview.titleText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.finalPreview.type, {
      text: finalPreview.typeText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.finalPreview.objectives, {
      text: finalPreview.objectivesText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.finalPreview.bestSources, {
      text: finalPreview.bestSourcesText,
    });
    binder.patchText(QUEST_SCREEN_NODE_IDS.finalPreview.rewards, {
      text: finalPreview.rewardsText,
    });
  }

  private patchSlot(
    nodeIds: ReturnType<typeof QUEST_SCREEN_NODE_IDS.storageSlot>,
    slotViewModel: QuestSlotViewModel,
  ): void {
    const binder = this.getBinder();

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

  private syncHoveredSlotFromMouse(): void {
    if (!this.mouseScreenPosition) {
      this.questPresenter.setHoveredSlot(null, null);
      return;
    }

    const action = new UIHitTest(this.uiRuntime.getDocument()).pickAction(this.mouseScreenPosition);

    if (action?.type !== QUEST_UI_ACTION.ITEM_PLACEMENT_BIND
      || !this.isItemPlacementSource(action.payload?.source)) {
      this.questPresenter.setHoveredSlot(null, null);
      return;
    }

    const slotIndex = Number(action.payload?.slotIndex);
    this.questPresenter.setHoveredSlot(
      action.payload.source,
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

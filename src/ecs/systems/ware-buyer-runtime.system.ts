import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { UIHitTest } from "../../ui/input/ui-hit-test.js";
import { WareBuyerPresenter } from "../../ui/presenters/ware-buyer.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  WARE_BUYER_SOURCE_TAB,
  type WareBuyerItemPlacementSource,
} from "../components/states/ware-buyer-state.js";
import { INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS } from "../../ui/style/inventory-overlay-skin-map.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonState,
  UIButtonVariant,
} from "../../ui/style/ui-button-config.js";
import type { WareBuyerSlotViewModel } from "../../ui/view-models/ware-buyer.view-model.js";
import { WARE_BUYER_UI_ACTION } from "../../ui/input/ware-buyer-ui-actions.js";
import { WARE_BUYER_NODE_IDS } from "../../ui/screens/node-ids/ware-buyer-node-ids.js";
import { ISystem } from "./system.interface.js";

type UIScreenPosition = {
  x: number;
  y: number;
};

export class WareBuyerRuntimeSystem implements ISystem {
  private canvas: HTMLCanvasElement;
  private mouseScreenPosition: UIScreenPosition | null = null;
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private wareBuyerPresenter: WareBuyerPresenter,
  ) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("WareBuyerRuntimeSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.canvas.addEventListener("mousemove", this.updateMousePosition);
    this.canvas.addEventListener("mouseleave", this.clearMousePosition);
  }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(WARE_BUYER_NODE_IDS.root);

    if (!rootNode) {
      return;
    }

    this.syncHoveredSlotFromMouse();

    const binder = this.getBinder();
    const viewModel = this.wareBuyerPresenter.buildViewModel();

    binder.patchText(WARE_BUYER_NODE_IDS.hoveredItemName, {
      text: viewModel.hoveredItemName,
    });
    binder.patchText(WARE_BUYER_NODE_IDS.totalValue, {
      text: viewModel.totalValueText,
    });

    this.applyButtonState(
      WARE_BUYER_NODE_IDS.tabs.campStorage,
      UIButtonVariant.TAB,
      viewModel.tabs[0].buttonState,
    );
    this.applyButtonState(
      WARE_BUYER_NODE_IDS.tabs.backpack,
      UIButtonVariant.TAB,
      viewModel.tabs[1].buttonState,
    );
    this.applyButtonState(
      WARE_BUYER_NODE_IDS.sellButton,
      UIButtonVariant.PROMINENT,
      viewModel.sellButtonDisabled ? UIButtonState.DISABLED : UIButtonState.NORMAL,
    );

    binder.setVisibility(WARE_BUYER_NODE_IDS.storageFrame, viewModel.storageFrameVisible);
    binder.patchLayout(WARE_BUYER_NODE_IDS.storageFrame, {
      height: viewModel.storageFrameHeight,
      width: viewModel.storageFrameWidth,
    });
    binder.patchSprite(WARE_BUYER_NODE_IDS.storageFrame, {
      height: viewModel.storageFrameHeight,
      width: viewModel.storageFrameWidth,
    });

    binder.setVisibility(WARE_BUYER_NODE_IDS.inventoryFrame, viewModel.inventoryFrameVisible);
    binder.patchLayout(WARE_BUYER_NODE_IDS.inventoryFrame, {
      height: viewModel.inventoryFrameHeight,
      width: viewModel.inventoryFrameWidth,
    });
    binder.patchSprite(WARE_BUYER_NODE_IDS.inventoryFrame, {
      height: viewModel.inventoryFrameHeight,
      width: viewModel.inventoryFrameWidth,
    });

    binder.patchLayout(WARE_BUYER_NODE_IDS.saleFrame, {
      height: viewModel.saleFrameHeight,
      width: viewModel.saleFrameWidth,
    });
    binder.patchSprite(WARE_BUYER_NODE_IDS.saleFrame, {
      height: viewModel.saleFrameHeight,
      width: viewModel.saleFrameWidth,
    });

    for (const slotViewModel of viewModel.storageSlots) {
      this.patchSlot(
        WARE_BUYER_NODE_IDS.storageSlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    const visibleInventorySlotIndexes = new Set<number>();

    for (const slotViewModel of viewModel.inventorySlots) {
      visibleInventorySlotIndexes.add(slotViewModel.slotIndex);
      this.patchSlot(
        WARE_BUYER_NODE_IDS.inventorySlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    this.hideUnusedInventorySlots(visibleInventorySlotIndexes);

    for (const slotViewModel of viewModel.saleSlots) {
      this.patchSlot(
        WARE_BUYER_NODE_IDS.saleSlot(slotViewModel.slotIndex),
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

      binder.setVisibility(WARE_BUYER_NODE_IDS.inventorySlot(slotIndex).root, false);
    }
  }

  private isItemPlacementSource(
    value: string | undefined,
  ): value is WareBuyerItemPlacementSource {
    return value === "storage" || value === "inventory" || value === "sale";
  }

  private patchDragVisual(
    dragVisual: ReturnType<WareBuyerPresenter["buildViewModel"]>["dragVisual"],
  ): void {
    const binder = this.getBinder();

    binder.setVisibility(WARE_BUYER_NODE_IDS.dragVisual.root, dragVisual.visible);
    binder.patchLayout(WARE_BUYER_NODE_IDS.dragVisual.root, {
      offsetX: dragVisual.x,
      offsetY: dragVisual.y,
    });
    binder.setVisibility(WARE_BUYER_NODE_IDS.dragVisual.icon, dragVisual.iconVisible);
    binder.patchSprite(WARE_BUYER_NODE_IDS.dragVisual.icon, {
      height: dragVisual.iconHeight,
      spriteName: dragVisual.iconSpriteName,
      spriteSheetName: dragVisual.iconSpriteSheetName,
      width: dragVisual.iconWidth,
    });
    binder.setVisibility(WARE_BUYER_NODE_IDS.dragVisual.label, dragVisual.labelVisible);
    binder.patchText(WARE_BUYER_NODE_IDS.dragVisual.label, {
      text: dragVisual.labelText,
    });
    binder.setVisibility(WARE_BUYER_NODE_IDS.dragVisual.quantity, dragVisual.quantityVisible);
    binder.patchText(WARE_BUYER_NODE_IDS.dragVisual.quantity, {
      text: dragVisual.amountText,
    });
  }

  private patchSlot(
    nodeIds: ReturnType<typeof WARE_BUYER_NODE_IDS.storageSlot>,
    slotViewModel: WareBuyerSlotViewModel,
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
      this.wareBuyerPresenter.setHoveredSlot(null, null);
      return;
    }

    const action = new UIHitTest(this.uiRuntime.getDocument()).pickAction(this.mouseScreenPosition);

    if (action?.type !== WARE_BUYER_UI_ACTION.ITEM_PLACEMENT_BIND
      || !this.isItemPlacementSource(action.payload?.source)) {
      this.wareBuyerPresenter.setHoveredSlot(null, null);
      return;
    }

    const slotIndex = Number(action.payload?.slotIndex);
    this.wareBuyerPresenter.setHoveredSlot(
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

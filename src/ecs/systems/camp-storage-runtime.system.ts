import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { CAMP_STORAGE_UI_ACTION } from "../../ui/input/camp-storage-ui-actions.js";
import { UIHitTest } from "../../ui/input/ui-hit-test.js";
import { CampStoragePresenter } from "../../ui/presenters/camp-storage.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  CAMP_STORAGE_NODE_IDS,
} from "../../ui/screens/node-ids/camp-storage-node-ids.js";
import type { CampStorageItemPlacementSource } from "../components/states/camp-storage-state.js";
import { INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS } from "../../ui/style/inventory-overlay-skin-map.js";
import type { CampStorageSlotViewModel } from "../../ui/view-models/camp-storage.view-model.js";
import { ISystem } from "./system.interface.js";

type UIScreenPosition = {
  x: number;
  y: number;
};

export class CampStorageRuntimeSystem implements ISystem {
  private canvas: HTMLCanvasElement;
  private mouseScreenPosition: UIScreenPosition | null = null;
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private campStoragePresenter: CampStoragePresenter,
  ) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("CampStorageRuntimeSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.canvas.addEventListener("mousemove", this.updateMousePosition);
    this.canvas.addEventListener("mouseleave", this.clearMousePosition);
  }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(CAMP_STORAGE_NODE_IDS.root);

    if (!rootNode) {
      return;
    }

    this.syncHoveredSlotFromMouse();

    const binder = this.getBinder();
    const viewModel = this.campStoragePresenter.buildViewModel();

    binder.patchText(CAMP_STORAGE_NODE_IDS.hoveredItemName, {
      text: viewModel.hoveredItemName,
    });
    binder.patchLayout(CAMP_STORAGE_NODE_IDS.storageFrame, {
      height: viewModel.storageFrameHeight,
      width: viewModel.storageFrameWidth,
    });
    binder.patchSprite(CAMP_STORAGE_NODE_IDS.storageFrame, {
      height: viewModel.storageFrameHeight,
      width: viewModel.storageFrameWidth,
    });
    binder.patchLayout(CAMP_STORAGE_NODE_IDS.inventoryFrame, {
      height: viewModel.inventoryFrameHeight,
      width: viewModel.inventoryFrameWidth,
    });
    binder.patchSprite(CAMP_STORAGE_NODE_IDS.inventoryFrame, {
      height: viewModel.inventoryFrameHeight,
      width: viewModel.inventoryFrameWidth,
    });

    for (const slotViewModel of viewModel.storageSlots) {
      this.patchSlot(
        CAMP_STORAGE_NODE_IDS.storageSlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    const visibleInventorySlotIndexes = new Set<number>();

    for (const slotViewModel of viewModel.inventorySlots) {
      visibleInventorySlotIndexes.add(slotViewModel.slotIndex);
      this.patchSlot(
        CAMP_STORAGE_NODE_IDS.inventorySlot(slotViewModel.slotIndex),
        slotViewModel,
      );
    }

    this.hideUnusedInventorySlots(visibleInventorySlotIndexes);
    this.patchDragVisual(viewModel.dragVisual);
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

  private hideUnusedInventorySlots(visibleSlotIndexes: Set<number>): void {
    const binder = this.getBinder();

    for (let slotIndex = 0; slotIndex < INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS; slotIndex++) {
      if (visibleSlotIndexes.has(slotIndex)) {
        continue;
      }

      binder.setVisibility(CAMP_STORAGE_NODE_IDS.inventorySlot(slotIndex).root, false);
    }
  }

  private isItemPlacementSource(
    value: string | undefined,
  ): value is CampStorageItemPlacementSource {
    return value === "storage" || value === "inventory";
  }

  private patchDragVisual(
    dragVisual: ReturnType<CampStoragePresenter["buildViewModel"]>["dragVisual"],
  ): void {
    const binder = this.getBinder();

    binder.setVisibility(CAMP_STORAGE_NODE_IDS.dragVisual.root, dragVisual.visible);
    binder.patchLayout(CAMP_STORAGE_NODE_IDS.dragVisual.root, {
      offsetX: dragVisual.x,
      offsetY: dragVisual.y,
    });
    binder.setVisibility(CAMP_STORAGE_NODE_IDS.dragVisual.icon, dragVisual.iconVisible);
    binder.patchSprite(CAMP_STORAGE_NODE_IDS.dragVisual.icon, {
      height: dragVisual.iconHeight,
      spriteName: dragVisual.iconSpriteName,
      spriteSheetName: dragVisual.iconSpriteSheetName,
      width: dragVisual.iconWidth,
    });
    binder.setVisibility(CAMP_STORAGE_NODE_IDS.dragVisual.label, dragVisual.labelVisible);
    binder.patchText(CAMP_STORAGE_NODE_IDS.dragVisual.label, {
      text: dragVisual.labelText,
    });
    binder.setVisibility(CAMP_STORAGE_NODE_IDS.dragVisual.quantity, dragVisual.quantityVisible);
    binder.patchText(CAMP_STORAGE_NODE_IDS.dragVisual.quantity, {
      text: dragVisual.amountText,
    });
  }

  private patchSlot(
    nodeIds: ReturnType<typeof CAMP_STORAGE_NODE_IDS.storageSlot>,
    slotViewModel: CampStorageSlotViewModel,
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
      this.campStoragePresenter.setHoveredSlot(null, null);
      return;
    }

    const action = new UIHitTest(this.uiRuntime.getDocument()).pickAction(this.mouseScreenPosition);

    if (action?.type !== CAMP_STORAGE_UI_ACTION.ITEM_PLACEMENT_BIND
      || !this.isItemPlacementSource(action.payload?.source)) {
      this.campStoragePresenter.setHoveredSlot(null, null);
      return;
    }

    const slotIndex = Number(action.payload?.slotIndex);
    this.campStoragePresenter.setHoveredSlot(
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

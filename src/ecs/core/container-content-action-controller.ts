import {
  CONTAINER_CONTENT_UI_ACTION,
  type ItemPlacementBindSource,
} from "../../ui/input/container-content-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { ChoicesOverlayPresenter } from "../../ui/presenters/choices-overlay.presenter.js";
import { ContainerContentPresenter } from "../../ui/presenters/container-content.presenter.js";
import { InventoryOverlayPresenter } from "../../ui/presenters/inventory-overlay.presenter.js";

export class ContainerContentActionController implements UIActionHandler {
  constructor(
    private containerContentPresenter: ContainerContentPresenter,
    private inventoryOverlayPresenter: InventoryOverlayPresenter,
    private choicesOverlayPresenter: ChoicesOverlayPresenter,
    private closeContainerContentOverlay: () => void,
    private openChoicesOverlay: () => void,
    private closeChoicesOverlay: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case CONTAINER_CONTENT_UI_ACTION.CLOSE:
        if (this.isPointerDownAction(action)) {
          this.closeContainerContent();
        }
        return true;

      case CONTAINER_CONTENT_UI_ACTION.TAKE_ALL:
        if (this.isPointerDownAction(action) && this.containerContentPresenter.takeAllItems()) {
          this.closeContainerContent();
        }
        return true;

      case CONTAINER_CONTENT_UI_ACTION.ITEM_PLACEMENT_BIND:
        return this.handleItemPlacementBind(action);

      default:
        return false;
    }
  }

  private closeContainerContent(): void {
    this.choicesOverlayPresenter.close();
    this.closeChoicesOverlay();
    this.closeContainerContentOverlay();
  }

  private clearDrag(): void {
    this.containerContentPresenter.clearItemDrag();
    this.inventoryOverlayPresenter.setDraggedBackpackSlotIndex(null);
  }

  private finishDrag(targetSource: ItemPlacementBindSource, targetSlotIndex: number): void {
    const drag = this.containerContentPresenter.getActiveItemDrag();

    if (!drag) {
      return;
    }

    if (targetSource === "container") {
      if (drag.source === "container") {
        this.containerContentPresenter.moveContainerSlot(drag.slotIndex, targetSlotIndex);
      } else if (this.containerContentPresenter.isContainerSlotEmpty(targetSlotIndex)) {
        const lootSlot = this.inventoryOverlayPresenter.getBackpackSlotLootSlot(drag.slotIndex);

        if (lootSlot) {
          const removedLootSlot = this.inventoryOverlayPresenter.removeBackpackSlotItem(drag.slotIndex);

          if (removedLootSlot
            && !this.containerContentPresenter.placeLootSlotInContainer(targetSlotIndex, removedLootSlot)) {
            this.inventoryOverlayPresenter.addLootItemToBackpackSlot(
              removedLootSlot.itemId,
              removedLootSlot.amount,
              drag.slotIndex,
            );
          }
        }
      }
    } else if (drag.source === "container") {
      this.containerContentPresenter.takeContainerSlotToInventorySlot(
        drag.slotIndex,
        targetSlotIndex,
        this.inventoryOverlayPresenter,
      );
    } else {
      this.inventoryOverlayPresenter.moveBackpackSlot(drag.slotIndex, targetSlotIndex);
    }

    this.clearDrag();
  }

  private handleItemPlacementBind(action: UIAction): boolean {
    const slotIndex = Number(action.payload?.slotIndex);
    const source = action.payload?.source;

    if (!Number.isInteger(slotIndex) || !this.isItemPlacementBindSource(source)) {
      return false;
    }

    switch (action.payload?.pointerEvent) {
      case "double-click":
        if (source === "container") {
          this.clearDrag();
          this.containerContentPresenter.takeContainerSlotToInventory(slotIndex);
        }
        return true;

      case "pointer-cancel":
        this.clearDrag();
        return true;

      case "pointer-down":
        if (action.payload?.mouseButton === "2") {
          return this.openItemChoicesOverlay(source, slotIndex, action);
        }

        this.choicesOverlayPresenter.close();
        this.closeChoicesOverlay();
        return this.startDrag(source, slotIndex, action);

      case "pointer-move":
        this.updateDragPointer(action);
        return true;

      case "pointer-up":
        this.finishDrag(source, slotIndex);
        return true;

      default:
        this.containerContentPresenter.activateSlot(
          slotIndex,
          action.payload?.mouseButton ?? null,
        );
        return true;
    }
  }

  private isItemPlacementBindSource(value: string | undefined): value is ItemPlacementBindSource {
    return value === "container" || value === "inventory";
  }

  private isPointerDownAction(action: UIAction): boolean {
    return !action.payload?.pointerEvent || action.payload.pointerEvent === "pointer-down";
  }

  private startDrag(
    source: ItemPlacementBindSource,
    slotIndex: number,
    action: UIAction,
  ): boolean {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);
    const lootSlot = source === "container"
      ? this.containerContentPresenter.getContainerSlotLootSlot(slotIndex)
      : this.inventoryOverlayPresenter.getBackpackSlotLootSlot(slotIndex);

    if (!lootSlot || !Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
      this.clearDrag();
      return true;
    }

    this.containerContentPresenter.beginItemDrag(
      source,
      slotIndex,
      lootSlot,
      pointerX,
      pointerY,
    );
    this.inventoryOverlayPresenter.setDraggedBackpackSlotIndex(
      source === "inventory" ? slotIndex : null,
    );
    return true;
  }

  private openItemChoicesOverlay(
    source: ItemPlacementBindSource,
    slotIndex: number,
    action: UIAction,
  ): boolean {
    this.clearDrag();

    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);
    const lootSlot = source === "container"
      ? this.containerContentPresenter.getContainerSlotLootSlot(slotIndex)
      : this.inventoryOverlayPresenter.getBackpackSlotLootSlot(slotIndex);

    if (!lootSlot || !Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
      this.choicesOverlayPresenter.close();
      this.closeChoicesOverlay();
      return true;
    }

    if (this.choicesOverlayPresenter.open({
      itemId: lootSlot.itemId,
      slotIndex,
      source,
      x: pointerX,
      y: pointerY,
    })) {
      this.openChoicesOverlay();
    } else {
      this.closeChoicesOverlay();
    }

    return true;
  }

  private updateDragPointer(action: UIAction): void {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);

    if (!Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
      return;
    }

    this.containerContentPresenter.setItemDragPointer(pointerX, pointerY);
  }
}

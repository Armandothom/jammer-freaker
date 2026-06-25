import {
  WARE_BUYER_SOURCE_TAB,
  type WareBuyerItemPlacementSource,
  type WareBuyerSourceTab,
  WareBuyerState,
} from "../components/states/ware-buyer-state.js";
import {
  WARE_BUYER_UI_ACTION,
} from "../../ui/input/ware-buyer-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";

export class WareBuyerActionController implements UIActionHandler {
  constructor(
    private wareBuyerState: WareBuyerState,
    private requestShopHubState: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case WARE_BUYER_UI_ACTION.RETURN_TO_HUB:
        if (this.isPointerDownAction(action)) {
          this.requestShopHubState();
        }
        return true;

      case WARE_BUYER_UI_ACTION.SELECT_SOURCE_TAB:
        if (this.isPointerDownAction(action)) {
          this.selectSourceTab(action.payload?.tab);
        }
        return true;

      case WARE_BUYER_UI_ACTION.SELL_ITEMS:
        if (this.isPointerDownAction(action)) {
          this.wareBuyerState.sellItems();
        }
        return true;

      case WARE_BUYER_UI_ACTION.ITEM_PLACEMENT_BIND:
        return this.handleItemPlacementBind(action);

      default:
        return false;
    }
  }

  private handleItemPlacementBind(action: UIAction): boolean {
    const slotIndex = Number(action.payload?.slotIndex);
    const source = action.payload?.source;

    if (!Number.isInteger(slotIndex) || !this.isItemPlacementSource(source)) {
      return false;
    }

    switch (action.payload?.pointerEvent) {
      case "double-click":
        this.wareBuyerState.clearItemDrag();
        this.wareBuyerState.transferSlot(source, slotIndex);
        return true;

      case "pointer-cancel":
        this.wareBuyerState.clearItemDrag();
        return true;

      case "pointer-down":
        if (action.payload?.mouseButton === "2") {
          this.wareBuyerState.clearItemDrag();
          this.wareBuyerState.activateSlot(source, slotIndex);
          return true;
        }

        return this.startDrag(source, slotIndex, action);

      case "pointer-move":
        this.updateDragPointer(action);
        return true;

      case "pointer-up":
        this.wareBuyerState.finishDrag(source, slotIndex);
        return true;

      default:
        this.wareBuyerState.activateSlot(source, slotIndex);
        return true;
    }
  }

  private isItemPlacementSource(
    value: string | undefined,
  ): value is WareBuyerItemPlacementSource {
    return value === "storage" || value === "inventory" || value === "sale";
  }

  private isPointerDownAction(action: UIAction): boolean {
    return !action.payload?.pointerEvent || action.payload.pointerEvent === "pointer-down";
  }

  private isSourceTab(value: string | undefined): value is WareBuyerSourceTab {
    return value === WARE_BUYER_SOURCE_TAB.CAMP_STORAGE
      || value === WARE_BUYER_SOURCE_TAB.BACKPACK;
  }

  private selectSourceTab(value: string | undefined): void {
    if (!this.isSourceTab(value)) {
      return;
    }

    this.wareBuyerState.selectSourceTab(value);
  }

  private startDrag(
    source: WareBuyerItemPlacementSource,
    slotIndex: number,
    action: UIAction,
  ): boolean {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);

    this.wareBuyerState.beginItemDrag(
      source,
      slotIndex,
      pointerX,
      pointerY,
    );
    return true;
  }

  private updateDragPointer(action: UIAction): void {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);

    if (!Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
      return;
    }

    this.wareBuyerState.setItemDragPointer(pointerX, pointerY);
  }
}

import {
  CAMP_STORAGE_UI_ACTION,
} from "../../ui/input/camp-storage-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import {
  CampStorageState,
  type CampStorageItemPlacementSource,
} from "../components/states/camp-storage-state.js";

export class CampStorageActionController implements UIActionHandler {
  constructor(
    private campStorageState: CampStorageState,
    private requestShopHubState: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case CAMP_STORAGE_UI_ACTION.RETURN_TO_HUB:
        if (this.isPointerDownAction(action)) {
          this.requestShopHubState();
        }
        return true;

      case CAMP_STORAGE_UI_ACTION.ITEM_PLACEMENT_BIND:
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
        this.campStorageState.clearItemDrag();
        this.campStorageState.transferSlot(source, slotIndex);
        return true;

      case "pointer-cancel":
        this.campStorageState.clearItemDrag();
        return true;

      case "pointer-down":
        if (action.payload?.mouseButton === "2") {
          this.campStorageState.clearItemDrag();
          this.campStorageState.activateSlot(source, slotIndex);
          return true;
        }

        return this.startDrag(source, slotIndex, action);

      case "pointer-move":
        this.updateDragPointer(action);
        return true;

      case "pointer-up":
        this.campStorageState.finishDrag(source, slotIndex);
        return true;

      default:
        this.campStorageState.activateSlot(source, slotIndex);
        return true;
    }
  }

  private isItemPlacementSource(
    value: string | undefined,
  ): value is CampStorageItemPlacementSource {
    return value === "storage" || value === "inventory";
  }

  private isPointerDownAction(action: UIAction): boolean {
    return !action.payload?.pointerEvent || action.payload.pointerEvent === "pointer-down";
  }

  private startDrag(
    source: CampStorageItemPlacementSource,
    slotIndex: number,
    action: UIAction,
  ): boolean {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);

    this.campStorageState.beginItemDrag(
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

    this.campStorageState.setItemDragPointer(pointerX, pointerY);
  }
}

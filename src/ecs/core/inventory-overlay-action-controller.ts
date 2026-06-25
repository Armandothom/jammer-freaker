import { INVENTORY_OVERLAY_UI_ACTION } from "../../ui/input/inventory-overlay-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { InventoryOverlayPresenter } from "../../ui/presenters/inventory-overlay.presenter.js";
import {
    INVENTORY_OVERLAY_TAB,
    type InventoryOverlayTab,
} from "../../ui/view-models/inventory-overlay.view-model.js";

export class InventoryOverlayActionController implements UIActionHandler {
    constructor(private inventoryOverlayPresenter: InventoryOverlayPresenter) { }

    public handle(action: UIAction): boolean {
        if (action.type !== INVENTORY_OVERLAY_UI_ACTION.SELECT_TAB) {
            return false;
        }

        if (this.isPointerDownAction(action) && this.isInventoryOverlayTab(action.payload?.tab)) {
            this.inventoryOverlayPresenter.selectTab(action.payload.tab);
        }

        return true;
    }

    private isInventoryOverlayTab(value: string | undefined): value is InventoryOverlayTab {
        return value === INVENTORY_OVERLAY_TAB.INVENTORY
            || value === INVENTORY_OVERLAY_TAB.QUESTS;
    }

    private isPointerDownAction(action: UIAction): boolean {
        return !action.payload?.pointerEvent || action.payload.pointerEvent === "pointer-down";
    }
}

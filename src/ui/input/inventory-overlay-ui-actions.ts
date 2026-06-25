import type { InventoryOverlayTab } from "../view-models/inventory-overlay.view-model.js";
import type { UIAction } from "./ui-action.js";

export const INVENTORY_OVERLAY_UI_ACTION = {
  SELECT_TAB: "inventory-overlay.select-tab",
} as const;

export function createSelectInventoryOverlayTabAction(tab: InventoryOverlayTab): UIAction {
  return {
    payload: {
      tab,
    },
    type: INVENTORY_OVERLAY_UI_ACTION.SELECT_TAB,
  };
}

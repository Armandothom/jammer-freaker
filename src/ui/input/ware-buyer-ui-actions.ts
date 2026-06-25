import type {
  WareBuyerItemPlacementSource,
  WareBuyerSourceTab,
} from "../../ecs/components/states/ware-buyer-state.js";
import type { UIAction } from "./ui-action.js";

export const WARE_BUYER_UI_ACTION = {
  ITEM_PLACEMENT_BIND: "ware-buyer.item-placement-bind",
  RETURN_TO_HUB: "ware-buyer.return-to-hub",
  SELECT_SOURCE_TAB: "ware-buyer.select-source-tab",
  SELL_ITEMS: "ware-buyer.sell-items",
} as const;

export function createReturnFromWareBuyerToHubAction(): UIAction {
  return {
    type: WARE_BUYER_UI_ACTION.RETURN_TO_HUB,
  };
}

export function createSelectWareBuyerSourceTabAction(tab: WareBuyerSourceTab): UIAction {
  return {
    payload: {
      tab,
    },
    type: WARE_BUYER_UI_ACTION.SELECT_SOURCE_TAB,
  };
}

export function createWareBuyerItemPlacementBindAction(
  source: WareBuyerItemPlacementSource,
  slotIndex: number,
): UIAction {
  return {
    payload: {
      placementBind: "true",
      slotIndex: `${slotIndex}`,
      source,
    },
    type: WARE_BUYER_UI_ACTION.ITEM_PLACEMENT_BIND,
  };
}

export function createSellWareBuyerItemsAction(): UIAction {
  return {
    type: WARE_BUYER_UI_ACTION.SELL_ITEMS,
  };
}

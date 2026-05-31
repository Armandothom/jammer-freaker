import type { UIAction } from "./ui-action.js";

export const CONTAINER_CONTENT_UI_ACTION = {
  CLOSE: "container-content.close",
  ITEM_PLACEMENT_BIND: "container-content.item-placement-bind",
  TAKE_ALL: "container-content.take-all",
} as const;

export type ItemPlacementBindSource = "container" | "inventory";

export function createCloseContainerContentAction(): UIAction {
  return {
    type: CONTAINER_CONTENT_UI_ACTION.CLOSE,
  };
}

export function createItemPlacementBindAction(
  source: ItemPlacementBindSource,
  slotIndex: number,
): UIAction {
  return {
    payload: {
      placementBind: "true",
      slotIndex: `${slotIndex}`,
      source,
    },
    type: CONTAINER_CONTENT_UI_ACTION.ITEM_PLACEMENT_BIND,
  };
}

export function createTakeAllContainerContentAction(): UIAction {
  return {
    type: CONTAINER_CONTENT_UI_ACTION.TAKE_ALL,
  };
}

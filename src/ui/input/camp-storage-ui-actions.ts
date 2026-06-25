import type { CampStorageItemPlacementSource } from "../../ecs/components/states/camp-storage-state.js";
import type { UIAction } from "./ui-action.js";

export const CAMP_STORAGE_UI_ACTION = {
  ITEM_PLACEMENT_BIND: "camp-storage.item-placement-bind",
  RETURN_TO_HUB: "camp-storage.return-to-hub",
} as const;

export function createCampStorageItemPlacementBindAction(
  source: CampStorageItemPlacementSource,
  slotIndex: number,
): UIAction {
  return {
    payload: {
      placementBind: "true",
      slotIndex: `${slotIndex}`,
      source,
    },
    type: CAMP_STORAGE_UI_ACTION.ITEM_PLACEMENT_BIND,
  };
}

export function createReturnFromCampStorageToHubAction(): UIAction {
  return {
    type: CAMP_STORAGE_UI_ACTION.RETURN_TO_HUB,
  };
}

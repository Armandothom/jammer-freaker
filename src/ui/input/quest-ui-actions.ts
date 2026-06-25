import type {
  QuestItemPlacementSource,
  QuestSourceTab,
} from "../../ecs/components/states/quest-state.js";
import type { QuestTrader } from "../../ecs/components/types/quest-config.js";
import type { UIAction } from "./ui-action.js";

export const QUEST_UI_ACTION = {
  BLOCK_POPUP: "quest.block-popup",
  DELIVER_ITEMS: "quest.deliver-items",
  ITEM_PLACEMENT_BIND: "quest.item-placement-bind",
  OPEN: "quest.open",
  PRIMARY: "quest.primary",
  RETURN_TO_SHOP: "quest.return-to-shop",
  SELECT_SOURCE_TAB: "quest.select-source-tab",
} as const;

export function createBlockQuestPopupAction(): UIAction {
  return {
    type: QUEST_UI_ACTION.BLOCK_POPUP,
  };
}

export function createDeliverQuestItemsAction(): UIAction {
  return {
    type: QUEST_UI_ACTION.DELIVER_ITEMS,
  };
}

export function createOpenQuestScreenAction(trader: QuestTrader): UIAction {
  return {
    payload: {
      trader,
    },
    type: QUEST_UI_ACTION.OPEN,
  };
}

export function createQuestItemPlacementBindAction(
  source: QuestItemPlacementSource,
  slotIndex: number,
): UIAction {
  return {
    payload: {
      placementBind: "true",
      slotIndex: `${slotIndex}`,
      source,
    },
    type: QUEST_UI_ACTION.ITEM_PLACEMENT_BIND,
  };
}

export function createQuestPrimaryAction(): UIAction {
  return {
    type: QUEST_UI_ACTION.PRIMARY,
  };
}

export function createReturnFromQuestToShopAction(): UIAction {
  return {
    type: QUEST_UI_ACTION.RETURN_TO_SHOP,
  };
}

export function createSelectQuestSourceTabAction(tab: QuestSourceTab): UIAction {
  return {
    payload: {
      tab,
    },
    type: QUEST_UI_ACTION.SELECT_SOURCE_TAB,
  };
}

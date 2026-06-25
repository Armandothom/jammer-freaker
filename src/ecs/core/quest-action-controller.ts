import {
  QUEST_SOURCE_TAB,
  type QuestItemPlacementSource,
  type QuestSourceTab,
  QuestState,
} from "../components/states/quest-state.js";
import {
  isQuestTrader,
  type QuestTrader,
} from "../components/types/quest-config.js";
import { QUEST_UI_ACTION } from "../../ui/input/quest-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";

export class QuestActionController implements UIActionHandler {
  constructor(
    private questState: QuestState,
    private requestQuestState: (trader: QuestTrader) => void,
    private requestReturnFromQuestState: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case QUEST_UI_ACTION.BLOCK_POPUP:
        return true;

      case QUEST_UI_ACTION.OPEN:
        return this.handleOpen(action);

      case QUEST_UI_ACTION.PRIMARY:
        if (this.isPointerDownAction(action)) {
          this.questState.submitCurrentQuestAction();
        }
        return true;

      case QUEST_UI_ACTION.RETURN_TO_SHOP:
        if (this.isPointerDownAction(action)) {
          this.requestReturnFromQuestState();
        }
        return true;

      case QUEST_UI_ACTION.SELECT_SOURCE_TAB:
        if (this.isPointerDownAction(action)) {
          this.selectSourceTab(action.payload?.tab);
        }
        return true;

      case QUEST_UI_ACTION.DELIVER_ITEMS:
        if (this.isPointerDownAction(action)) {
          this.questState.submitDeliveryItems();
        }
        return true;

      case QUEST_UI_ACTION.ITEM_PLACEMENT_BIND:
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
        this.questState.clearItemDrag();
        this.questState.transferSlot(source, slotIndex);
        return true;

      case "pointer-cancel":
        this.questState.clearItemDrag();
        return true;

      case "pointer-down":
        if (action.payload?.mouseButton === "2") {
          this.questState.clearItemDrag();
          this.questState.transferSlot(source, slotIndex);
          return true;
        }

        return this.startDrag(source, slotIndex, action);

      case "pointer-move":
        this.updateDragPointer(action);
        return true;

      case "pointer-up":
        this.questState.finishDrag(source, slotIndex);
        return true;

      default:
        this.questState.transferSlot(source, slotIndex);
        return true;
    }
  }

  private handleOpen(action: UIAction): boolean {
    const trader = action.payload?.trader;

    if (!isQuestTrader(trader)) {
      return false;
    }

    this.requestQuestState(trader);
    return true;
  }

  private isItemPlacementSource(
    value: string | undefined,
  ): value is QuestItemPlacementSource {
    return value === "storage" || value === "inventory" || value === "delivery";
  }

  private isPointerDownAction(action: UIAction): boolean {
    return !action.payload?.pointerEvent || action.payload.pointerEvent === "pointer-down";
  }

  private isSourceTab(value: string | undefined): value is QuestSourceTab {
    return value === QUEST_SOURCE_TAB.CAMP_STORAGE
      || value === QUEST_SOURCE_TAB.BACKPACK;
  }

  private selectSourceTab(value: string | undefined): void {
    if (!this.isSourceTab(value)) {
      return;
    }

    this.questState.selectSourceTab(value);
  }

  private startDrag(
    source: QuestItemPlacementSource,
    slotIndex: number,
    action: UIAction,
  ): boolean {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);

    return this.questState.beginItemDrag(
      source,
      slotIndex,
      pointerX,
      pointerY,
    );
  }

  private updateDragPointer(action: UIAction): void {
    const pointerX = Number(action.payload?.pointerX);
    const pointerY = Number(action.payload?.pointerY);

    if (!Number.isFinite(pointerX) || !Number.isFinite(pointerY)) {
      return;
    }

    this.questState.setItemDragPointer(pointerX, pointerY);
  }
}

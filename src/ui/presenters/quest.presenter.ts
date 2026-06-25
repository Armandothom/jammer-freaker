import type { LootContainerLootSlot } from "../../ecs/components/loot-container-content.component.js";
import {
  QUEST_DELIVERY_COLUMN_COUNT,
  QUEST_DELIVERY_ROW_COUNT,
  QUEST_SOURCE_TAB,
  QUEST_STORAGE_COLUMN_COUNT,
  QUEST_STORAGE_MAX_SLOTS,
  QUEST_STORAGE_ROW_COUNT,
  type QuestItemPlacementSource,
  type QuestSourceTab,
  QuestState,
} from "../../ecs/components/states/quest-state.js";
import { InventoryResourceType } from "../../ecs/components/types/inventory-resource-type.js";
import {
  QuestType,
  type QuestConfigEntry,
  type QuestId,
} from "../../ecs/components/types/quest-config.js";
import type { LootTableItemId } from "../../game/world-map/loot/loot-tables.js";
import { getLootSprite } from "../../game/world-map/loot/loot-sprites.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { QUEST_SCREEN_SKIN_MAP } from "../style/quest-screen-skin-map.js";
import { UIButtonState } from "../style/ui-button-config.js";
import type {
  QuestDragVisualViewModel,
  QuestInfoViewModel,
  QuestSlotViewModel,
  QuestTabViewModel,
  QuestViewModel,
} from "../view-models/quest.view-model.js";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US");

export class QuestPresenter {
  constructor(private questState: QuestState) { }

  public buildViewModel(): QuestViewModel {
    const currentQuest = this.questState.getCurrentQuest();
    const activeSourceTab = this.questState.getActiveSourceTab();
    const backpackMaxSlots = this.questState.getBackpackMaxSlots();
    const backpackColumnCount = Math.max(
      1,
      Math.min(backpackMaxSlots || 1, 4),
    );
    const backpackRowCount = Math.max(1, Math.ceil((backpackMaxSlots || 1) / 4));
    const isStarted = this.questState.isCurrentQuestStarted();

    return {
      activeSourceTab,
      deliveryFrameHeight: this.getFrameHeight(QUEST_DELIVERY_ROW_COUNT),
      deliveryFrameWidth: this.getFrameWidth(QUEST_DELIVERY_COLUMN_COUNT),
      deliveryPopupVisible: this.questState.isDeliveryPopupOpen(),
      deliverySlots: this.buildDeliverySlotViewModels(),
      dragVisual: this.buildDragVisualViewModel(),
      finalPreview: this.buildFinalPreviewViewModel(),
      hoveredItemName: this.questState.getHoveredItemName(),
      inventoryFrameHeight: this.getFrameHeight(backpackRowCount),
      inventoryFrameVisible: activeSourceTab === QUEST_SOURCE_TAB.BACKPACK,
      inventoryFrameWidth: this.getFrameWidth(backpackColumnCount),
      inventorySlots: this.buildInventorySlotViewModels(backpackMaxSlots),
      mainActionButtonDisabled: !currentQuest,
      mainActionButtonState: currentQuest
        ? UIButtonState.NORMAL
        : UIButtonState.DISABLED,
      mainActionButtonText: currentQuest
        ? (isStarted ? "Deliver Quest" : "Start Quest")
        : "No Quests",
      quest: currentQuest
        ? this.buildQuestInfoViewModel(currentQuest.id, currentQuest.config)
        : this.buildEmptyQuestInfoViewModel(),
      statusText: currentQuest
        ? `Status: ${isStarted ? "Accepted" : "Available"}`
        : "Status: Complete",
      storageFrameHeight: this.getFrameHeight(QUEST_STORAGE_ROW_COUNT),
      storageFrameVisible: activeSourceTab === QUEST_SOURCE_TAB.CAMP_STORAGE,
      storageFrameWidth: this.getFrameWidth(QUEST_STORAGE_COLUMN_COUNT),
      storageSlots: this.buildStorageSlotViewModels(),
      tabs: this.buildTabViewModels(activeSourceTab),
    };
  }

  public setHoveredSlot(
    source: QuestItemPlacementSource | null,
    slotIndex: number | null,
  ): void {
    this.questState.setHoveredSlot(source, slotIndex);
  }

  private buildDeliverySlotViewModels(): QuestSlotViewModel[] {
    return Array.from({ length: QUEST_DELIVERY_COLUMN_COUNT * QUEST_DELIVERY_ROW_COUNT }, (_value, slotIndex) => {
      const lootSlot = this.questState.getDeliverySlotLootSlot(slotIndex);
      const column = slotIndex % QUEST_DELIVERY_COLUMN_COUNT;
      const row = Math.floor(slotIndex / QUEST_DELIVERY_COLUMN_COUNT);

      return {
        ...this.buildItemVisual(lootSlot, true, "delivery", slotIndex),
        slotIndex,
        visible: true,
        x: column * this.getSlotStrideX(),
        y: row * this.getSlotStrideY(),
      };
    });
  }

  private buildDragVisualViewModel(): QuestDragVisualViewModel {
    const dragState = this.questState.getActiveItemDrag();

    if (!dragState) {
      return {
        amountText: "",
        iconHeight: QUEST_SCREEN_SKIN_MAP.itemIcon.height,
        iconSpriteName: SpriteName.BLANK,
        iconSpriteSheetName: SpriteSheetName.BLANK,
        iconVisible: false,
        iconWidth: QUEST_SCREEN_SKIN_MAP.itemIcon.width,
        labelText: "",
        labelVisible: false,
        quantityVisible: false,
        visible: false,
        x: 0,
        y: 0,
      };
    }

    const itemVisual = this.buildItemVisual(
      dragState.item,
      false,
      dragState.source,
      dragState.slotIndex,
    );

    return {
      ...itemVisual,
      visible: true,
      x: Math.round(dragState.pointerX - (QUEST_SCREEN_SKIN_MAP.itemSlot.width / 2)),
      y: Math.round(dragState.pointerY - (QUEST_SCREEN_SKIN_MAP.itemSlot.height / 2)),
    };
  }

  private buildEmptyQuestInfoViewModel(): QuestInfoViewModel {
    return {
      bestSourcesText: "Best Sources: -",
      objectivesText: "Objectives:\nAll quests are complete.",
      rewardsText: "Rewards: -",
      titleText: `${this.questState.getActiveTrader()} Quests`,
      typeText: "Type: -",
    };
  }

  private buildFinalPreviewViewModel(): QuestInfoViewModel | null {
    const finalPreview = this.questState.getFinalPreviewQuest();

    return finalPreview
      ? this.buildQuestInfoViewModel(finalPreview.id, finalPreview.config, "Final Available Next")
      : null;
  }

  private buildInventorySlotViewModels(backpackMaxSlots: number): QuestSlotViewModel[] {
    return Array.from({ length: backpackMaxSlots }, (_value, slotIndex) => {
      const lootSlot = this.questState.getBackpackSlotLootSlot(slotIndex);
      const column = slotIndex % 4;
      const row = Math.floor(slotIndex / 4);

      return {
        ...this.buildItemVisual(lootSlot, true, "inventory", slotIndex),
        slotIndex,
        visible: true,
        x: column * this.getSlotStrideX(),
        y: row * this.getSlotStrideY(),
      };
    });
  }

  private buildItemVisual(
    lootSlot: LootContainerLootSlot | null,
    hideWhenDragged: boolean,
    source: QuestItemPlacementSource,
    slotIndex: number,
  ): Omit<QuestSlotViewModel, "slotIndex" | "visible" | "x" | "y"> {
    const itemVisible = lootSlot !== null
      && (!hideWhenDragged || !this.questState.isSourceSlotBeingDragged(source, slotIndex));
    const lootSprite = lootSlot
      ? getLootSprite(lootSlot.itemId)
      : {
        spriteName: SpriteName.BLANK,
        spriteSheetName: SpriteSheetName.BLANK,
      };
    const hasLootSprite = lootSprite.spriteName !== SpriteName.BLANK
      || lootSprite.spriteSheetName !== SpriteSheetName.BLANK;

    return {
      amountText: lootSlot ? `${lootSlot.amount}` : "",
      iconHeight: QUEST_SCREEN_SKIN_MAP.itemIcon.height,
      iconSpriteName: lootSprite.spriteName,
      iconSpriteSheetName: lootSprite.spriteSheetName,
      iconVisible: itemVisible && hasLootSprite,
      iconWidth: QUEST_SCREEN_SKIN_MAP.itemIcon.width,
      labelText: lootSlot ? formatLootItemAbbreviation(lootSlot.itemId) : "",
      labelVisible: itemVisible && !hasLootSprite,
      quantityVisible: itemVisible,
    };
  }

  private buildQuestInfoViewModel(
    questId: QuestId,
    quest: QuestConfigEntry,
    titlePrefix = "",
  ): QuestInfoViewModel {
    const prefix = titlePrefix ? `${titlePrefix}: ` : "";

    return {
      bestSourcesText: `Best Sources: ${quest.bestSources.length ? quest.bestSources.join(", ") : "-"}`,
      objectivesText: this.formatQuestObjectives(questId, quest),
      rewardsText: `Rewards:\n${quest.rewards.length
        ? quest.rewards.map(formatQuestReward).join("\n")
        : "-"}`,
      titleText: `${prefix}${quest.trader} - ${quest.title}${"repeatable" in quest && quest.repeatable ? " (Repeatable)" : ""}`,
      typeText: `Type: ${formatQuestType(quest.type)}`,
    };
  }

  private formatQuestObjectives(questId: QuestId, quest: QuestConfigEntry): string {
    if (quest.objectives.length === 0) {
      return "Objectives:\n-";
    }

    if (quest.type === QuestType.DEMOLITION) {
      return `Objectives:\n- ${formatDemolitionObjectiveProgress(
        quest,
        (objectiveIndex) => this.questState.getObjectiveProgress(questId, objectiveIndex),
      )}`;
    }

    return `Objectives:\n${quest.objectives.map(formatQuestObjective).join("\n")}`;
  }

  private buildStorageSlotViewModels(): QuestSlotViewModel[] {
    return Array.from({ length: QUEST_STORAGE_MAX_SLOTS }, (_value, slotIndex) => {
      const lootSlot = this.questState.getStorageSlotLootSlot(slotIndex);
      const column = slotIndex % QUEST_STORAGE_COLUMN_COUNT;
      const row = Math.floor(slotIndex / QUEST_STORAGE_COLUMN_COUNT);

      return {
        ...this.buildItemVisual(lootSlot, true, "storage", slotIndex),
        slotIndex,
        visible: true,
        x: column * this.getSlotStrideX(),
        y: row * this.getSlotStrideY(),
      };
    });
  }

  private buildTabViewModels(activeSourceTab: QuestSourceTab): QuestTabViewModel[] {
    return [
      {
        buttonState: activeSourceTab === QUEST_SOURCE_TAB.CAMP_STORAGE
          ? UIButtonState.SELECTED
          : UIButtonState.NORMAL,
        tab: QUEST_SOURCE_TAB.CAMP_STORAGE,
      },
      {
        buttonState: activeSourceTab === QUEST_SOURCE_TAB.BACKPACK
          ? UIButtonState.SELECTED
          : UIButtonState.NORMAL,
        tab: QUEST_SOURCE_TAB.BACKPACK,
      },
    ];
  }

  private getFrameHeight(rowCount: number): number {
    const slotsHeight = (rowCount * QUEST_SCREEN_SKIN_MAP.itemSlot.height)
      + Math.max(0, rowCount - 1) * QUEST_SCREEN_SKIN_MAP.layout.slotGap;

    return slotsHeight + QUEST_SCREEN_SKIN_MAP.frame.padding * 2;
  }

  private getFrameWidth(columnCount: number): number {
    const slotsWidth = (columnCount * QUEST_SCREEN_SKIN_MAP.itemSlot.width)
      + Math.max(0, columnCount - 1) * QUEST_SCREEN_SKIN_MAP.layout.slotGap;

    return slotsWidth + QUEST_SCREEN_SKIN_MAP.frame.padding * 2;
  }

  private getSlotStrideX(): number {
    return QUEST_SCREEN_SKIN_MAP.itemSlot.width + QUEST_SCREEN_SKIN_MAP.layout.slotGap;
  }

  private getSlotStrideY(): number {
    return QUEST_SCREEN_SKIN_MAP.itemSlot.height + QUEST_SCREEN_SKIN_MAP.layout.slotGap;
  }
}

function formatLootItemAbbreviation(itemId: LootTableItemId): string {
  const words = formatQuestItem(itemId).split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] ?? "").slice(0, 2).toUpperCase();
}

function formatQuestItem(item: string): string {
  return item
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatQuestObjective(objective: QuestConfigEntry["objectives"][number]): string {
  if ("item" in objective) {
    return `- ${objective.quantity}x ${formatQuestItem(objective.item)}`;
  }

  if ("category" in objective) {
    return `- ${objective.quantity}x ${objective.category}`;
  }

  return `- ${objective.quantity}x ${objective.target}`;
}

function formatDemolitionObjectiveProgress(
  quest: QuestConfigEntry,
  getObjectiveProgress: (objectiveIndex: number) => number,
): string {
  const totalBuildings = quest.objectives.reduce((total, objective) => {
    return total + objective.quantity;
  }, 0);
  const destroyedBuildings = quest.objectives.reduce((total, objective, objectiveIndex) => {
    return total + Math.min(getObjectiveProgress(objectiveIndex), objective.quantity);
  }, 0);

  return `Buildings destroyed: ${destroyedBuildings}/${totalBuildings}`;
}

function formatQuestReward(reward: QuestConfigEntry["rewards"][number]): string {
  if ("item" in reward) {
    if (reward.item === InventoryResourceType.Money) {
      return `- $${MONEY_FORMATTER.format(reward.quantity)}`;
    }

    return `- ${reward.quantity}x ${formatQuestItem(reward.item)}`;
  }

  if ("skillUpgrade" in reward) {
    return "- Skill Upgrade";
  }

  return "- Reward";
}

function formatQuestType(type: QuestType): string {
  switch (type) {
    case QuestType.COLLECTOR:
      return "Collector";

    case QuestType.DEMOLITION:
      return "Demolition";

    case QuestType.FINAL:
      return "Final";

    case QuestType.HVT:
      return "HVT";

    case QuestType.WIPE:
      return "Wipe";
  }
}

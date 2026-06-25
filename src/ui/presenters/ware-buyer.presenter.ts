import {
  WARE_BUYER_COLUMN_COUNT,
  WARE_BUYER_MAX_SLOTS,
  WARE_BUYER_ROW_COUNT,
  WARE_BUYER_SOURCE_TAB,
  type WareBuyerItemPlacementSource,
  type WareBuyerSourceTab,
  WareBuyerState,
} from "../../ecs/components/states/ware-buyer-state.js";
import type { LootContainerLootSlot } from "../../ecs/components/loot-container-content.component.js";
import type { LootTableItemId } from "../../game/world-map/loot/loot-tables.js";
import { getLootSprite } from "../../game/world-map/loot/loot-sprites.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { UIButtonState } from "../style/ui-button-config.js";
import { WARE_BUYER_SKIN_MAP } from "../style/ware-buyer-skin-map.js";
import type {
  WareBuyerDragVisualViewModel,
  WareBuyerSlotViewModel,
  WareBuyerTabViewModel,
  WareBuyerViewModel,
} from "../view-models/ware-buyer.view-model.js";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US");

export class WareBuyerPresenter {
  constructor(private wareBuyerState: WareBuyerState) { }

  public buildViewModel(): WareBuyerViewModel {
    const activeSourceTab = this.wareBuyerState.getActiveSourceTab();
    const backpackMaxSlots = this.wareBuyerState.getBackpackMaxSlots();
    const backpackColumnCount = Math.max(
      1,
      Math.min(backpackMaxSlots || 1, WARE_BUYER_SKIN_MAP.layout.maxSlotsPerRow),
    );
    const backpackRowCount = Math.max(
      1,
      Math.ceil((backpackMaxSlots || 1) / WARE_BUYER_SKIN_MAP.layout.maxSlotsPerRow),
    );

    return {
      activeSourceTab,
      dragVisual: this.buildDragVisualViewModel(),
      hoveredItemName: this.wareBuyerState.getHoveredItemName(),
      inventoryFrameHeight: this.getFrameHeight(backpackRowCount),
      inventoryFrameVisible: activeSourceTab === WARE_BUYER_SOURCE_TAB.BACKPACK,
      inventoryFrameWidth: this.getFrameWidth(backpackColumnCount),
      inventorySlots: this.buildInventorySlotViewModels(backpackMaxSlots),
      saleFrameHeight: this.getFrameHeight(WARE_BUYER_ROW_COUNT),
      saleFrameWidth: this.getFrameWidth(WARE_BUYER_COLUMN_COUNT),
      saleSlots: this.buildSaleSlotViewModels(),
      sellButtonDisabled: !this.wareBuyerState.canSellItems(),
      storageFrameHeight: this.getFrameHeight(WARE_BUYER_ROW_COUNT),
      storageFrameVisible: activeSourceTab === WARE_BUYER_SOURCE_TAB.CAMP_STORAGE,
      storageFrameWidth: this.getFrameWidth(WARE_BUYER_COLUMN_COUNT),
      storageSlots: this.buildStorageSlotViewModels(),
      tabs: this.buildTabViewModels(activeSourceTab),
      totalValueText: `Total: $${MONEY_FORMATTER.format(this.wareBuyerState.getTotalSellValue())}`,
    };
  }

  public setHoveredSlot(
    source: WareBuyerItemPlacementSource | null,
    slotIndex: number | null,
  ): void {
    this.wareBuyerState.setHoveredSlot(source, slotIndex);
  }

  private buildDragVisualViewModel(): WareBuyerDragVisualViewModel {
    const dragState = this.wareBuyerState.getActiveItemDrag();

    if (!dragState) {
      return {
        amountText: "",
        iconHeight: WARE_BUYER_SKIN_MAP.itemIcon.height,
        iconSpriteName: SpriteName.BLANK,
        iconSpriteSheetName: SpriteSheetName.BLANK,
        iconVisible: false,
        iconWidth: WARE_BUYER_SKIN_MAP.itemIcon.width,
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
      x: Math.round(dragState.pointerX - (WARE_BUYER_SKIN_MAP.itemSlot.width / 2)),
      y: Math.round(dragState.pointerY - (WARE_BUYER_SKIN_MAP.itemSlot.height / 2)),
    };
  }

  private buildInventorySlotViewModels(backpackMaxSlots: number): WareBuyerSlotViewModel[] {
    return Array.from({ length: backpackMaxSlots }, (_value, slotIndex) => {
      const lootSlot = this.wareBuyerState.getBackpackSlotLootSlot(slotIndex);
      const column = slotIndex % WARE_BUYER_SKIN_MAP.layout.maxSlotsPerRow;
      const row = Math.floor(slotIndex / WARE_BUYER_SKIN_MAP.layout.maxSlotsPerRow);

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
    source: WareBuyerItemPlacementSource,
    slotIndex: number,
  ): Omit<WareBuyerSlotViewModel, "slotIndex" | "visible" | "x" | "y"> {
    const itemVisible = lootSlot !== null
      && (!hideWhenDragged || !this.wareBuyerState.isSourceSlotBeingDragged(source, slotIndex));
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
      iconHeight: WARE_BUYER_SKIN_MAP.itemIcon.height,
      iconSpriteName: lootSprite.spriteName,
      iconSpriteSheetName: lootSprite.spriteSheetName,
      iconVisible: itemVisible && hasLootSprite,
      iconWidth: WARE_BUYER_SKIN_MAP.itemIcon.width,
      labelText: lootSlot ? formatLootItemAbbreviation(lootSlot.itemId) : "",
      labelVisible: itemVisible && !hasLootSprite,
      quantityVisible: itemVisible,
    };
  }

  private buildSaleSlotViewModels(): WareBuyerSlotViewModel[] {
    return Array.from({ length: WARE_BUYER_MAX_SLOTS }, (_value, slotIndex) => {
      const lootSlot = this.wareBuyerState.getSaleSlotLootSlot(slotIndex);
      const column = slotIndex % WARE_BUYER_COLUMN_COUNT;
      const row = Math.floor(slotIndex / WARE_BUYER_COLUMN_COUNT);

      return {
        ...this.buildItemVisual(lootSlot, true, "sale", slotIndex),
        slotIndex,
        visible: true,
        x: column * this.getSlotStrideX(),
        y: row * this.getSlotStrideY(),
      };
    });
  }

  private buildStorageSlotViewModels(): WareBuyerSlotViewModel[] {
    return Array.from({ length: WARE_BUYER_MAX_SLOTS }, (_value, slotIndex) => {
      const lootSlot = this.wareBuyerState.getStorageSlotLootSlot(slotIndex);
      const column = slotIndex % WARE_BUYER_COLUMN_COUNT;
      const row = Math.floor(slotIndex / WARE_BUYER_COLUMN_COUNT);

      return {
        ...this.buildItemVisual(lootSlot, true, "storage", slotIndex),
        slotIndex,
        visible: true,
        x: column * this.getSlotStrideX(),
        y: row * this.getSlotStrideY(),
      };
    });
  }

  private buildTabViewModels(activeSourceTab: WareBuyerSourceTab): WareBuyerTabViewModel[] {
    return [
      {
        buttonState: activeSourceTab === WARE_BUYER_SOURCE_TAB.CAMP_STORAGE
          ? UIButtonState.SELECTED
          : UIButtonState.NORMAL,
        tab: WARE_BUYER_SOURCE_TAB.CAMP_STORAGE,
      },
      {
        buttonState: activeSourceTab === WARE_BUYER_SOURCE_TAB.BACKPACK
          ? UIButtonState.SELECTED
          : UIButtonState.NORMAL,
        tab: WARE_BUYER_SOURCE_TAB.BACKPACK,
      },
    ];
  }

  private getFrameHeight(rowCount: number): number {
    const slotsHeight = (rowCount * WARE_BUYER_SKIN_MAP.itemSlot.height)
      + Math.max(0, rowCount - 1) * WARE_BUYER_SKIN_MAP.layout.slotGap;

    return slotsHeight + WARE_BUYER_SKIN_MAP.frame.padding * 2;
  }

  private getFrameWidth(columnCount: number): number {
    const slotsWidth = (columnCount * WARE_BUYER_SKIN_MAP.itemSlot.width)
      + Math.max(0, columnCount - 1) * WARE_BUYER_SKIN_MAP.layout.slotGap;

    return slotsWidth + WARE_BUYER_SKIN_MAP.frame.padding * 2;
  }

  private getSlotStrideX(): number {
    return WARE_BUYER_SKIN_MAP.itemSlot.width + WARE_BUYER_SKIN_MAP.layout.slotGap;
  }

  private getSlotStrideY(): number {
    return WARE_BUYER_SKIN_MAP.itemSlot.height + WARE_BUYER_SKIN_MAP.layout.slotGap;
  }
}

function formatLootItemName(itemId: LootTableItemId): string {
  return `${itemId}`
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatLootItemAbbreviation(itemId: LootTableItemId): string {
  const words = formatLootItemName(itemId).split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] ?? "").slice(0, 2).toUpperCase();
}

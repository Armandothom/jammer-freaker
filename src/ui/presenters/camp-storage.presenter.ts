import {
  CAMP_STORAGE_COLUMN_COUNT,
  CAMP_STORAGE_MAX_SLOTS,
  CAMP_STORAGE_ROW_COUNT,
  CampStorageState,
  type CampStorageItemPlacementSource,
} from "../../ecs/components/states/camp-storage-state.js";
import type { LootContainerLootSlot } from "../../ecs/components/loot-container-content.component.js";
import { getLootSprite } from "../../game/world-map/loot/loot-sprites.js";
import { formatLootItemAbbreviation } from "../../game/world-map/loot/loot-item-display.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { CAMP_STORAGE_SKIN_MAP } from "../style/camp-storage-skin-map.js";
import type {
  CampStorageDragVisualViewModel,
  CampStorageSlotViewModel,
  CampStorageViewModel,
} from "../view-models/camp-storage.view-model.js";

export class CampStoragePresenter {
  constructor(private campStorageState: CampStorageState) { }

  public buildViewModel(): CampStorageViewModel {
    const backpackMaxSlots = this.campStorageState.getBackpackMaxSlots();
    const backpackColumnCount = Math.max(
      1,
      Math.min(backpackMaxSlots || 1, CAMP_STORAGE_SKIN_MAP.layout.maxSlotsPerRow),
    );
    const backpackRowCount = Math.max(
      1,
      Math.ceil((backpackMaxSlots || 1) / CAMP_STORAGE_SKIN_MAP.layout.maxSlotsPerRow),
    );

    return {
      dragVisual: this.buildDragVisualViewModel(),
      hoveredItemName: this.campStorageState.getHoveredItemName(),
      inventoryFrameHeight: this.getFrameHeight(backpackRowCount),
      inventoryFrameWidth: this.getFrameWidth(backpackColumnCount),
      inventorySlots: this.buildInventorySlotViewModels(backpackMaxSlots),
      storageFrameHeight: this.getFrameHeight(CAMP_STORAGE_ROW_COUNT),
      storageFrameWidth: this.getFrameWidth(CAMP_STORAGE_COLUMN_COUNT),
      storageSlots: this.buildStorageSlotViewModels(),
    };
  }

  public setHoveredSlot(
    source: CampStorageItemPlacementSource | null,
    slotIndex: number | null,
  ): void {
    this.campStorageState.setHoveredSlot(source, slotIndex);
  }

  private buildDragVisualViewModel(): CampStorageDragVisualViewModel {
    const dragState = this.campStorageState.getActiveItemDrag();

    if (!dragState) {
      return {
        amountText: "",
        iconHeight: CAMP_STORAGE_SKIN_MAP.itemIcon.height,
        iconSpriteName: SpriteName.BLANK,
        iconSpriteSheetName: SpriteSheetName.BLANK,
        iconVisible: false,
        iconWidth: CAMP_STORAGE_SKIN_MAP.itemIcon.width,
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
      x: Math.round(dragState.pointerX - (CAMP_STORAGE_SKIN_MAP.itemSlot.width / 2)),
      y: Math.round(dragState.pointerY - (CAMP_STORAGE_SKIN_MAP.itemSlot.height / 2)),
    };
  }

  private buildInventorySlotViewModels(backpackMaxSlots: number): CampStorageSlotViewModel[] {
    return Array.from({ length: backpackMaxSlots }, (_value, slotIndex) => {
      const lootSlot = this.campStorageState.getBackpackSlotLootSlot(slotIndex);
      const column = slotIndex % CAMP_STORAGE_SKIN_MAP.layout.maxSlotsPerRow;
      const row = Math.floor(slotIndex / CAMP_STORAGE_SKIN_MAP.layout.maxSlotsPerRow);

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
    source: CampStorageItemPlacementSource,
    slotIndex: number,
  ): Omit<CampStorageSlotViewModel, "slotIndex" | "visible" | "x" | "y"> {
    const itemVisible = lootSlot !== null
      && (!hideWhenDragged || !this.campStorageState.isSourceSlotBeingDragged(source, slotIndex));
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
      iconHeight: CAMP_STORAGE_SKIN_MAP.itemIcon.height,
      iconSpriteName: lootSprite.spriteName,
      iconSpriteSheetName: lootSprite.spriteSheetName,
      iconVisible: itemVisible && hasLootSprite,
      iconWidth: CAMP_STORAGE_SKIN_MAP.itemIcon.width,
      labelText: lootSlot ? formatLootItemAbbreviation(lootSlot.itemId) : "",
      labelVisible: itemVisible && !hasLootSprite,
      quantityVisible: itemVisible,
    };
  }

  private buildStorageSlotViewModels(): CampStorageSlotViewModel[] {
    return Array.from({ length: CAMP_STORAGE_MAX_SLOTS }, (_value, slotIndex) => {
      const lootSlot = this.campStorageState.getStorageSlotLootSlot(slotIndex);
      const column = slotIndex % CAMP_STORAGE_COLUMN_COUNT;
      const row = Math.floor(slotIndex / CAMP_STORAGE_COLUMN_COUNT);

      return {
        ...this.buildItemVisual(lootSlot, true, "storage", slotIndex),
        slotIndex,
        visible: true,
        x: column * this.getSlotStrideX(),
        y: row * this.getSlotStrideY(),
      };
    });
  }

  private getFrameHeight(rowCount: number): number {
    const slotsHeight = (rowCount * CAMP_STORAGE_SKIN_MAP.itemSlot.height)
      + Math.max(0, rowCount - 1) * CAMP_STORAGE_SKIN_MAP.layout.slotGap;

    return slotsHeight + CAMP_STORAGE_SKIN_MAP.frame.padding * 2;
  }

  private getFrameWidth(columnCount: number): number {
    const slotsWidth = (columnCount * CAMP_STORAGE_SKIN_MAP.itemSlot.width)
      + Math.max(0, columnCount - 1) * CAMP_STORAGE_SKIN_MAP.layout.slotGap;

    return slotsWidth + CAMP_STORAGE_SKIN_MAP.frame.padding * 2;
  }

  private getSlotStrideX(): number {
    return CAMP_STORAGE_SKIN_MAP.itemSlot.width + CAMP_STORAGE_SKIN_MAP.layout.slotGap;
  }

  private getSlotStrideY(): number {
    return CAMP_STORAGE_SKIN_MAP.itemSlot.height + CAMP_STORAGE_SKIN_MAP.layout.slotGap;
  }
}

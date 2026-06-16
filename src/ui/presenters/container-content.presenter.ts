import { LootContainerContentComponent } from "../../ecs/components/loot-container-content.component.js";
import { LootContainerComponent } from "../../ecs/components/loot-container.component.js";
import { InventoryComponent } from "../../ecs/components/inventory-component.js";
import { BackpackUpgradeIntentComponent } from "../../ecs/components/backpack-upgrade-intent.component.js";
import { PlayerComponent } from "../../ecs/components/player.component.js";
import { PlayerOccupiedComponent, PlayerOccupiedKind } from "../../ecs/components/player-occupied.component.js";
import type { LootContainerLootSlot } from "../../ecs/components/loot-container-content.component.js";
import type { LootTableItemId } from "../../game/world-map/loot/loot-tables.js";
import { getLootSprite } from "../../game/world-map/loot/loot-sprites.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { BackpackType, getBackpackLevel } from "../../ecs/components/types/backpack-config.js";
import { ComponentStore } from "../../ecs/core/component-store.js";
import { InventoryManager } from "../../ecs/core/inventory-manager.js";
import type { ContainerContentViewModel } from "../view-models/container-content.view-model.js";
import type { ItemPlacementBindSource } from "../input/container-content-ui-actions.js";
import type { InventoryOverlayPresenter } from "./inventory-overlay.presenter.js";
import { CONTAINER_CONTENT_SKIN_MAP } from "../style/container-content-skin-map.js";

const PLAYER_CONTAINER_OCCUPATION_RELEASE_DELAY_MS = 150;

export type ItemPlacementDragState = {
  item: LootContainerLootSlot;
  pointerX: number;
  pointerY: number;
  source: ItemPlacementBindSource;
  slotIndex: number;
};

export class ContainerContentPresenter {
  private activeContainerEntityId: number | null = null;
  private dragState: ItemPlacementDragState | null = null;
  private hoveredSlotIndex: number | null = null;
  private selectedSlotIndex: number | null = null;
  private pendingContainerOccupationReleaseTimeoutId: number | null = null;
  private containerOccupationReleaseToken = 0;

  constructor(
    private inventoryManager: InventoryManager,
    private inventoryComponentStore: ComponentStore<InventoryComponent>,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private playerOccupiedComponentStore: ComponentStore<PlayerOccupiedComponent>,
    private lootContainerComponentStore: ComponentStore<LootContainerComponent>,
    private lootContainerContentComponentStore: ComponentStore<LootContainerContentComponent>,
    private backpackUpgradeIntentComponentStore: ComponentStore<BackpackUpgradeIntentComponent>,
  ) { }

  public beginItemDrag(
    source: ItemPlacementBindSource,
    slotIndex: number,
    item: LootContainerLootSlot,
    pointerX: number,
    pointerY: number,
  ): boolean {
    this.dragState = {
      item: {
        amount: item.amount,
        itemId: item.itemId,
      },
      pointerX,
      pointerY,
      source,
      slotIndex,
    };
    return true;
  }

  public clearItemDrag(): void {
    this.dragState = null;
  }

  public getActiveItemDrag(): ItemPlacementDragState | null {
    return this.dragState;
  }

  public activateSlot(slotIndex: number, mouseButton: string | null): boolean {
    const content = this.getActiveContainerContent();

    if (!content || slotIndex < 0 || slotIndex >= content.maxLootSlots) {
      return false;
    }

    this.selectedSlotIndex = slotIndex;

    if (mouseButton === "2") {
      return true;
    }

    return true;
  }

  public buildViewModel(): ContainerContentViewModel | null {
    const content = this.getActiveContainerContent();

    if (!content) {
      return null;
    }

    const maxLootSlots = Math.max(0, content.maxLootSlots);
    const columnCount = Math.max(
      1,
      Math.min(maxLootSlots || 1, CONTAINER_CONTENT_SKIN_MAP.layout.maxSlotsPerRow),
    );
    const rowCount = Math.max(
      1,
      Math.ceil((maxLootSlots || 1) / CONTAINER_CONTENT_SKIN_MAP.layout.maxSlotsPerRow),
    );
    const slotGap = CONTAINER_CONTENT_SKIN_MAP.layout.slotGap;
    const slotStrideX = CONTAINER_CONTENT_SKIN_MAP.itemSlot.width + slotGap;
    const slotStrideY = CONTAINER_CONTENT_SKIN_MAP.itemSlot.height + slotGap;
    const slotsWidth = (columnCount * CONTAINER_CONTENT_SKIN_MAP.itemSlot.width)
      + (Math.max(0, columnCount - 1) * slotGap);
    const headerHeight = CONTAINER_CONTENT_SKIN_MAP.hoveredItemName.height
      + CONTAINER_CONTENT_SKIN_MAP.layout.headerGap;
    const slotsHeight = (rowCount * CONTAINER_CONTENT_SKIN_MAP.itemSlot.height)
      + (Math.max(0, rowCount - 1) * slotGap);
    const contentWidth = Math.max(
      slotsWidth,
      CONTAINER_CONTENT_SKIN_MAP.takeAllButton.width,
    );
    const contentHeight = headerHeight
      + slotsHeight
      + CONTAINER_CONTENT_SKIN_MAP.layout.footerGap
      + CONTAINER_CONTENT_SKIN_MAP.takeAllButton.height;
    const containerWidth = contentWidth + (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2);
    const containerHeight = contentHeight + (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2);
    const hoveredItemName = this.resolveHoveredItemName(content);

    return {
      closeButtonX: contentWidth - CONTAINER_CONTENT_SKIN_MAP.closeButton.width,
      closeButtonY: 0,
      containerHeight,
      containerWidth,
      dragVisual: this.buildDragVisualViewModel(),
      hoveredItemName,
      hoveredItemNameWidth: Math.max(
        0,
        contentWidth - CONTAINER_CONTENT_SKIN_MAP.closeButton.width - 4,
      ),
      maxLootSlots,
      slots: Array.from({ length: maxLootSlots }, (_value, slotIndex) => {
        const lootSlot = content.lootSlots[slotIndex] ?? null;
        const itemVisible = lootSlot !== null
          && !this.isSourceSlotBeingDragged("container", slotIndex);
        const column = slotIndex % CONTAINER_CONTENT_SKIN_MAP.layout.maxSlotsPerRow;
        const row = Math.floor(slotIndex / CONTAINER_CONTENT_SKIN_MAP.layout.maxSlotsPerRow);
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
          iconHeight: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
          iconSpriteName: lootSprite.spriteName,
          iconSpriteSheetName: lootSprite.spriteSheetName,
          iconVisible: itemVisible && hasLootSprite,
          iconWidth: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
          labelText: lootSlot ? formatLootItemAbbreviation(lootSlot.itemId) : "",
          labelVisible: itemVisible && !hasLootSprite,
          quantityVisible: itemVisible,
          slotIndex,
          visible: true,
          x: column * slotStrideX,
          y: headerHeight + (row * slotStrideY),
        };
      }),
      takeAllButtonDisabled: !this.hasAnyContainerLootSlot(content),
      takeAllButtonX: contentWidth - CONTAINER_CONTENT_SKIN_MAP.takeAllButton.width,
      takeAllButtonY: headerHeight
        + slotsHeight
        + CONTAINER_CONTENT_SKIN_MAP.layout.footerGap,
    };
  }

  public closeContainer(): void {
    this.activeContainerEntityId = null;
    this.dragState = null;
    this.hoveredSlotIndex = null;
    this.selectedSlotIndex = null;
    this.schedulePlayerContainerOccupationClear();
  }

  public getActiveContainerEntityId(): number | null {
    return this.activeContainerEntityId;
  }

  public openContainer(containerEntityId: number): boolean {
    if (!this.lootContainerComponentStore.has(containerEntityId)) {
      return false;
    }

    if (!this.lootContainerContentComponentStore.has(containerEntityId)) {
      return false;
    }

    this.cancelPendingPlayerContainerOccupationClear();
    this.activeContainerEntityId = containerEntityId;
    this.hoveredSlotIndex = null;
    this.selectedSlotIndex = null;
    this.dragState = null;
    this.markPlayerContainerOccupied(containerEntityId);
    return true;
  }

  public setHoveredSlotIndex(slotIndex: number | null): void {
    this.hoveredSlotIndex = slotIndex;
  }

  public setItemDragPointer(pointerX: number, pointerY: number): void {
    if (!this.dragState) {
      return;
    }

    this.dragState = {
      ...this.dragState,
      pointerX,
      pointerY,
    };
  }

  public getContainerSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
    const content = this.getActiveContainerContent();

    if (!content || !this.isContainerSlotIndexInRange(content, slotIndex)) {
      return null;
    }

    const lootSlot = content.lootSlots[slotIndex] ?? null;

    if (!lootSlot) {
      return null;
    }

    return {
      amount: lootSlot.amount,
      itemId: lootSlot.itemId,
    };
  }

  public isContainerSlotEmpty(slotIndex: number): boolean {
    const content = this.getActiveContainerContent();

    return !!content
      && this.isContainerSlotIndexInRange(content, slotIndex)
      && !content.lootSlots[slotIndex];
  }

  public moveContainerSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
    const content = this.getActiveContainerContent();

    if (!content
      || !this.isContainerSlotIndexInRange(content, sourceSlotIndex)
      || !this.isContainerSlotIndexInRange(content, targetSlotIndex)) {
      return false;
    }

    if (sourceSlotIndex === targetSlotIndex) {
      return !!content.lootSlots[sourceSlotIndex];
    }

    const sourceLootSlot = content.lootSlots[sourceSlotIndex] ?? null;

    if (!sourceLootSlot || content.lootSlots[targetSlotIndex]) {
      return false;
    }

    content.lootSlots[targetSlotIndex] = sourceLootSlot;
    content.lootSlots[sourceSlotIndex] = null;
    this.selectedSlotIndex = targetSlotIndex;
    this.hoveredSlotIndex = targetSlotIndex;
    return true;
  }

  public placeLootSlotInContainer(slotIndex: number, lootSlot: LootContainerLootSlot): boolean {
    const content = this.getActiveContainerContent();

    if (!content
      || !this.isContainerSlotIndexInRange(content, slotIndex)
      || content.lootSlots[slotIndex]) {
      return false;
    }

    content.lootSlots[slotIndex] = {
      amount: lootSlot.amount,
      itemId: lootSlot.itemId,
    };
    this.selectedSlotIndex = slotIndex;
    this.hoveredSlotIndex = slotIndex;
    return true;
  }

  public takeContainerSlotToInventory(slotIndex: number): boolean {
    const playerEntity = this.getPlayerEntity();
    const inventory = playerEntity == null
      ? null
      : this.inventoryComponentStore.getOrNull(playerEntity);
    const content = this.getActiveContainerContent();

    if (playerEntity == null
      || !inventory
      || !content
      || !this.isContainerSlotIndexInRange(content, slotIndex)) {
      return false;
    }

    const lootSlot = content.lootSlots[slotIndex] ?? null;

    if (!lootSlot || !this.tryCollectLootSlot(playerEntity, inventory, lootSlot)) {
      return false;
    }

    this.clearContainerSlot(slotIndex);
    return true;
  }

  public takeContainerSlotToInventorySlot(
    sourceSlotIndex: number,
    targetSlotIndex: number,
    inventoryOverlayPresenter: InventoryOverlayPresenter,
  ): boolean {
    const playerEntity = this.getPlayerEntity();
    const inventory = playerEntity == null
      ? null
      : this.inventoryComponentStore.getOrNull(playerEntity);
    const content = this.getActiveContainerContent();

    if (playerEntity == null
      || !inventory
      || !content
      || !this.isContainerSlotIndexInRange(content, sourceSlotIndex)
      || !inventoryOverlayPresenter.isBackpackSlotEmpty(targetSlotIndex)) {
      return false;
    }

    const lootSlot = content.lootSlots[sourceSlotIndex] ?? null;

    if (!lootSlot) {
      return false;
    }

    if (this.inventoryManager.resolveBackpackUpgradeType(lootSlot.itemId) !== null) {
      if (!this.tryCollectLootSlot(playerEntity, inventory, lootSlot)) {
        return false;
      }

      this.clearContainerSlot(sourceSlotIndex);
      return true;
    }

    if (!inventoryOverlayPresenter.addLootItemToBackpackSlot(
      lootSlot.itemId,
      lootSlot.amount,
      targetSlotIndex,
    )) {
      return false;
    }

    this.clearContainerSlot(sourceSlotIndex);
    return true;
  }

  public takeAllItems(): boolean {
    const playerEntity = this.getPlayerEntity();
    const inventory = playerEntity == null
      ? null
      : this.inventoryComponentStore.getOrNull(playerEntity);
    const content = this.getActiveContainerContent();

    if (playerEntity == null || !inventory || !content || !this.hasAnyContainerLootSlot(content)) {
      return false;
    }

    const remainingLootSlots: Array<LootContainerLootSlot | null> = [...content.lootSlots];
    let collectedAnyItem = false;

    for (const [slotIndex, lootSlot] of content.lootSlots.entries()) {
      if (!lootSlot) {
        continue;
      }

      if (this.tryCollectLootSlot(playerEntity, inventory, lootSlot)) {
        collectedAnyItem = true;
        remainingLootSlots[slotIndex] = null;
        continue;
      }
    }

    if (!collectedAnyItem) {
      return false;
    }

    content.lootSlots = remainingLootSlots;
    this.hoveredSlotIndex = null;
    this.selectedSlotIndex = null;
    this.dragState = null;
    return true;
  }

  public buildDragVisualViewModel(): ContainerContentViewModel["dragVisual"] {
    if (!this.dragState) {
      return {
        amountText: "",
        iconHeight: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
        iconSpriteName: SpriteName.BLANK,
        iconSpriteSheetName: SpriteSheetName.BLANK,
        iconVisible: false,
        iconWidth: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
        labelText: "",
        labelVisible: false,
        quantityVisible: false,
        visible: false,
        x: 0,
        y: 0,
      };
    }

    const lootSprite = getLootSprite(this.dragState.item.itemId);
    const hasLootSprite = lootSprite.spriteName !== SpriteName.BLANK
      || lootSprite.spriteSheetName !== SpriteSheetName.BLANK;

    return {
      amountText: `${this.dragState.item.amount}`,
      iconHeight: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
      iconSpriteName: lootSprite.spriteName,
      iconSpriteSheetName: lootSprite.spriteSheetName,
      iconVisible: hasLootSprite,
      iconWidth: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
      labelText: formatLootItemAbbreviation(this.dragState.item.itemId),
      labelVisible: !hasLootSprite,
      quantityVisible: true,
      visible: true,
      x: Math.round(this.dragState.pointerX - (CONTAINER_CONTENT_SKIN_MAP.itemSlot.width / 2)),
      y: Math.round(this.dragState.pointerY - (CONTAINER_CONTENT_SKIN_MAP.itemSlot.height / 2)),
    };
  }

  public destroyContainerSlotItem(slotIndex: number): boolean {
    const content = this.getActiveContainerContent();

    if (!content || !this.isContainerSlotIndexInRange(content, slotIndex) || !content.lootSlots[slotIndex]) {
      return false;
    }

    this.clearContainerSlot(slotIndex);
    return true;
  }

  public removeContainerSlotItemAmount(slotIndex: number, amount: number): boolean {
    const content = this.getActiveContainerContent();
    const normalizedAmount = Math.max(0, Math.floor(amount));

    if (!content
      || !this.isContainerSlotIndexInRange(content, slotIndex)
      || normalizedAmount <= 0) {
      return false;
    }

    const lootSlot = content.lootSlots[slotIndex] ?? null;

    if (!lootSlot || lootSlot.amount < normalizedAmount) {
      return false;
    }

    if (lootSlot.amount === normalizedAmount) {
      this.clearContainerSlot(slotIndex);
      return true;
    }

    lootSlot.amount -= normalizedAmount;
    return true;
  }

  private clearContainerSlot(slotIndex: number): void {
    const content = this.getActiveContainerContent();

    if (!content || !this.isContainerSlotIndexInRange(content, slotIndex)) {
      return;
    }

    content.lootSlots[slotIndex] = null;

    if (this.hoveredSlotIndex === slotIndex) {
      this.hoveredSlotIndex = null;
    }

    if (this.selectedSlotIndex === slotIndex) {
      this.selectedSlotIndex = null;
    }
  }

  private getActiveContainerContent(): LootContainerContentComponent | null {
    if (this.activeContainerEntityId == null) {
      return null;
    }

    return this.lootContainerContentComponentStore.getOrNull(this.activeContainerEntityId);
  }

  private getPlayerEntity(): number | null {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];

    if (playerEntity == null) {
      return null;
    }

    return playerEntity;
  }

  private hasAnyContainerLootSlot(content: LootContainerContentComponent): boolean {
    return content.lootSlots.some((lootSlot) => lootSlot !== null && lootSlot !== undefined);
  }

  private isContainerSlotIndexInRange(
    content: LootContainerContentComponent,
    slotIndex: number,
  ): boolean {
    return Number.isInteger(slotIndex)
      && slotIndex >= 0
      && slotIndex < content.maxLootSlots;
  }

  private isSourceSlotBeingDragged(
    source: ItemPlacementBindSource,
    slotIndex: number,
  ): boolean {
    return this.dragState?.source === source
      && this.dragState.slotIndex === slotIndex;
  }

  private tryCollectLootSlot(
    playerEntity: number,
    inventory: InventoryComponent,
    lootSlot: LootContainerLootSlot,
  ): boolean {
    const backpackType = this.inventoryManager.resolveBackpackUpgradeType(lootSlot.itemId);

    if (backpackType !== null) {
      if (!this.canQueueBackpackUpgrade(inventory, playerEntity, backpackType)) {
        this.inventoryManager.logFailedToStash(
          inventory,
          lootSlot.itemId,
          lootSlot.amount,
        );
        return false;
      }

      this.backpackUpgradeIntentComponentStore.add(
        playerEntity,
        new BackpackUpgradeIntentComponent(backpackType),
      );
      return true;
    }

    return this.inventoryManager.addLootItem(
      inventory,
      lootSlot.itemId,
      lootSlot.amount,
    );
  }

  private canQueueBackpackUpgrade(
    inventory: InventoryComponent,
    playerEntity: number,
    backpackType: BackpackType,
  ): boolean {
    const currentLevel = this.inventoryManager.getBackpackLevel(inventory);
    const pendingUpgrade = this.backpackUpgradeIntentComponentStore.getOrNull(playerEntity);
    const pendingLevel = pendingUpgrade
      ? getBackpackLevel(pendingUpgrade.nextBackpackType)
      : currentLevel;

    return getBackpackLevel(backpackType) > Math.max(currentLevel, pendingLevel);
  }

  private markPlayerContainerOccupied(containerEntityId: number): void {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];

    if (playerEntity == null) {
      return;
    }

    this.playerOccupiedComponentStore.add(
      playerEntity,
      new PlayerOccupiedComponent(PlayerOccupiedKind.CONTAINER, containerEntityId),
    );
  }

  private schedulePlayerContainerOccupationClear(): void {
    this.cancelPendingPlayerContainerOccupationClear();

    const releaseToken = ++this.containerOccupationReleaseToken;
    this.pendingContainerOccupationReleaseTimeoutId = window.setTimeout(() => {
      if (releaseToken !== this.containerOccupationReleaseToken) {
        return;
      }

      this.pendingContainerOccupationReleaseTimeoutId = null;
      this.clearPlayerContainerOccupation();
    }, PLAYER_CONTAINER_OCCUPATION_RELEASE_DELAY_MS);
  }

  private cancelPendingPlayerContainerOccupationClear(): void {
    this.containerOccupationReleaseToken++;

    if (this.pendingContainerOccupationReleaseTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.pendingContainerOccupationReleaseTimeoutId);
    this.pendingContainerOccupationReleaseTimeoutId = null;
  }

  private clearPlayerContainerOccupation(): void {
    for (const playerEntity of this.playerComponentStore.getAllEntities()) {
      const occupied = this.playerOccupiedComponentStore.getOrNull(playerEntity);

      if (occupied?.kind === PlayerOccupiedKind.CONTAINER) {
        this.playerOccupiedComponentStore.remove(playerEntity);
      }
    }
  }

  private resolveHoveredItemName(content: LootContainerContentComponent): string {
    const slotIndex = this.hoveredSlotIndex ?? this.selectedSlotIndex;

    if (slotIndex == null) {
      return "";
    }

    const lootSlot = content.lootSlots[slotIndex];

    if (!lootSlot) {
      return "";
    }

    return formatLootItemName(lootSlot.itemId);
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

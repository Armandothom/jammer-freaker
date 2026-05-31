import { InventoryComponent } from "../../ecs/components/inventory-component.js";
import { PlayerComponent } from "../../ecs/components/player.component.js";
import {
  INVENTORY_RESOURCE_TYPES,
  InventoryResourceType,
  isInventoryResourceType,
} from "../../ecs/components/types/inventory-resource-type.js";
import { MISC_RESOURCE_TYPES } from "../../ecs/components/types/misc-resource-type.js";
import type { LootContainerLootSlot } from "../../ecs/components/loot-container-content.component.js";
import { WeaponType } from "../../ecs/components/types/weapon-config.js";
import { ComponentStore } from "../../ecs/core/component-store.js";
import { InventoryManager } from "../../ecs/core/inventory-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { LootTableItemId } from "../../game/world/loot/loot-tables.js";
import { getLootSprite } from "../../game/world/loot/loot-sprites.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { INVENTORY_OVERLAY_SKIN_MAP } from "../style/inventory-overlay-skin-map.js";
import type {
  InventoryOverlayBackpackSlotViewModel,
  InventoryOverlayViewModel,
  InventoryOverlayWeaponSlotViewModel,
} from "../view-models/inventory-overlay.view-model.js";

type InventoryOverlayItemStack = {
  itemId: LootTableItemId;
  amount: number;
};

type WeaponIconSize = {
  width: number;
  height: number;
};

const WEAPON_SLOT_ORDER: readonly WeaponType[] = [
  WeaponType.PISTOL,
  WeaponType.SMG,
  WeaponType.RIFLE,
  WeaponType.SNIPER,
  WeaponType.SHOTGUN,
];

export class InventoryOverlayPresenter {
  private draggedBackpackSlotIndex: number | null = null;
  private backpackPlacementItemIds: Array<LootTableItemId | null> = [];

  constructor(
    private inventoryManager: InventoryManager,
    private inventoryComponentStore: ComponentStore<InventoryComponent>,
    private playerComponentStore: ComponentStore<PlayerComponent>,
  ) { }

  public buildViewModel(): InventoryOverlayViewModel | null {
    const inventory = this.getPlayerInventory();

    if (!inventory) {
      return null;
    }

    const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
    const backpackItemStacks = this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots);
    const backpackColumnCount = Math.max(
      1,
      Math.min(backpackMaxSlots || 1, INVENTORY_OVERLAY_SKIN_MAP.layout.backpackMaxSlotsPerRow),
    );
    const backpackRowCount = Math.max(
      1,
      Math.ceil((backpackMaxSlots || 1) / INVENTORY_OVERLAY_SKIN_MAP.layout.backpackMaxSlotsPerRow),
    );
    const backpackSlotsWidth = (backpackColumnCount * INVENTORY_OVERLAY_SKIN_MAP.itemSlot.width)
      + Math.max(0, backpackColumnCount - 1) * INVENTORY_OVERLAY_SKIN_MAP.layout.slotGap;
    const backpackSlotsHeight = (backpackRowCount * INVENTORY_OVERLAY_SKIN_MAP.itemSlot.height)
      + Math.max(0, backpackRowCount - 1) * INVENTORY_OVERLAY_SKIN_MAP.layout.slotGap;
    const backpackFrameWidth = backpackSlotsWidth + INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding * 2;
    const backpackFrameHeight = backpackSlotsHeight + INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding * 2;

    return {
      backpackFrameHeight,
      backpackFrameWidth,
      backpackFrameX: Math.round((INVENTORY_OVERLAY_SKIN_MAP.layout.contentWidth - backpackFrameWidth) / 2),
      backpackFrameY: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.offsetY,
      backpackSlots: this.buildBackpackSlotViewModels(backpackMaxSlots, backpackItemStacks),
      weaponSlots: this.buildWeaponSlotViewModels(inventory),
    };
  }

  public addLootItemToBackpackSlot(
    itemId: LootTableItemId,
    amount: number,
    targetSlotIndex: number,
  ): boolean {
    const inventory = this.getPlayerInventory();

    if (!inventory) {
      return false;
    }

    const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);

    if (!this.isBackpackSlotIndexInRange(targetSlotIndex, backpackMaxSlots)) {
      return false;
    }

    if (!this.isBackpackSlotEmptyForInventory(inventory, targetSlotIndex, backpackMaxSlots)) {
      return false;
    }

    if (!this.inventoryManager.addLootItem(inventory, itemId, amount)) {
      return false;
    }

    this.bindItemToBackpackSlot(itemId, targetSlotIndex, backpackMaxSlots);
    return true;
  }

  public getBackpackSlotLootSlot(slotIndex: number): LootContainerLootSlot | null {
    const inventory = this.getPlayerInventory();

    if (!inventory) {
      return null;
    }

    const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
    const itemStack = this.getBackpackSlotItemStackForInventory(
      inventory,
      slotIndex,
      backpackMaxSlots,
    );

    if (!itemStack) {
      return null;
    }

    return {
      amount: itemStack.amount,
      itemId: itemStack.itemId,
    };
  }

  public isBackpackSlotEmpty(slotIndex: number): boolean {
    const inventory = this.getPlayerInventory();

    if (!inventory) {
      return false;
    }

    const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);

    return this.isBackpackSlotEmptyForInventory(inventory, slotIndex, backpackMaxSlots);
  }

  public moveBackpackSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
    const inventory = this.getPlayerInventory();

    if (!inventory) {
      return false;
    }

    const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);

    if (!this.isBackpackSlotIndexInRange(sourceSlotIndex, backpackMaxSlots)
      || !this.isBackpackSlotIndexInRange(targetSlotIndex, backpackMaxSlots)) {
      return false;
    }

    if (sourceSlotIndex === targetSlotIndex) {
      return true;
    }

    const sourceItemStack = this.getBackpackSlotItemStackForInventory(
      inventory,
      sourceSlotIndex,
      backpackMaxSlots,
    );

    if (!sourceItemStack) {
      return false;
    }

    if (!this.isBackpackSlotEmptyForInventory(inventory, targetSlotIndex, backpackMaxSlots)) {
      return false;
    }

    this.clearBackpackSlotBinding(sourceSlotIndex, backpackMaxSlots);
    this.bindItemToBackpackSlot(sourceItemStack.itemId, targetSlotIndex, backpackMaxSlots);
    return true;
  }

  public removeBackpackSlotItem(slotIndex: number): LootContainerLootSlot | null {
    const inventory = this.getPlayerInventory();

    if (!inventory) {
      return null;
    }

    const backpackMaxSlots = this.inventoryManager.getBackpackMaxSlots(inventory);
    const itemStack = this.getBackpackSlotItemStackForInventory(
      inventory,
      slotIndex,
      backpackMaxSlots,
    );

    if (!itemStack) {
      return null;
    }

    if (!this.removeLootItem(inventory, itemStack.itemId, itemStack.amount)) {
      return null;
    }

    this.clearBackpackSlotBinding(slotIndex, backpackMaxSlots);

    return {
      amount: itemStack.amount,
      itemId: itemStack.itemId,
    };
  }

  public setDraggedBackpackSlotIndex(slotIndex: number | null): void {
    this.draggedBackpackSlotIndex = slotIndex;
  }

  private buildBackpackSlotViewModels(
    backpackMaxSlots: number,
    itemStacks: Array<InventoryOverlayItemStack | null>,
  ): InventoryOverlayBackpackSlotViewModel[] {
    return Array.from({ length: backpackMaxSlots }, (_value, slotIndex) => {
      const itemStack = itemStacks[slotIndex] ?? null;
      const itemVisible = itemStack !== null && this.draggedBackpackSlotIndex !== slotIndex;
      const column = slotIndex % INVENTORY_OVERLAY_SKIN_MAP.layout.backpackMaxSlotsPerRow;
      const row = Math.floor(slotIndex / INVENTORY_OVERLAY_SKIN_MAP.layout.backpackMaxSlotsPerRow);
      const lootSprite = itemStack
        ? getLootSprite(itemStack.itemId)
        : {
          spriteName: SpriteName.BLANK,
          spriteSheetName: SpriteSheetName.BLANK,
        };
      const hasLootSprite = lootSprite.spriteName !== SpriteName.BLANK
        || lootSprite.spriteSheetName !== SpriteSheetName.BLANK;

      return {
        amountText: itemStack ? `${itemStack.amount}` : "",
        iconHeight: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.height,
        iconSpriteName: lootSprite.spriteName,
        iconSpriteSheetName: lootSprite.spriteSheetName,
        iconVisible: itemVisible && hasLootSprite,
        iconWidth: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.width,
        labelText: itemStack ? formatInventoryItemAbbreviation(itemStack.itemId) : "",
        labelVisible: itemVisible && !hasLootSprite,
        quantityVisible: itemVisible,
        slotIndex,
        visible: true,
        x: column * (INVENTORY_OVERLAY_SKIN_MAP.itemSlot.width + INVENTORY_OVERLAY_SKIN_MAP.layout.slotGap),
        y: row * (INVENTORY_OVERLAY_SKIN_MAP.itemSlot.height + INVENTORY_OVERLAY_SKIN_MAP.layout.slotGap),
      };
    });
  }

  private buildBackpackItemStacks(inventory: InventoryComponent): InventoryOverlayItemStack[] {
    const itemStacks: InventoryOverlayItemStack[] = [];

    for (const resourceType of INVENTORY_RESOURCE_TYPES) {
      if (resourceType === InventoryResourceType.Money) {
        continue;
      }

      const amount = this.inventoryManager.getResourceAmount(inventory, resourceType);

      if (amount > 0) {
        itemStacks.push({
          itemId: resourceType,
          amount,
        });
      }
    }

    for (const miscResourceType of MISC_RESOURCE_TYPES) {
      if (this.inventoryManager.resolveBackpackUpgradeType(miscResourceType) !== null) {
        continue;
      }

      const amount = this.inventoryManager.getMiscResourceAmount(inventory, miscResourceType);

      if (amount > 0) {
        itemStacks.push({
          itemId: miscResourceType,
          amount,
        });
      }
    }

    return itemStacks;
  }

  private buildPlacedBackpackItemStacks(
    inventory: InventoryComponent,
    backpackMaxSlots: number,
  ): Array<InventoryOverlayItemStack | null> {
    const itemStacks = this.buildBackpackItemStacks(inventory);
    const itemStackById = new Map<LootTableItemId, InventoryOverlayItemStack>();

    for (const itemStack of itemStacks) {
      itemStackById.set(itemStack.itemId, itemStack);
    }

    this.normalizeBackpackPlacement(backpackMaxSlots);

    const placedItemStacks = new Array<InventoryOverlayItemStack | null>(backpackMaxSlots).fill(null);
    const placedItemIds = new Set<LootTableItemId>();

    for (let slotIndex = 0; slotIndex < backpackMaxSlots; slotIndex++) {
      const placedItemId = this.backpackPlacementItemIds[slotIndex] ?? null;

      if (placedItemId === null) {
        continue;
      }

      const itemStack = itemStackById.get(placedItemId) ?? null;

      if (!itemStack || placedItemIds.has(placedItemId)) {
        this.backpackPlacementItemIds[slotIndex] = null;
        continue;
      }

      placedItemStacks[slotIndex] = itemStack;
      placedItemIds.add(placedItemId);
    }

    for (const itemStack of itemStacks) {
      if (placedItemIds.has(itemStack.itemId)) {
        continue;
      }

      const emptySlotIndex = placedItemStacks.findIndex((slot) => slot === null);

      if (emptySlotIndex === -1) {
        break;
      }

      placedItemStacks[emptySlotIndex] = itemStack;
      this.backpackPlacementItemIds[emptySlotIndex] = itemStack.itemId;
      placedItemIds.add(itemStack.itemId);
    }

    return placedItemStacks;
  }

  private bindItemToBackpackSlot(
    itemId: LootTableItemId,
    slotIndex: number,
    backpackMaxSlots: number,
  ): void {
    this.normalizeBackpackPlacement(backpackMaxSlots);

    for (let currentSlotIndex = 0; currentSlotIndex < backpackMaxSlots; currentSlotIndex++) {
      if (this.backpackPlacementItemIds[currentSlotIndex] !== itemId) {
        continue;
      }

      this.backpackPlacementItemIds[currentSlotIndex] = null;
    }

    this.backpackPlacementItemIds[slotIndex] = itemId;
  }

  private clearBackpackSlotBinding(slotIndex: number, backpackMaxSlots: number): void {
    if (!this.isBackpackSlotIndexInRange(slotIndex, backpackMaxSlots)) {
      return;
    }

    this.normalizeBackpackPlacement(backpackMaxSlots);
    this.backpackPlacementItemIds[slotIndex] = null;
  }

  private getBackpackSlotItemStackForInventory(
    inventory: InventoryComponent,
    slotIndex: number,
    backpackMaxSlots: number,
  ): InventoryOverlayItemStack | null {
    if (!this.isBackpackSlotIndexInRange(slotIndex, backpackMaxSlots)) {
      return null;
    }

    return this.buildPlacedBackpackItemStacks(inventory, backpackMaxSlots)[slotIndex] ?? null;
  }

  private isBackpackSlotEmptyForInventory(
    inventory: InventoryComponent,
    slotIndex: number,
    backpackMaxSlots: number,
  ): boolean {
    return this.getBackpackSlotItemStackForInventory(
      inventory,
      slotIndex,
      backpackMaxSlots,
    ) === null;
  }

  private isBackpackSlotIndexInRange(slotIndex: number, backpackMaxSlots: number): boolean {
    return Number.isInteger(slotIndex)
      && slotIndex >= 0
      && slotIndex < backpackMaxSlots;
  }

  private normalizeBackpackPlacement(backpackMaxSlots: number): void {
    if (this.backpackPlacementItemIds.length > backpackMaxSlots) {
      this.backpackPlacementItemIds.length = backpackMaxSlots;
    }

    while (this.backpackPlacementItemIds.length < backpackMaxSlots) {
      this.backpackPlacementItemIds.push(null);
    }
  }

  private removeLootItem(
    inventory: InventoryComponent,
    itemId: LootTableItemId,
    amount: number,
  ): boolean {
    if (isInventoryResourceType(itemId)) {
      return this.inventoryManager.removeResource(inventory, itemId, amount);
    }

    return this.inventoryManager.removeMiscResource(inventory, itemId, amount);
  }

  private buildWeaponSlotViewModels(inventory: InventoryComponent): InventoryOverlayWeaponSlotViewModel[] {
    const ownedWeaponTypes = WEAPON_SLOT_ORDER.filter((weaponType) => {
      return this.inventoryManager.getWeaponState(inventory, weaponType)?.owned === true;
    });

    return ownedWeaponTypes.map((weaponType, slotIndex) => {
      const weaponSpriteSize = this.resolveWeaponIconSize(weaponType);
      const ammoResourceType = this.resolveAmmoResourceType(weaponType);
      const ammoSprite = ammoResourceType
        ? this.resolveAmmoSprite(ammoResourceType)
        : {
          spriteName: SpriteName.BLANK,
          spriteSheetName: SpriteSheetName.BLANK,
        };

      return {
        ammoText: this.formatSmallCounter(
          this.inventoryManager.getRoundsInMag(inventory, weaponType),
        ),
        iconHeight: weaponSpriteSize.height,
        iconSpriteName: this.resolveWeaponSprite(weaponType),
        iconSpriteSheetName: SpriteSheetName.WEAPON,
        iconWidth: weaponSpriteSize.width,
        magIconHeight: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.height,
        magIconSpriteName: ammoSprite.spriteName,
        magIconSpriteSheetName: ammoSprite.spriteSheetName,
        magIconWidth: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.width,
        magText: this.formatSmallCounter(
          ammoResourceType
            ? this.inventoryManager.getResourceAmount(inventory, ammoResourceType)
            : 0,
        ),
        slotIndex,
        visible: true,
        x: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.rowOffsetX,
        y: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.rowOffsetY
          + slotIndex * (INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.height + INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.rowGap),
      };
    });
  }

  private formatSmallCounter(value: number): string {
    const normalizedValue = Math.max(0, Math.floor(value));
    return normalizedValue < 10
      ? `0${normalizedValue}`
      : `${normalizedValue}`;
  }

  private getPlayerInventory(): InventoryComponent | null {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];

    if (playerEntity == null) {
      return null;
    }

    return this.inventoryComponentStore.getOrNull(playerEntity);
  }

  private resolveAmmoResourceType(weaponType: WeaponType): InventoryResourceType | null {
    switch (weaponType) {
      case WeaponType.PISTOL:
        return InventoryResourceType.PistolMag;

      case WeaponType.SMG:
        return InventoryResourceType.SmgMag;

      case WeaponType.RIFLE:
        return InventoryResourceType.RifleMag;

      case WeaponType.SNIPER:
        return InventoryResourceType.SniperMag;

      case WeaponType.SHOTGUN:
        return InventoryResourceType.ShotgunShell;

      default:
        return null;
    }
  }

  private resolveAmmoSprite(resourceType: InventoryResourceType): {
    spriteName: SpriteName;
    spriteSheetName: SpriteSheetName;
  } {
    switch (resourceType) {
      case InventoryResourceType.PistolMag:
        return this.buildResourceIcon(SpriteName.PISTOL_MAG_ICON);

      case InventoryResourceType.SmgMag:
        return this.buildResourceIcon(SpriteName.SMG_MAG_ICON);

      case InventoryResourceType.RifleMag:
        return this.buildResourceIcon(SpriteName.RIFLE_MAG_ICON);

      case InventoryResourceType.SniperMag:
        return this.buildResourceIcon(SpriteName.SNIPER_MAG_ICON);

      case InventoryResourceType.ShotgunShell:
        return this.buildResourceIcon(SpriteName.SHOTGUN_SHELL_BOX_ICON);

      default:
        return this.buildResourceIcon(SpriteName.BLANK);
    }
  }

  private buildResourceIcon(spriteName: SpriteName): {
    spriteName: SpriteName;
    spriteSheetName: SpriteSheetName;
  } {
    return {
      spriteName,
      spriteSheetName: spriteName === SpriteName.BLANK
        ? SpriteSheetName.BLANK
        : SpriteSheetName.RESOURCES_ICON,
    };
  }

  private resolveWeaponIconSize(weaponType: WeaponType): WeaponIconSize {
    switch (weaponType) {
      case WeaponType.PISTOL:
        return { width: 30, height: 20 };

      case WeaponType.SMG:
        return { width: 36, height: 20 };

      case WeaponType.RIFLE:
        return { width: 42, height: 20 };

      case WeaponType.SNIPER:
        return { width: 44, height: 20 };

      case WeaponType.SHOTGUN:
        return { width: 42, height: 20 };

      default:
        return {
          width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.width,
          height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.height,
        };
    }
  }

  private resolveWeaponSprite(weaponType: WeaponType): SpriteName {
    switch (weaponType) {
      case WeaponType.PISTOL:
        return SpriteName.PISTOL;

      case WeaponType.SMG:
        return SpriteName.SMG;

      case WeaponType.RIFLE:
        return SpriteName.RIFLE;

      case WeaponType.SNIPER:
        return SpriteName.SNIPER;

      case WeaponType.SHOTGUN:
        return SpriteName.SHOTGUN;

      default:
        return SpriteName.BLANK;
    }
  }
}

function formatInventoryItemName(itemId: LootTableItemId): string {
  return `${itemId}`
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatInventoryItemAbbreviation(itemId: LootTableItemId): string {
  const words = formatInventoryItemName(itemId).split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] ?? "").slice(0, 2).toUpperCase();
}

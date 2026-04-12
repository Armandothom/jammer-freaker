import { GunDealerComponent } from "../components/gun-dealer-component.js";
import { ShopDialogIntentComponent } from "../components/shop-dialog-intent.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../components/states/shop-upgrade-tab-state.js";
import { ShopDialogEvent } from "../components/types/shop-dialog-event.enum.js";
import { isShopResourceItemType } from "../components/types/shop-resource-item-config.js";
import { isShopTabType } from "../components/types/shop-tab-config.js";
import {
  isShopUpgradeTabType,
  SHOP_UPGRADE_TAB_CONFIG,
} from "../components/types/shop-upgrade-tab-config.js";
import { isShopWeaponItemType } from "../components/types/shop-weapon-item-config.js";
import { isWeaponUpgradeType } from "../components/types/weapon-upgrade-config.js";
import { SHOP_UI_ACTION } from "../../ui/input/shop-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { navigateShopUpgradeTabWindow } from "../../ui/presenters/shop-upgrade-tab-support.js";
import { ComponentStore } from "./component-store.js";
import { EntityManager } from "./entity-manager.js";

const SHOP_HIGH_MONEY_THRESHOLD = 2000;
const SHOP_MEDIUM_MONEY_THRESHOLD = 750;

export class ShopActionController implements UIActionHandler {
  private gunDealerEntityId: number | null = null;

  constructor(
    private entityManager: EntityManager,
    private shopInventoryState: ShopInventoryState,
    private shopTabState: ShopTabState,
    private shopUpgradeTabState: ShopUpgradeTabState,
    private shopDialogIntentComponentStore: ComponentStore<ShopDialogIntentComponent>,
    private gunDealerComponentStore: ComponentStore<GunDealerComponent>,
    private requestGameplayState: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case SHOP_UI_ACTION.SELECT_TAB:
        return this.handleSelectTab(action);

      case SHOP_UI_ACTION.BUY_WEAPON:
        return this.handleBuyWeapon(action);

      case SHOP_UI_ACTION.BUY_RESOURCE:
        return this.handleBuyResource(action);

      case SHOP_UI_ACTION.SELECT_UPGRADE_TAB:
        return this.handleSelectUpgradeTab(action);

      case SHOP_UI_ACTION.NAVIGATE_UPGRADE_TABS:
        return this.handleNavigateUpgradeTabs(action);

      case SHOP_UI_ACTION.BUY_UPGRADE:
        return this.handleBuyUpgrade(action);

      case SHOP_UI_ACTION.RETURN_TO_GAMEPLAY:
        this.requestGameplayState();
        return true;

      default:
        return false;
    }
  }

  public initialize(): void {
    const gunDealerEntityId = this.ensureGunDealerEntity();
    this.shopDialogIntentComponentStore.add(
      gunDealerEntityId,
      new ShopDialogIntentComponent(
        this.resolveEntryDialogEvent(this.shopInventoryState.getMoney()),
      ),
    );
  }

  public reset(): void {
    this.gunDealerEntityId = null;
  }

  private ensureGunDealerEntity(): number {
    if (this.gunDealerEntityId != null && this.gunDealerComponentStore.has(this.gunDealerEntityId)) {
      return this.gunDealerEntityId;
    }

    const existingEntityId = this.gunDealerComponentStore.getAllEntities()[0];
    if (existingEntityId != null) {
      this.gunDealerEntityId = existingEntityId;
      return existingEntityId;
    }

    const entityId = this.entityManager.registerEntity();
    this.gunDealerComponentStore.add(entityId, new GunDealerComponent());
    this.gunDealerEntityId = entityId;

    return entityId;
  }

  private handleBuyResource(action: UIAction): boolean {
    const itemType = action.payload?.itemType;
    if (!itemType || !isShopResourceItemType(itemType)) {
      return false;
    }

    const didPurchase = this.shopInventoryState.tryPurchaseResourceItem(itemType);
    if (!didPurchase) {
      this.maybeQueueCantBuyDialog();
    }

    return true;
  }

  private handleBuyUpgrade(action: UIAction): boolean {
    const upgradeType = action.payload?.upgradeType;
    if (!upgradeType || !isWeaponUpgradeType(upgradeType)) {
      return false;
    }

    const activeUpgradeTabType = this.shopUpgradeTabState.getActiveTabType();
    const shopUpgradeConfig = SHOP_UPGRADE_TAB_CONFIG[activeUpgradeTabType];
    if (!shopUpgradeConfig) {
      return true;
    }

    const didPurchase = this.shopInventoryState.tryPurchaseWeaponUpgrade(
      shopUpgradeConfig.weaponType,
      upgradeType,
    );

    if (!didPurchase) {
      this.maybeQueueCantBuyDialog();
    }

    return true;
  }

  private handleBuyWeapon(action: UIAction): boolean {
    const itemType = action.payload?.itemType;
    if (!itemType || !isShopWeaponItemType(itemType)) {
      return false;
    }

    const didPurchase = this.shopInventoryState.tryPurchaseWeaponItem(itemType);
    if (!didPurchase) {
      this.maybeQueueCantBuyDialog();
    }

    return true;
  }

  private handleNavigateUpgradeTabs(action: UIAction): boolean {
    const direction = action.payload?.direction;
    if (direction !== "left" && direction !== "right") {
      return false;
    }

    navigateShopUpgradeTabWindow(
      this.shopInventoryState,
      this.shopUpgradeTabState,
      direction === "left" ? -1 : 1,
    );
    return true;
  }

  private handleSelectTab(action: UIAction): boolean {
    const tabType = action.payload?.tabType;
    if (!tabType || !isShopTabType(tabType)) {
      return false;
    }

    if (this.shopTabState.getActiveTabType() === tabType) {
      return true;
    }

    this.shopTabState.setActiveTabType(tabType);
    return true;
  }

  private handleSelectUpgradeTab(action: UIAction): boolean {
    const tabType = action.payload?.tabType;
    if (!tabType || !isShopUpgradeTabType(tabType)) {
      return false;
    }

    if (this.shopUpgradeTabState.getActiveTabType() === tabType) {
      return true;
    }

    this.shopUpgradeTabState.setActiveTabType(tabType);
    return true;
  }

  private maybeQueueCantBuyDialog(): void {
    const gunDealerEntityId = this.ensureGunDealerEntity();
    if (this.shopDialogIntentComponentStore.has(gunDealerEntityId)) {
      return;
    }

    if (Math.random() <= 0.5) {
      return;
    }

    this.shopDialogIntentComponentStore.add(
      gunDealerEntityId,
      new ShopDialogIntentComponent(ShopDialogEvent.CANT_BUY),
    );
  }

  private resolveEntryDialogEvent(money: number): ShopDialogEvent {
    if (money >= SHOP_HIGH_MONEY_THRESHOLD) {
      return ShopDialogEvent.ENTER_SHOP_HIGH_MONEY;
    }

    if (money >= SHOP_MEDIUM_MONEY_THRESHOLD) {
      return ShopDialogEvent.ENTER_SHOP_MEDIUM_MONEY;
    }

    return ShopDialogEvent.ENTER_SHOP_LOW_MONEY;
  }
}

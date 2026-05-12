import { GunDealerComponent } from "../components/gun-dealer-component.js";
import { GunsShopDialogIntentComponent } from "../components/guns-shop-dialog-intent.component.js";
import { GunsShopInventoryState } from "../components/states/guns-shop-inventory-state.js";
import { GunsShopTabState } from "../components/states/guns-shop-tab-state.js";
import { GunsShopUpgradeTabState } from "../components/states/guns-shop-upgrade-tab-state.js";
import { GunsShopDialogEvent } from "../components/types/guns-shop-dialog-event.enum.js";
import { isGunsShopResourceItemType } from "../components/types/guns-shop-resource-item-config.js";
import { isGunsShopTabType } from "../components/types/guns-shop-tab-config.js";
import {
  isGunsShopUpgradeTabType,
  GUNS_SHOP_UPGRADE_TAB_CONFIG,
} from "../components/types/guns-shop-upgrade-tab-config.js";
import { isGunsShopWeaponItemType } from "../components/types/guns-shop-weapon-item-config.js";
import { isWeaponUpgradeType } from "../components/types/weapon-upgrade-config.js";
import { GUNS_SHOP_UI_ACTION } from "../../ui/input/guns-shop-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { navigateGunsShopUpgradeTabWindow } from "../../ui/presenters/guns-shop-upgrade-tab-support.js";
import { ComponentStore } from "./component-store.js";
import { EntityManager } from "./entity-manager.js";

const GUNS_SHOP_HIGH_MONEY_THRESHOLD = 2000;
const GUNS_SHOP_MEDIUM_MONEY_THRESHOLD = 750;

export class GunsShopActionController implements UIActionHandler {
  private gunDealerEntityId: number | null = null;

  constructor(
    private entityManager: EntityManager,
    private gunsShopInventoryState: GunsShopInventoryState,
    private gunsShopTabState: GunsShopTabState,
    private gunsShopUpgradeTabState: GunsShopUpgradeTabState,
    private gunsShopDialogIntentComponentStore: ComponentStore<GunsShopDialogIntentComponent>,
    private gunDealerComponentStore: ComponentStore<GunDealerComponent>,
    private requestGameplayState: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case GUNS_SHOP_UI_ACTION.SELECT_TAB:
        return this.handleSelectTab(action);

      case GUNS_SHOP_UI_ACTION.BUY_WEAPON:
        return this.handleBuyWeapon(action);

      case GUNS_SHOP_UI_ACTION.BUY_RESOURCE:
        return this.handleBuyResource(action);

      case GUNS_SHOP_UI_ACTION.SELECT_UPGRADE_TAB:
        return this.handleSelectUpgradeTab(action);

      case GUNS_SHOP_UI_ACTION.NAVIGATE_UPGRADE_TABS:
        return this.handleNavigateUpgradeTabs(action);

      case GUNS_SHOP_UI_ACTION.BUY_UPGRADE:
        return this.handleBuyUpgrade(action);

      case GUNS_SHOP_UI_ACTION.RETURN_TO_GAMEPLAY:
        this.requestGameplayState();
        return true;

      default:
        return false;
    }
  }

  public initialize(): void {
    const gunDealerEntityId = this.ensureGunDealerEntity();
    this.gunsShopDialogIntentComponentStore.add(
      gunDealerEntityId,
      new GunsShopDialogIntentComponent(
        this.resolveEntryDialogEvent(this.gunsShopInventoryState.getMoney()),
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
    if (!itemType || !isGunsShopResourceItemType(itemType)) {
      return false;
    }

    const didPurchase = this.gunsShopInventoryState.tryPurchaseResourceItem(itemType);
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

    const activeUpgradeTabType = this.gunsShopUpgradeTabState.getActiveTabType();
    const gunsShopUpgradeConfig = GUNS_SHOP_UPGRADE_TAB_CONFIG[activeUpgradeTabType];
    if (!gunsShopUpgradeConfig) {
      return true;
    }

    const didPurchase = this.gunsShopInventoryState.tryPurchaseWeaponUpgrade(
      gunsShopUpgradeConfig.weaponType,
      upgradeType,
    );

    if (!didPurchase) {
      this.maybeQueueCantBuyDialog();
    }

    return true;
  }

  private handleBuyWeapon(action: UIAction): boolean {
    const itemType = action.payload?.itemType;
    if (!itemType || !isGunsShopWeaponItemType(itemType)) {
      return false;
    }

    const didPurchase = this.gunsShopInventoryState.tryPurchaseWeaponItem(itemType);
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

    navigateGunsShopUpgradeTabWindow(
      this.gunsShopInventoryState,
      this.gunsShopUpgradeTabState,
      direction === "left" ? -1 : 1,
    );
    return true;
  }

  private handleSelectTab(action: UIAction): boolean {
    const tabType = action.payload?.tabType;
    if (!tabType || !isGunsShopTabType(tabType)) {
      return false;
    }

    if (this.gunsShopTabState.getActiveTabType() === tabType) {
      return true;
    }

    this.gunsShopTabState.setActiveTabType(tabType);
    return true;
  }

  private handleSelectUpgradeTab(action: UIAction): boolean {
    const tabType = action.payload?.tabType;
    if (!tabType || !isGunsShopUpgradeTabType(tabType)) {
      return false;
    }

    if (this.gunsShopUpgradeTabState.getActiveTabType() === tabType) {
      return true;
    }

    this.gunsShopUpgradeTabState.setActiveTabType(tabType);
    return true;
  }

  private maybeQueueCantBuyDialog(): void {
    const gunDealerEntityId = this.ensureGunDealerEntity();
    if (this.gunsShopDialogIntentComponentStore.has(gunDealerEntityId)) {
      return;
    }

    if (Math.random() <= 0.5) {
      return;
    }

    this.gunsShopDialogIntentComponentStore.add(
      gunDealerEntityId,
      new GunsShopDialogIntentComponent(GunsShopDialogEvent.CANT_BUY),
    );
  }

  private resolveEntryDialogEvent(money: number): GunsShopDialogEvent {
    if (money >= GUNS_SHOP_HIGH_MONEY_THRESHOLD) {
      return GunsShopDialogEvent.ENTER_GUNS_SHOP_HIGH_MONEY;
    }

    if (money >= GUNS_SHOP_MEDIUM_MONEY_THRESHOLD) {
      return GunsShopDialogEvent.ENTER_GUNS_SHOP_MEDIUM_MONEY;
    }

    return GunsShopDialogEvent.ENTER_GUNS_SHOP_LOW_MONEY;
  }
}

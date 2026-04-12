import { ShopInventoryState } from "../../ecs/components/states/shop-inventory-state.js";
import { ShopTabState } from "../../ecs/components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../../ecs/components/states/shop-upgrade-tab-state.js";
import { SHOP_RESOURCE_ITEMS_ORDER } from "../../ecs/components/types/shop-resource-item-config.js";
import { SHOP_TABS_ORDER, ShopTabType } from "../../ecs/components/types/shop-tab-config.js";
import {
  SHOP_UPGRADE_TAB_CONFIG,
  type ShopUpgradeTabType,
} from "../../ecs/components/types/shop-upgrade-tab-config.js";
import {
  getUpgradeValueIncrease,
  getWeaponUpgradeName,
  getWeaponUpgradePrice,
  WEAPON_UPGRADE_TYPES_ORDER,
  WeaponUpgradeType,
} from "../../ecs/components/types/weapon-upgrade-config.js";
import { SHOP_WEAPON_ITEMS_ORDER } from "../../ecs/components/types/shop-weapon-item-config.js";
import type { ShopUpgradeRowViewModel, ShopViewModel } from "../view-models/shop.view-model.js";
import { SHOP_SKIN_MAP } from "../style/shop-skin-map.js";
import { UIButtonState } from "../style/ui-button-config.js";
import { resolveShopUpgradeTabWindowState } from "./shop-upgrade-tab-support.js";

export class ShopPresenter {
  constructor(
    private shopInventoryState: ShopInventoryState,
    private shopTabState: ShopTabState,
    private shopUpgradeTabState: ShopUpgradeTabState,
  ) { }

  public buildViewModel(): ShopViewModel {
    const activeTab = this.shopTabState.getActiveTabType();
    const upgradeTabWindow = resolveShopUpgradeTabWindowState(
      this.shopInventoryState,
      this.shopUpgradeTabState,
    );

    return {
      activeTab,
      moneyText: `$${this.formatMoney(this.shopInventoryState.getMoney())}`,
      resourceItems: SHOP_RESOURCE_ITEMS_ORDER.map((itemType) => {
        const stock = this.shopInventoryState.getAvailableResourceItemStock(itemType);

        return {
          buttonState: stock > 0
            ? UIButtonState.NORMAL
            : UIButtonState.DISABLED,
          itemType,
          quantityText: `x${stock}`,
          visible: activeTab === ShopTabType.RESOURCES,
        };
      }),
      tabs: SHOP_TABS_ORDER.map((tabType) => ({
        buttonState: tabType === activeTab
          ? UIButtonState.SELECTED
          : UIButtonState.NORMAL,
        tabType,
      })),
      upgradeRows: this.buildUpgradeRows(activeTab, upgradeTabWindow),
      upgradeSectionVisible: activeTab === ShopTabType.UPGRADES,
      upgradeTabs: {
        buttons: (Object.keys(SHOP_UPGRADE_TAB_CONFIG) as ShopUpgradeTabType[]).map((tabType) => ({
          buttonState: upgradeTabWindow?.activeTabType === tabType
            ? UIButtonState.SELECTED
            : UIButtonState.NORMAL,
          offsetX: upgradeTabWindow?.tabOffsetsByType.get(tabType) ?? SHOP_SKIN_MAP.upgradeTabs.offsetX,
          tabType,
          visible: activeTab === ShopTabType.UPGRADES
            && !!upgradeTabWindow
            && upgradeTabWindow.visibleTabs.indexOf(tabType) !== -1,
        })),
        leftNavigationOffsetX: upgradeTabWindow?.leftNavOffsetX ?? SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
        leftNavigationVisible: activeTab === ShopTabType.UPGRADES
          && !!upgradeTabWindow?.canNavigateLeft
          && upgradeTabWindow.leftNavOffsetX != null,
        rightNavigationOffsetX: upgradeTabWindow?.rightNavOffsetX ?? SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
        rightNavigationVisible: activeTab === ShopTabType.UPGRADES
          && !!upgradeTabWindow?.canNavigateRight
          && upgradeTabWindow.rightNavOffsetX != null,
      },
      weaponItems: SHOP_WEAPON_ITEMS_ORDER.map((itemType) => ({
        buttonState: this.shopInventoryState.isWeaponItemPurchased(itemType)
          ? UIButtonState.DISABLED
          : UIButtonState.NORMAL,
        itemType,
        visible: activeTab === ShopTabType.WEAPONS,
      })),
    };
  }

  private buildUpgradeRows(
    activeTab: ShopTabType,
    upgradeTabWindow: ReturnType<typeof resolveShopUpgradeTabWindowState>,
  ): ShopUpgradeRowViewModel[] {
    const rows: ShopUpgradeRowViewModel[] = WEAPON_UPGRADE_TYPES_ORDER.map((upgradeType) => ({
      buttonState: UIButtonState.NORMAL,
      buttonText: "",
      infoText: "",
      labelText: "",
      upgradeType,
      visible: false,
    }));

    if (activeTab !== ShopTabType.UPGRADES || !upgradeTabWindow) {
      return rows;
    }

    const upgradedWeapon = SHOP_UPGRADE_TAB_CONFIG[upgradeTabWindow.activeTabType].weaponType;
    const shouldShowMaxedOutUpgrade = this.shopInventoryState
      .shouldShowWeaponMaxedOutUpgrade(upgradedWeapon);

    WEAPON_UPGRADE_TYPES_ORDER.forEach((upgradeType, index) => {
      if (upgradeType === WeaponUpgradeType.MAXED_OUT && !shouldShowMaxedOutUpgrade) {
        rows[index].visible = false;
        return;
      }

      const upgradeProgressLevel = this.shopInventoryState
        .getWeaponUpgradeProgressLevel(upgradedWeapon, upgradeType);
      const nextUpgradeLevel = this.shopInventoryState
        .getWeaponUpgradeLevel(upgradedWeapon, upgradeType);
      const canPurchaseUpgrade = this.shopInventoryState
        .canPurchaseWeaponUpgrade(upgradedWeapon, upgradeType);
      const upgradeName = getWeaponUpgradeName(upgradeType);

      rows[index] = {
        buttonState: canPurchaseUpgrade
          ? UIButtonState.NORMAL
          : UIButtonState.DISABLED,
        buttonText: canPurchaseUpgrade
          ? `$${this.formatMoney(getWeaponUpgradePrice(
            upgradedWeapon,
            upgradeType,
            nextUpgradeLevel,
          ))}`
          : "MAX",
        infoText: getUpgradeValueIncrease(
          upgradedWeapon,
          upgradeType,
          upgradeProgressLevel,
        ),
        labelText: upgradeType === WeaponUpgradeType.MAXED_OUT
          ? upgradeName
          : `${upgradeName}\nLvl. ${upgradeProgressLevel}`,
        upgradeType,
        visible: true,
      };
    });

    return rows;
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat("en-US").format(value);
  }
}

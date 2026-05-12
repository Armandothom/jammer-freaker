import { GunsShopInventoryState } from "../../ecs/components/states/guns-shop-inventory-state.js";
import { GunsShopTabState } from "../../ecs/components/states/guns-shop-tab-state.js";
import { GunsShopUpgradeTabState } from "../../ecs/components/states/guns-shop-upgrade-tab-state.js";
import { GUNS_SHOP_RESOURCE_ITEMS_ORDER } from "../../ecs/components/types/guns-shop-resource-item-config.js";
import { GUNS_SHOP_TABS_ORDER, GunsShopTabType } from "../../ecs/components/types/guns-shop-tab-config.js";
import {
  GUNS_SHOP_UPGRADE_TAB_CONFIG,
  type GunsShopUpgradeTabType,
} from "../../ecs/components/types/guns-shop-upgrade-tab-config.js";
import {
  getUpgradeValueIncrease,
  getWeaponUpgradeName,
  getWeaponUpgradePrice,
  WEAPON_UPGRADE_TYPES_ORDER,
  WeaponUpgradeType,
} from "../../ecs/components/types/weapon-upgrade-config.js";
import { GUNS_SHOP_WEAPON_ITEMS_ORDER } from "../../ecs/components/types/guns-shop-weapon-item-config.js";
import type { GunsShopUpgradeRowViewModel, GunsShopViewModel } from "../view-models/guns-shop.view-model.js";
import { GUNS_SHOP_SKIN_MAP } from "../style/guns-shop-skin-map.js";
import { UIButtonState } from "../style/ui-button-config.js";
import { resolveGunsShopUpgradeTabWindowState } from "./guns-shop-upgrade-tab-support.js";

export class GunsShopPresenter {
  constructor(
    private gunsShopInventoryState: GunsShopInventoryState,
    private gunsShopTabState: GunsShopTabState,
    private gunsShopUpgradeTabState: GunsShopUpgradeTabState,
  ) { }

  public buildViewModel(): GunsShopViewModel {
    const activeTab = this.gunsShopTabState.getActiveTabType();
    const upgradeTabWindow = resolveGunsShopUpgradeTabWindowState(
      this.gunsShopInventoryState,
      this.gunsShopUpgradeTabState,
    );

    return {
      activeTab,
      moneyText: `$${this.formatMoney(this.gunsShopInventoryState.getMoney())}`,
      resourceItems: GUNS_SHOP_RESOURCE_ITEMS_ORDER.map((itemType) => {
        const stock = this.gunsShopInventoryState.getAvailableResourceItemStock(itemType);

        return {
          buttonState: stock > 0
            ? UIButtonState.NORMAL
            : UIButtonState.DISABLED,
          itemType,
          quantityText: `x${stock}`,
          visible: activeTab === GunsShopTabType.RESOURCES,
        };
      }),
      tabs: GUNS_SHOP_TABS_ORDER.map((tabType) => ({
        buttonState: tabType === activeTab
          ? UIButtonState.SELECTED
          : UIButtonState.NORMAL,
        tabType,
      })),
      upgradeRows: this.buildUpgradeRows(activeTab, upgradeTabWindow),
      upgradeSectionVisible: activeTab === GunsShopTabType.UPGRADES,
      upgradeTabs: {
        buttons: (Object.keys(GUNS_SHOP_UPGRADE_TAB_CONFIG) as GunsShopUpgradeTabType[]).map((tabType) => ({
          buttonState: upgradeTabWindow?.activeTabType === tabType
            ? UIButtonState.SELECTED
            : UIButtonState.NORMAL,
          offsetX: upgradeTabWindow?.tabOffsetsByType.get(tabType) ?? GUNS_SHOP_SKIN_MAP.upgradeTabs.offsetX,
          tabType,
          visible: activeTab === GunsShopTabType.UPGRADES
            && !!upgradeTabWindow
            && upgradeTabWindow.visibleTabs.indexOf(tabType) !== -1,
        })),
        leftNavigationOffsetX: upgradeTabWindow?.leftNavOffsetX ?? GUNS_SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
        leftNavigationVisible: activeTab === GunsShopTabType.UPGRADES
          && !!upgradeTabWindow?.canNavigateLeft
          && upgradeTabWindow.leftNavOffsetX != null,
        rightNavigationOffsetX: upgradeTabWindow?.rightNavOffsetX ?? GUNS_SHOP_SKIN_MAP.upgradeTabs.navOffsetX,
        rightNavigationVisible: activeTab === GunsShopTabType.UPGRADES
          && !!upgradeTabWindow?.canNavigateRight
          && upgradeTabWindow.rightNavOffsetX != null,
      },
      weaponItems: GUNS_SHOP_WEAPON_ITEMS_ORDER.map((itemType) => ({
        buttonState: this.gunsShopInventoryState.isWeaponItemPurchased(itemType)
          ? UIButtonState.DISABLED
          : UIButtonState.NORMAL,
        itemType,
        visible: activeTab === GunsShopTabType.WEAPONS,
      })),
    };
  }

  private buildUpgradeRows(
    activeTab: GunsShopTabType,
    upgradeTabWindow: ReturnType<typeof resolveGunsShopUpgradeTabWindowState>,
  ): GunsShopUpgradeRowViewModel[] {
    const rows: GunsShopUpgradeRowViewModel[] = WEAPON_UPGRADE_TYPES_ORDER.map((upgradeType) => ({
      buttonState: UIButtonState.NORMAL,
      buttonText: "",
      infoText: "",
      labelText: "",
      upgradeType,
      visible: false,
    }));

    if (activeTab !== GunsShopTabType.UPGRADES || !upgradeTabWindow) {
      return rows;
    }

    const upgradedWeapon = GUNS_SHOP_UPGRADE_TAB_CONFIG[upgradeTabWindow.activeTabType].weaponType;
    const shouldShowMaxedOutUpgrade = this.gunsShopInventoryState
      .shouldShowWeaponMaxedOutUpgrade(upgradedWeapon);

    WEAPON_UPGRADE_TYPES_ORDER.forEach((upgradeType, index) => {
      if (upgradeType === WeaponUpgradeType.MAXED_OUT && !shouldShowMaxedOutUpgrade) {
        rows[index].visible = false;
        return;
      }

      const upgradeProgressLevel = this.gunsShopInventoryState
        .getWeaponUpgradeProgressLevel(upgradedWeapon, upgradeType);
      const nextUpgradeLevel = this.gunsShopInventoryState
        .getWeaponUpgradeLevel(upgradedWeapon, upgradeType);
      const canPurchaseUpgrade = this.gunsShopInventoryState
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

import type { GunsShopResourceItemType } from "../../ecs/components/types/guns-shop-resource-item-config.js";
import type { GunsShopTabType } from "../../ecs/components/types/guns-shop-tab-config.js";
import type { GunsShopUpgradeTabType } from "../../ecs/components/types/guns-shop-upgrade-tab-config.js";
import type { GunsShopWeaponItemType } from "../../ecs/components/types/guns-shop-weapon-item-config.js";
import type { WeaponUpgradeType } from "../../ecs/components/types/weapon-upgrade-config.js";
import type { UIAction } from "./ui-action.js";

export const GUNS_SHOP_UI_ACTION = {
  BUY_RESOURCE: "guns-shop.buy-resource",
  BUY_UPGRADE: "guns-shop.buy-upgrade",
  BUY_WEAPON: "guns-shop.buy-weapon",
  NAVIGATE_UPGRADE_TABS: "guns-shop.navigate-upgrade-tabs",
  RETURN_TO_HUB: "guns-shop.return-to-hub",
  SELECT_TAB: "guns-shop.select-tab",
  SELECT_UPGRADE_TAB: "guns-shop.select-upgrade-tab",
} as const;

export function createBuyGunsShopResourceAction(itemType: GunsShopResourceItemType): UIAction {
  return {
    payload: { itemType },
    type: GUNS_SHOP_UI_ACTION.BUY_RESOURCE,
  };
}

export function createBuyGunsShopUpgradeAction(upgradeType: WeaponUpgradeType): UIAction {
  return {
    payload: { upgradeType },
    type: GUNS_SHOP_UI_ACTION.BUY_UPGRADE,
  };
}

export function createBuyGunsShopWeaponAction(itemType: GunsShopWeaponItemType): UIAction {
  return {
    payload: { itemType },
    type: GUNS_SHOP_UI_ACTION.BUY_WEAPON,
  };
}

export function createNavigateGunsShopUpgradeTabsAction(direction: "left" | "right"): UIAction {
  return {
    payload: { direction },
    type: GUNS_SHOP_UI_ACTION.NAVIGATE_UPGRADE_TABS,
  };
}

export function createReturnFromGunsShopToHubAction(): UIAction {
  return {
    type: GUNS_SHOP_UI_ACTION.RETURN_TO_HUB,
  };
}

export function createSelectGunsShopTabAction(tabType: GunsShopTabType): UIAction {
  return {
    payload: { tabType },
    type: GUNS_SHOP_UI_ACTION.SELECT_TAB,
  };
}

export function createSelectGunsShopUpgradeTabAction(tabType: GunsShopUpgradeTabType): UIAction {
  return {
    payload: { tabType },
    type: GUNS_SHOP_UI_ACTION.SELECT_UPGRADE_TAB,
  };
}

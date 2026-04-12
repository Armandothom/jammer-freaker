import type { ShopResourceItemType } from "../../ecs/components/types/shop-resource-item-config.js";
import type { ShopTabType } from "../../ecs/components/types/shop-tab-config.js";
import type { ShopUpgradeTabType } from "../../ecs/components/types/shop-upgrade-tab-config.js";
import type { ShopWeaponItemType } from "../../ecs/components/types/shop-weapon-item-config.js";
import type { WeaponUpgradeType } from "../../ecs/components/types/weapon-upgrade-config.js";
import type { UIAction } from "./ui-action.js";

export const SHOP_UI_ACTION = {
  BUY_RESOURCE: "shop.buy-resource",
  BUY_UPGRADE: "shop.buy-upgrade",
  BUY_WEAPON: "shop.buy-weapon",
  NAVIGATE_UPGRADE_TABS: "shop.navigate-upgrade-tabs",
  RETURN_TO_GAMEPLAY: "shop.return-to-gameplay",
  SELECT_TAB: "shop.select-tab",
  SELECT_UPGRADE_TAB: "shop.select-upgrade-tab",
} as const;

export function createBuyResourceAction(itemType: ShopResourceItemType): UIAction {
  return {
    payload: { itemType },
    type: SHOP_UI_ACTION.BUY_RESOURCE,
  };
}

export function createBuyUpgradeAction(upgradeType: WeaponUpgradeType): UIAction {
  return {
    payload: { upgradeType },
    type: SHOP_UI_ACTION.BUY_UPGRADE,
  };
}

export function createBuyWeaponAction(itemType: ShopWeaponItemType): UIAction {
  return {
    payload: { itemType },
    type: SHOP_UI_ACTION.BUY_WEAPON,
  };
}

export function createNavigateUpgradeTabsAction(direction: "left" | "right"): UIAction {
  return {
    payload: { direction },
    type: SHOP_UI_ACTION.NAVIGATE_UPGRADE_TABS,
  };
}

export function createReturnToGameplayAction(): UIAction {
  return {
    type: SHOP_UI_ACTION.RETURN_TO_GAMEPLAY,
  };
}

export function createSelectShopTabAction(tabType: ShopTabType): UIAction {
  return {
    payload: { tabType },
    type: SHOP_UI_ACTION.SELECT_TAB,
  };
}

export function createSelectUpgradeTabAction(tabType: ShopUpgradeTabType): UIAction {
  return {
    payload: { tabType },
    type: SHOP_UI_ACTION.SELECT_UPGRADE_TAB,
  };
}

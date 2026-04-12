import type { ShopResourceItemType } from "../../../ecs/components/types/shop-resource-item-config.js";
import type { ShopTabType } from "../../../ecs/components/types/shop-tab-config.js";
import type { ShopUpgradeTabType } from "../../../ecs/components/types/shop-upgrade-tab-config.js";
import type { ShopWeaponItemType } from "../../../ecs/components/types/shop-weapon-item-config.js";
import type { WeaponUpgradeType } from "../../../ecs/components/types/weapon-upgrade-config.js";

function createItemNodeIds(prefix: string) {
  return {
    button: `${prefix}.button`,
    icon: `${prefix}.icon`,
    name: `${prefix}.name`,
    quantity: `${prefix}.quantity`,
    root: prefix,
  };
}

function createUpgradeRowNodeIds(prefix: string) {
  return {
    button: `${prefix}.button`,
    info: `${prefix}.info`,
    label: `${prefix}.label`,
    root: prefix,
  };
}

export const SHOP_NODE_IDS = {
  background: "shop.background",
  money: "shop.money",
  resourceItem(itemType: ShopResourceItemType) {
    return createItemNodeIds(`shop.resource.${itemType}`);
  },
  returnButton: "shop.return-button",
  root: "shop.root",
  sections: {
    resources: "shop.section.resources",
    upgrades: "shop.section.upgrades",
    weapons: "shop.section.weapons",
  },
  tab(tabType: ShopTabType) {
    return `shop.tab.${tabType}`;
  },
  upgradeNavigation: {
    left: "shop.upgrade-navigation.left",
    right: "shop.upgrade-navigation.right",
  },
  upgradeRow(upgradeType: WeaponUpgradeType) {
    return createUpgradeRowNodeIds(`shop.upgrade-row.${upgradeType}`);
  },
  upgradeTab(tabType: ShopUpgradeTabType) {
    return `shop.upgrade-tab.${tabType}`;
  },
  weaponItem(itemType: ShopWeaponItemType) {
    return createItemNodeIds(`shop.weapon.${itemType}`);
  },
} as const;

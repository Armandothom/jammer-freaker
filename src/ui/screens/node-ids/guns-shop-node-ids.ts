import type { GunsShopResourceItemType } from "../../../ecs/components/types/guns-shop-resource-item-config.js";
import type { GunsShopTabType } from "../../../ecs/components/types/guns-shop-tab-config.js";
import type { GunsShopUpgradeTabType } from "../../../ecs/components/types/guns-shop-upgrade-tab-config.js";
import type { GunsShopWeaponItemType } from "../../../ecs/components/types/guns-shop-weapon-item-config.js";
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

export const GUNS_SHOP_NODE_IDS = {
  background: "guns-shop.background",
  money: "guns-shop.money",
  resourceItem(itemType: GunsShopResourceItemType) {
    return createItemNodeIds(`guns-shop.resource.${itemType}`);
  },
  returnButton: "guns-shop.return-button",
  root: "guns-shop.root",
  sections: {
    resources: "guns-shop.section.resources",
    upgrades: "guns-shop.section.upgrades",
    weapons: "guns-shop.section.weapons",
  },
  tab(tabType: GunsShopTabType) {
    return `guns-shop.tab.${tabType}`;
  },
  upgradeNavigation: {
    left: "guns-shop.upgrade-navigation.left",
    right: "guns-shop.upgrade-navigation.right",
  },
  upgradeRow(upgradeType: WeaponUpgradeType) {
    return createUpgradeRowNodeIds(`guns-shop.upgrade-row.${upgradeType}`);
  },
  upgradeTab(tabType: GunsShopUpgradeTabType) {
    return `guns-shop.upgrade-tab.${tabType}`;
  },
  weaponItem(itemType: GunsShopWeaponItemType) {
    return createItemNodeIds(`guns-shop.weapon.${itemType}`);
  },
} as const;

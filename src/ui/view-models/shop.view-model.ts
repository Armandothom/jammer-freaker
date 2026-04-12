import type { UIButtonState } from "../style/ui-button-config.js";
import type { ShopResourceItemType } from "../../ecs/components/types/shop-resource-item-config.js";
import type { ShopTabType } from "../../ecs/components/types/shop-tab-config.js";
import type { ShopUpgradeTabType } from "../../ecs/components/types/shop-upgrade-tab-config.js";
import type { ShopWeaponItemType } from "../../ecs/components/types/shop-weapon-item-config.js";
import type { WeaponUpgradeType } from "../../ecs/components/types/weapon-upgrade-config.js";

export type ShopTabButtonViewModel = {
  buttonState: UIButtonState;
  tabType: ShopTabType;
};

export type ShopWeaponItemViewModel = {
  buttonState: UIButtonState;
  itemType: ShopWeaponItemType;
  visible: boolean;
};

export type ShopResourceItemViewModel = {
  buttonState: UIButtonState;
  itemType: ShopResourceItemType;
  quantityText: string;
  visible: boolean;
};

export type ShopUpgradeTabButtonViewModel = {
  buttonState: UIButtonState;
  offsetX: number;
  tabType: ShopUpgradeTabType;
  visible: boolean;
};

export type ShopUpgradeRowViewModel = {
  buttonState: UIButtonState;
  buttonText: string;
  infoText: string;
  labelText: string;
  upgradeType: WeaponUpgradeType;
  visible: boolean;
};

export type ShopViewModel = {
  activeTab: ShopTabType;
  moneyText: string;
  resourceItems: ShopResourceItemViewModel[];
  tabs: ShopTabButtonViewModel[];
  upgradeRows: ShopUpgradeRowViewModel[];
  upgradeSectionVisible: boolean;
  upgradeTabs: {
    buttons: ShopUpgradeTabButtonViewModel[];
    leftNavigationOffsetX: number;
    leftNavigationVisible: boolean;
    rightNavigationOffsetX: number;
    rightNavigationVisible: boolean;
  };
  weaponItems: ShopWeaponItemViewModel[];
};

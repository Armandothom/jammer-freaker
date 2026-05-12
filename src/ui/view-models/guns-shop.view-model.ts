import type { UIButtonState } from "../style/ui-button-config.js";
import type { GunsShopResourceItemType } from "../../ecs/components/types/guns-shop-resource-item-config.js";
import type { GunsShopTabType } from "../../ecs/components/types/guns-shop-tab-config.js";
import type { GunsShopUpgradeTabType } from "../../ecs/components/types/guns-shop-upgrade-tab-config.js";
import type { GunsShopWeaponItemType } from "../../ecs/components/types/guns-shop-weapon-item-config.js";
import type { WeaponUpgradeType } from "../../ecs/components/types/weapon-upgrade-config.js";

export type GunsShopTabButtonViewModel = {
  buttonState: UIButtonState;
  tabType: GunsShopTabType;
};

export type GunsShopWeaponItemViewModel = {
  buttonState: UIButtonState;
  itemType: GunsShopWeaponItemType;
  visible: boolean;
};

export type GunsShopResourceItemViewModel = {
  buttonState: UIButtonState;
  itemType: GunsShopResourceItemType;
  quantityText: string;
  visible: boolean;
};

export type GunsShopUpgradeTabButtonViewModel = {
  buttonState: UIButtonState;
  offsetX: number;
  tabType: GunsShopUpgradeTabType;
  visible: boolean;
};

export type GunsShopUpgradeRowViewModel = {
  buttonState: UIButtonState;
  buttonText: string;
  infoText: string;
  labelText: string;
  upgradeType: WeaponUpgradeType;
  visible: boolean;
};

export type GunsShopViewModel = {
  activeTab: GunsShopTabType;
  moneyText: string;
  resourceItems: GunsShopResourceItemViewModel[];
  tabs: GunsShopTabButtonViewModel[];
  upgradeRows: GunsShopUpgradeRowViewModel[];
  upgradeSectionVisible: boolean;
  upgradeTabs: {
    buttons: GunsShopUpgradeTabButtonViewModel[];
    leftNavigationOffsetX: number;
    leftNavigationVisible: boolean;
    rightNavigationOffsetX: number;
    rightNavigationVisible: boolean;
  };
  weaponItems: GunsShopWeaponItemViewModel[];
};

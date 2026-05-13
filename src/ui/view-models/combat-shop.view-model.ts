import type { CombatShopTabType } from "../../ecs/components/types/combat-shop-tab-config.js";
import type { CombatShopUpgradeType } from "../../ecs/components/types/combat-shop-upgrade-config.js";
import type { UIButtonState } from "../style/ui-button-config.js";

export type CombatShopTabButtonViewModel = {
    buttonState: UIButtonState;
    tabType: CombatShopTabType;
};

export type CombatShopUpgradeItemViewModel = {
    buttonState: UIButtonState;
    descriptionText: string;
    levelText: string;
    priceText: string;
    titleText: string;
    upgradeType: CombatShopUpgradeType;
    visible: boolean;
};

export type CombatShopViewModel = {
    activeTab: CombatShopTabType;
    moneyText: string;
    tabs: CombatShopTabButtonViewModel[];
    upgradeSectionVisible: boolean;
    upgradeItems: CombatShopUpgradeItemViewModel[];
};

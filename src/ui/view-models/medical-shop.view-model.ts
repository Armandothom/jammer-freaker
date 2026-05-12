import type { MedicalShopResourceItemType } from "../../ecs/components/types/medical-shop-resource-item-config.js";
import type { MedicalShopTabType } from "../../ecs/components/types/medical-shop-tab-config.js";
import type { MedicalShopUpgradeItemType } from "../../ecs/components/types/medical-shop-upgrade-item-config.js";
import type { UIButtonState } from "../style/ui-button-config.js";

export type MedicalShopTabButtonViewModel = {
    buttonState: UIButtonState;
    tabType: MedicalShopTabType;
};

export type MedicalShopResourceItemViewModel = {
    buttonState: UIButtonState;
    descriptionText: string;
    itemType: MedicalShopResourceItemType;
    priceText: string;
    quantityText: string;
    visible: boolean;
};

export type MedicalShopUpgradeItemViewModel = {
    buttonState: UIButtonState;
    descriptionText: string;
    levelText: string;
    priceText: string;
    titleText: string;
    upgradeType: MedicalShopUpgradeItemType;
    visible: boolean;
};

export type MedicalShopViewModel = {
    activeTab: MedicalShopTabType;
    moneyText: string;
    resourceItems: MedicalShopResourceItemViewModel[];
    tabs: MedicalShopTabButtonViewModel[];
    resourcesSectionVisible: boolean;
    upgradeSectionVisible: boolean;
    upgradeItems: MedicalShopUpgradeItemViewModel[];
};

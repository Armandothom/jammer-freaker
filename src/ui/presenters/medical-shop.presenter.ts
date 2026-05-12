import { MedicalShopInventoryState } from "../../ecs/components/states/medical-shop-inventory-state.js";
import { MedicalShopTabState } from "../../ecs/components/states/medical-shop-tab-state.js";
import {
    MEDICAL_SHOP_RESOURCE_ITEM_CONFIG,
    MEDICAL_SHOP_RESOURCE_ITEMS_ORDER,
} from "../../ecs/components/types/medical-shop-resource-item-config.js";
import { MEDICAL_SHOP_TABS_ORDER, MedicalShopTabType } from "../../ecs/components/types/medical-shop-tab-config.js";
import {
    MEDICAL_SHOP_UPGRADE_ITEM_CONFIG,
    MEDICAL_SHOP_UPGRADE_ITEMS_ORDER,
} from "../../ecs/components/types/medical-shop-upgrade-item-config.js";
import { UIButtonState } from "../style/ui-button-config.js";
import type { MedicalShopViewModel } from "../view-models/medical-shop.view-model.js";

export class MedicalShopPresenter {
    constructor(
        private medicalShopInventoryState: MedicalShopInventoryState,
        private medicalShopTabState: MedicalShopTabState,
    ) { }

    public buildViewModel(): MedicalShopViewModel {
        const activeTab = this.medicalShopTabState.getActiveTabType();

        return {
            activeTab,
            moneyText: `$${this.formatMoney(this.medicalShopInventoryState.getMoney())}`,
            resourceItems: MEDICAL_SHOP_RESOURCE_ITEMS_ORDER.map((itemType) => {
                const config = MEDICAL_SHOP_RESOURCE_ITEM_CONFIG[itemType];
                const stock = this.medicalShopInventoryState.getAvailableResourceItemStock(itemType);

                return {
                    buttonState: stock > 0
                        ? UIButtonState.NORMAL
                        : UIButtonState.DISABLED,
                    descriptionText: config.description,
                    itemType,
                    priceText: `$${this.formatMoney(config.price)}`,
                    quantityText: `x${stock}`,
                    visible: activeTab === MedicalShopTabType.RESOURCES,
                };
            }),
            resourcesSectionVisible: activeTab === MedicalShopTabType.RESOURCES,
            tabs: MEDICAL_SHOP_TABS_ORDER.map((tabType) => ({
                buttonState: tabType === activeTab
                    ? UIButtonState.SELECTED
                    : UIButtonState.NORMAL,
                tabType,
            })),
            upgradeItems: MEDICAL_SHOP_UPGRADE_ITEMS_ORDER.map((upgradeType) => {
                const config = MEDICAL_SHOP_UPGRADE_ITEM_CONFIG[upgradeType];
                const level = this.medicalShopInventoryState.getUpgradeItemLevel(upgradeType);
                const canPurchase = this.medicalShopInventoryState.canPurchaseUpgradeItem(upgradeType);

                return {
                    buttonState: canPurchase
                        ? UIButtonState.NORMAL
                        : UIButtonState.DISABLED,
                    descriptionText: config.description,
                    levelText: `Lvl. ${level}`,
                    priceText: canPurchase
                        ? `$${this.formatMoney(this.medicalShopInventoryState.getUpgradeItemPrice(upgradeType))}`
                        : "MAX",
                    titleText: config.name,
                    upgradeType,
                    visible: activeTab === MedicalShopTabType.UPGRADES,
                };
            }),
            upgradeSectionVisible: activeTab === MedicalShopTabType.UPGRADES,
        };
    }

    private formatMoney(value: number): string {
        return new Intl.NumberFormat("en-US").format(value);
    }
}

import { CombatShopInventoryState } from "../../ecs/components/states/combat-shop-inventory-state.js";
import { CombatShopTabState } from "../../ecs/components/states/combat-shop-tab-state.js";
import { COMBAT_SHOP_TABS_ORDER, CombatShopTabType } from "../../ecs/components/types/combat-shop-tab-config.js";
import {
    COMBAT_SHOP_UPGRADE_CONFIG,
    COMBAT_SHOP_UPGRADE_ITEMS_ORDER,
} from "../../ecs/components/types/combat-shop-upgrade-config.js";
import { UIButtonState } from "../style/ui-button-config.js";
import type { CombatShopViewModel } from "../view-models/combat-shop.view-model.js";

export class CombatShopPresenter {
    constructor(
        private combatShopInventoryState: CombatShopInventoryState,
        private combatShopTabState: CombatShopTabState,
    ) { }

    public buildViewModel(): CombatShopViewModel {
        const activeTab = this.combatShopTabState.getActiveTabType();

        return {
            activeTab,
            moneyText: `$${this.formatMoney(this.combatShopInventoryState.getMoney())}`,
            tabs: COMBAT_SHOP_TABS_ORDER.map((tabType) => ({
                buttonState: tabType === activeTab
                    ? UIButtonState.SELECTED
                    : UIButtonState.NORMAL,
                tabType,
            })),
            upgradeItems: COMBAT_SHOP_UPGRADE_ITEMS_ORDER.map((upgradeType) => {
                const config = COMBAT_SHOP_UPGRADE_CONFIG[upgradeType];
                const level = this.combatShopInventoryState.getUpgradeItemLevel(upgradeType);
                const canPurchase = this.combatShopInventoryState.canPurchaseUpgradeItem(upgradeType);

                return {
                    buttonState: canPurchase
                        ? UIButtonState.NORMAL
                        : UIButtonState.DISABLED,
                    descriptionText: config.description,
                    levelText: `Lvl. ${level}`,
                    priceText: canPurchase
                        ? `$${this.formatMoney(this.combatShopInventoryState.getUpgradeItemPrice(upgradeType))}`
                        : "MAX",
                    titleText: config.name,
                    upgradeType,
                    visible: activeTab === CombatShopTabType.UPGRADES,
                };
            }),
            upgradeSectionVisible: activeTab === CombatShopTabType.UPGRADES,
        };
    }

    private formatMoney(value: number): string {
        return new Intl.NumberFormat("en-US").format(value);
    }
}

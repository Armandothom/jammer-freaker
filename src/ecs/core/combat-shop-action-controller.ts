import { COMBAT_SHOP_UI_ACTION } from "../../ui/input/combat-shop-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { CombatShopInventoryState } from "../components/states/combat-shop-inventory-state.js";
import { CombatShopTabState } from "../components/states/combat-shop-tab-state.js";
import { isCombatShopTabType } from "../components/types/combat-shop-tab-config.js";
import { isCombatShopUpgradeType } from "../components/types/combat-shop-upgrade-config.js";

export class CombatShopActionController implements UIActionHandler {
    constructor(
        private combatShopInventoryState: CombatShopInventoryState,
        private combatShopTabState: CombatShopTabState,
        private requestShopHubState: () => void,
    ) { }

    public handle(action: UIAction): boolean {
        switch (action.type) {
            case COMBAT_SHOP_UI_ACTION.BUY_UPGRADE:
                return this.handleBuyUpgrade(action);

            case COMBAT_SHOP_UI_ACTION.RETURN_TO_HUB:
                this.requestShopHubState();
                return true;

            case COMBAT_SHOP_UI_ACTION.SELECT_TAB:
                return this.handleSelectTab(action);

            default:
                return false;
        }
    }

    private handleBuyUpgrade(action: UIAction): boolean {
        const upgradeType = action.payload?.upgradeType;
        if (!upgradeType || !isCombatShopUpgradeType(upgradeType)) {
            return false;
        }

        this.combatShopInventoryState.tryPurchaseUpgradeItem(upgradeType);
        return true;
    }

    private handleSelectTab(action: UIAction): boolean {
        const tabType = action.payload?.tabType;
        if (!tabType || !isCombatShopTabType(tabType)) {
            return false;
        }

        this.combatShopTabState.setActiveTabType(tabType);
        return true;
    }
}

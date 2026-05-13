import { MEDICAL_SHOP_UI_ACTION } from "../../ui/input/medical-shop-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { MedicalShopInventoryState } from "../components/states/medical-shop-inventory-state.js";
import { MedicalShopTabState } from "../components/states/medical-shop-tab-state.js";
import { isMedicalShopResourceItemType } from "../components/types/medical-shop-resource-item-config.js";
import { isMedicalShopTabType } from "../components/types/medical-shop-tab-config.js";
import { isMedicalShopUpgradeItemType } from "../components/types/medical-shop-upgrade-item-config.js";

export class MedicalShopActionController implements UIActionHandler {
    constructor(
        private medicalShopInventoryState: MedicalShopInventoryState,
        private medicalShopTabState: MedicalShopTabState,
        private requestShopHubState: () => void,
    ) { }

    public handle(action: UIAction): boolean {
        switch (action.type) {
            case MEDICAL_SHOP_UI_ACTION.BUY_RESOURCE:
                return this.handleBuyResource(action);

            case MEDICAL_SHOP_UI_ACTION.BUY_UPGRADE:
                return this.handleBuyUpgrade(action);

            case MEDICAL_SHOP_UI_ACTION.RETURN_TO_HUB:
                this.requestShopHubState();
                return true;

            case MEDICAL_SHOP_UI_ACTION.SELECT_TAB:
                return this.handleSelectTab(action);

            default:
                return false;
        }
    }

    private handleBuyResource(action: UIAction): boolean {
        const itemType = action.payload?.itemType;
        if (!itemType || !isMedicalShopResourceItemType(itemType)) {
            return false;
        }

        this.medicalShopInventoryState.tryPurchaseResourceItem(itemType);
        return true;
    }

    private handleBuyUpgrade(action: UIAction): boolean {
        const upgradeType = action.payload?.upgradeType;
        if (!upgradeType || !isMedicalShopUpgradeItemType(upgradeType)) {
            return false;
        }

        this.medicalShopInventoryState.tryPurchaseUpgradeItem(upgradeType);
        return true;
    }

    private handleSelectTab(action: UIAction): boolean {
        const tabType = action.payload?.tabType;
        if (!tabType || !isMedicalShopTabType(tabType)) {
            return false;
        }

        this.medicalShopTabState.setActiveTabType(tabType);
        return true;
    }
}

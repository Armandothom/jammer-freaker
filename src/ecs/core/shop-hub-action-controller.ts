import { SHOP_HUB_UI_ACTION } from "../../ui/input/shop-hub-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";

export class ShopHubActionController implements UIActionHandler {
    constructor(
        private requestGameplayState: () => void,
        private requestGunsShopState: () => void,
        private requestMedicalShopState: () => void,
        private requestCombatShopState: () => void,
    ) { }

    public handle(action: UIAction): boolean {
        switch (action.type) {
            case SHOP_HUB_UI_ACTION.GO_TO_GAMEPLAY:
                this.requestGameplayState();
                return true;

            case SHOP_HUB_UI_ACTION.GO_TO_GUNS_SHOP:
                this.requestGunsShopState();
                return true;

            case SHOP_HUB_UI_ACTION.GO_TO_MEDICAL_SHOP:
                this.requestMedicalShopState();
                return true;

            case SHOP_HUB_UI_ACTION.GO_TO_COMBAT_SHOP:
                this.requestCombatShopState();
                return true;

            default:
                return false;
        }
    }
}

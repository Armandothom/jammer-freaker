import type { MedicalShopResourceItemType } from "../../ecs/components/types/medical-shop-resource-item-config.js";
import type { MedicalShopTabType } from "../../ecs/components/types/medical-shop-tab-config.js";
import type { MedicalShopUpgradeItemType } from "../../ecs/components/types/medical-shop-upgrade-item-config.js";
import type { UIAction } from "./ui-action.js";

export const MEDICAL_SHOP_UI_ACTION = {
    BUY_RESOURCE: "medical-shop.buy-resource",
    BUY_UPGRADE: "medical-shop.buy-upgrade",
    RETURN_TO_HUB: "medical-shop.return-to-hub",
    SELECT_TAB: "medical-shop.select-tab",
} as const;

export function createBuyMedicalShopResourceAction(itemType: MedicalShopResourceItemType): UIAction {
    return {
        payload: { itemType },
        type: MEDICAL_SHOP_UI_ACTION.BUY_RESOURCE,
    };
}

export function createBuyMedicalShopUpgradeAction(upgradeType: MedicalShopUpgradeItemType): UIAction {
    return {
        payload: { upgradeType },
        type: MEDICAL_SHOP_UI_ACTION.BUY_UPGRADE,
    };
}

export function createReturnFromMedicalShopToHubAction(): UIAction {
    return {
        type: MEDICAL_SHOP_UI_ACTION.RETURN_TO_HUB,
    };
}

export function createSelectMedicalShopTabAction(tabType: MedicalShopTabType): UIAction {
    return {
        payload: { tabType },
        type: MEDICAL_SHOP_UI_ACTION.SELECT_TAB,
    };
}

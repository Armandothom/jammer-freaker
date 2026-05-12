import type { UIAction } from "./ui-action.js";

export const SHOP_HUB_UI_ACTION = {
    GO_TO_GAMEPLAY: "shop-hub.go-to-gameplay",
    GO_TO_GUNS_SHOP: "shop-hub.go-to-guns-shop",
    GO_TO_MEDICAL_SHOP: "shop-hub.go-to-medical-shop",
} as const;

export function createGoToGameplayFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_GAMEPLAY,
    };
}

export function createGoToGunsShopFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_GUNS_SHOP,
    };
}

export function createGoToMedicalShopFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_MEDICAL_SHOP,
    };
}

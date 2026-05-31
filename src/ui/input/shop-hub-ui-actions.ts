import type { UIAction } from "./ui-action.js";

export const SHOP_HUB_UI_ACTION = {
    GO_TO_MISSION_SELECT: "shop-hub.go-to-mission-select",
    GO_TO_COMBAT_SHOP: "shop-hub.go-to-combat-shop",
    GO_TO_GUNS_SHOP: "shop-hub.go-to-guns-shop",
    GO_TO_MEDICAL_SHOP: "shop-hub.go-to-medical-shop",
} as const;

export function createGoToMissionSelectFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_MISSION_SELECT,
    };
}

export function createGoToGunsShopFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_GUNS_SHOP,
    };
}

export function createGoToCombatShopFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_COMBAT_SHOP,
    };
}

export function createGoToMedicalShopFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_MEDICAL_SHOP,
    };
}

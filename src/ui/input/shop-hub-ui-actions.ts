import type { UIAction } from "./ui-action.js";

export const SHOP_HUB_UI_ACTION = {
    GO_TO_CAMP_STORAGE: "shop-hub.go-to-camp-storage",
    GO_TO_WARE_BUYER: "shop-hub.go-to-ware-buyer",
    GO_TO_MISSION_SELECT: "shop-hub.go-to-mission-select",
    GO_TO_COMBAT_SHOP: "shop-hub.go-to-combat-shop",
    GO_TO_GUNS_SHOP: "shop-hub.go-to-guns-shop",
    GO_TO_MEDICAL_SHOP: "shop-hub.go-to-medical-shop",
} as const;

export function createGoToCampStorageFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_CAMP_STORAGE,
    };
}

export function createGoToWareBuyerFromShopHubAction(): UIAction {
    return {
        type: SHOP_HUB_UI_ACTION.GO_TO_WARE_BUYER,
    };
}

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

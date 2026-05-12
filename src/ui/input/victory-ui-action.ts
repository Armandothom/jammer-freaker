import { UIAction } from "./ui-action.js";

export const VICTORY_UI_ACTION = {
    NEXT_MISSION: "victory.next.mission",
    GOTO_SHOP_HUB: "victory.goto.shop-hub",
}

export function createNextMissionAction(): UIAction {
    return {
        type: VICTORY_UI_ACTION.NEXT_MISSION,
    };
}

export function createGoToShopHubAction(): UIAction {
    return {
        type: VICTORY_UI_ACTION.GOTO_SHOP_HUB,
    };
}


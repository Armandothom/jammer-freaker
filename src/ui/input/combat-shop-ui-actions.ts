import type { CombatShopTabType } from "../../ecs/components/types/combat-shop-tab-config.js";
import type { CombatShopUpgradeType } from "../../ecs/components/types/combat-shop-upgrade-config.js";
import type { UIAction } from "./ui-action.js";

export const COMBAT_SHOP_UI_ACTION = {
    BUY_UPGRADE: "combat-shop.buy-upgrade",
    RETURN_TO_HUB: "combat-shop.return-to-hub",
    SELECT_TAB: "combat-shop.select-tab",
} as const;

export function createBuyCombatShopUpgradeAction(upgradeType: CombatShopUpgradeType): UIAction {
    return {
        payload: { upgradeType },
        type: COMBAT_SHOP_UI_ACTION.BUY_UPGRADE,
    };
}

export function createReturnFromCombatShopToHubAction(): UIAction {
    return {
        type: COMBAT_SHOP_UI_ACTION.RETURN_TO_HUB,
    };
}

export function createSelectCombatShopTabAction(tabType: CombatShopTabType): UIAction {
    return {
        payload: { tabType },
        type: COMBAT_SHOP_UI_ACTION.SELECT_TAB,
    };
}

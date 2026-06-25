import type { CombatShopTabType } from "../../../ecs/components/types/combat-shop-tab-config.js";
import type { CombatShopUpgradeType } from "../../../ecs/components/types/combat-shop-upgrade-config.js";

function createUpgradeItemNodeIds(prefix: string) {
    return {
        button: `${prefix}.button`,
        description: `${prefix}.description`,
        level: `${prefix}.level`,
        root: prefix,
        title: `${prefix}.title`,
    };
}

export const COMBAT_SHOP_NODE_IDS = {
    background: "combat-shop.background",
    money: "combat-shop.money",
    questButton: "combat-shop.quest-button",
    returnButton: "combat-shop.return-button",
    root: "combat-shop.root",
    sections: {
        upgrades: "combat-shop.section.upgrades",
    },
    tab(tabType: CombatShopTabType) {
        return `combat-shop.tab.${tabType}`;
    },
    upgradeItem(upgradeType: CombatShopUpgradeType) {
        return createUpgradeItemNodeIds(`combat-shop.upgrade.${upgradeType}`);
    },
} as const;

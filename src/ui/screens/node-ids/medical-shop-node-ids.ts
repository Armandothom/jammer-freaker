import type { MedicalShopResourceItemType } from "../../../ecs/components/types/medical-shop-resource-item-config.js";
import type { MedicalShopTabType } from "../../../ecs/components/types/medical-shop-tab-config.js";
import type { MedicalShopUpgradeItemType } from "../../../ecs/components/types/medical-shop-upgrade-item-config.js";

function createItemNodeIds(prefix: string) {
    return {
        button: `${prefix}.button`,
        description: `${prefix}.description`,
        icon: `${prefix}.icon`,
        name: `${prefix}.name`,
        quantity: `${prefix}.quantity`,
        root: prefix,
    };
}

function createUpgradeItemNodeIds(prefix: string) {
    return {
        button: `${prefix}.button`,
        description: `${prefix}.description`,
        level: `${prefix}.level`,
        root: prefix,
        title: `${prefix}.title`,
    };
}

export const MEDICAL_SHOP_NODE_IDS = {
    background: "medical-shop.background",
    money: "medical-shop.money",
    questButton: "medical-shop.quest-button",
    resourceItem(itemType: MedicalShopResourceItemType) {
        return createItemNodeIds(`medical-shop.resource.${itemType}`);
    },
    returnButton: "medical-shop.return-button",
    root: "medical-shop.root",
    sections: {
        resources: "medical-shop.section.resources",
        upgrades: "medical-shop.section.upgrades",
    },
    tab(tabType: MedicalShopTabType) {
        return `medical-shop.tab.${tabType}`;
    },
    upgradeItem(upgradeType: MedicalShopUpgradeItemType) {
        return createUpgradeItemNodeIds(`medical-shop.upgrade.${upgradeType}`);
    },
} as const;

export const CombatShopUpgradeType = {
    FASTER_RELOAD: "faster_reload",
    FAST_TRIGGER: "fast_trigger",
    ACCURACY_INCREASE: "accuracy_increase",
    FOCUS_UPGRADE: "focus_upgrade",
} as const;

export type CombatShopUpgradeType =
    typeof CombatShopUpgradeType[keyof typeof CombatShopUpgradeType];

export type CombatShopUpgradeLevel = 1 | 2 | 3;
export type StoredCombatShopUpgradeLevel = 0 | 1 | 2 | 3;
export type CombatShopUpgradeDisplayValue = number;

export const MIN_COMBAT_SHOP_UPGRADE_LEVEL: CombatShopUpgradeLevel = 1;
export const MAX_COMBAT_SHOP_UPGRADE_LEVEL: CombatShopUpgradeLevel = 3;
export const MAX_STORED_COMBAT_SHOP_UPGRADE_LEVEL: StoredCombatShopUpgradeLevel = 3;

export type CombatShopUpgradeLevelConfig = {
    price: number;
    value: CombatShopUpgradeDisplayValue;
};

export type CombatShopUpgradeConfig = {
    name: string;
    description: string;
    levels: Record<CombatShopUpgradeLevel, CombatShopUpgradeLevelConfig>;
    maxLevel: CombatShopUpgradeLevel;
    order: number;
};

export const COMBAT_SHOP_UPGRADE_CONFIG: Record<
    CombatShopUpgradeType,
    CombatShopUpgradeConfig
> = {
    [CombatShopUpgradeType.FASTER_RELOAD]: {
        name: "Quick Hands",
        description: "Reduces reload time.",
        levels: {
            1: { price: 700, value: 0.8 },
            2: { price: 1400, value: 0.66 },
            3: { price: 2100, value: 0.5 },
        },
        maxLevel: 3,
        order: 0,
    },
    [CombatShopUpgradeType.FAST_TRIGGER]: {
        name: "Happy Trigger",
        description: "Increases weapon fire rate.",
        levels: {
            1: { price: 700, value: 1.1 },
            2: { price: 1400, value: 1.2 },
            3: { price: 2100, value: 1.33 },
        },
        maxLevel: 3,
        order: 1,
    },
    [CombatShopUpgradeType.ACCURACY_INCREASE]: {
        name: "Deadeye",
        description: "Reduces weapon spread.",
        levels: {
            1: { price: 700, value: 0.8 },
            2: { price: 1400, value: 0.66 },
            3: { price: 2100, value: 0.5 },
        },
        maxLevel: 3,
        order: 2,
    },
    [CombatShopUpgradeType.FOCUS_UPGRADE]: {
        name: "Lock In",
        description: "Reduces time focus fire.",
        levels: {
            1: { price: 900, value: 0.75 },
            2: { price: 1800, value: 0.6 },
            3: { price: 2700, value: 0.45 },
        },
        maxLevel: 3,
        order: 3,
    },
};

export const COMBAT_SHOP_UPGRADE_ITEMS_ORDER: CombatShopUpgradeType[] = (
    Object.keys(COMBAT_SHOP_UPGRADE_CONFIG) as CombatShopUpgradeType[]
).sort((a, b) => {
    return COMBAT_SHOP_UPGRADE_CONFIG[a].order - COMBAT_SHOP_UPGRADE_CONFIG[b].order;
});

export function isCombatShopUpgradeType(value: string): value is CombatShopUpgradeType {
    return Object.prototype.hasOwnProperty.call(COMBAT_SHOP_UPGRADE_CONFIG, value);
}

export function normalizeStoredCombatShopUpgradeLevel(level: number): StoredCombatShopUpgradeLevel {
    if (level <= 0) {
        return 0;
    }

    if (level === 1) {
        return 1;
    }

    if (level === 2) {
        return 2;
    }

    return MAX_STORED_COMBAT_SHOP_UPGRADE_LEVEL;
}

export function getCombatShopUpgradeLevelFromProgress(level: number): CombatShopUpgradeLevel {
    const normalizedLevel = normalizeStoredCombatShopUpgradeLevel(level);

    if (normalizedLevel <= 0) {
        return MIN_COMBAT_SHOP_UPGRADE_LEVEL;
    }

    if (normalizedLevel === 1) {
        return 2;
    }

    return MAX_COMBAT_SHOP_UPGRADE_LEVEL;
}

export function getNextCombatShopUpgradeProgressLevel(level: number): StoredCombatShopUpgradeLevel {
    const normalizedLevel = normalizeStoredCombatShopUpgradeLevel(level);

    if (normalizedLevel >= MAX_STORED_COMBAT_SHOP_UPGRADE_LEVEL) {
        return MAX_STORED_COMBAT_SHOP_UPGRADE_LEVEL;
    }

    return (normalizedLevel + 1) as StoredCombatShopUpgradeLevel;
}

export function isCombatShopUpgradeProgressMaxed(level: number): boolean {
    return normalizeStoredCombatShopUpgradeLevel(level) >= MAX_STORED_COMBAT_SHOP_UPGRADE_LEVEL;
}

export function getCombatShopUpgradeLevelConfig(
    upgradeType: CombatShopUpgradeType,
    level: CombatShopUpgradeLevel,
): CombatShopUpgradeLevelConfig {
    return COMBAT_SHOP_UPGRADE_CONFIG[upgradeType].levels[level];
}

export function getCombatShopUpgradeItemPrice(
    upgradeType: CombatShopUpgradeType,
    level: CombatShopUpgradeLevel,
): number {
    return getCombatShopUpgradeLevelConfig(upgradeType, level).price;
}

export const combatShopUpgradeTable = COMBAT_SHOP_UPGRADE_CONFIG;

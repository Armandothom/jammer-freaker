export const MedicalShopUpgradeItemType = {
    MAX_HEALTH: "max_health",
    USE_EFFICIENCY: "use_efficiency",
    STIM_DURATION: "stim_duration",
    MEDICAL_EFFECTIVENESS: "medical_effectiveness",
} as const;

export type MedicalShopUpgradeItemType =
    typeof MedicalShopUpgradeItemType[keyof typeof MedicalShopUpgradeItemType];

export type MedicalShopUpgradeLevel = 1 | 2 | 3;
export type StoredMedicalShopUpgradeLevel = 0 | 1 | 2 | 3;
export type MedicalShopUpgradeDisplayValue = number;

export const MIN_MEDICAL_SHOP_UPGRADE_LEVEL: MedicalShopUpgradeLevel = 1;
export const MAX_MEDICAL_SHOP_UPGRADE_LEVEL: MedicalShopUpgradeLevel = 3;
export const MAX_STORED_MEDICAL_SHOP_UPGRADE_LEVEL: StoredMedicalShopUpgradeLevel = 3;

export type MedicalShopUpgradeLevelConfig = {
    price: number;
    value: MedicalShopUpgradeDisplayValue;
};

export type MedicalShopUpgradeItemConfig = {
    name: string;
    description: string;
    levels: Record<MedicalShopUpgradeLevel, MedicalShopUpgradeLevelConfig>;
    maxLevel: MedicalShopUpgradeLevel;
    order: number;
};

export const MEDICAL_SHOP_UPGRADE_ITEM_CONFIG: Record<
    MedicalShopUpgradeItemType,
    MedicalShopUpgradeItemConfig
> = {
    [MedicalShopUpgradeItemType.MAX_HEALTH]: {
        name: "Fortitude",
        description: "Increases your Max Health.",
        levels: {
            1: { price: 700, value: 1.25 },
            2: { price: 1400, value: 1.5 },
            3: { price: 2100, value: 2 },
        },
        maxLevel: 3,
        order: 0,
    },
    [MedicalShopUpgradeItemType.USE_EFFICIENCY]: {
        name: "Usage Efficiency",
        description: "Reduces medical item use time.",
        levels: {
            1: { price: 700, value: 0.9 },
            2: { price: 1400, value: 0.8 },
            3: { price: 2100, value: 0.7 },
        },
        maxLevel: 3,
        order: 1,
    },
    [MedicalShopUpgradeItemType.STIM_DURATION]: {
        name: "Stim duration",
        description: "Increases duration of stimulants.",
        levels: {
            1: { price: 700, value: 1.25 },
            2: { price: 1400, value: 1.5 },
            3: { price: 2100, value: 1.75 },
        },
        maxLevel: 3,
        order: 2,
    },
    [MedicalShopUpgradeItemType.MEDICAL_EFFECTIVENESS]: {
        name: "Medical Effectiveness",
        description: "Improved healing and buffs from stimulants.",
        levels: {
            1: { price: 900, value: 1.15 },
            2: { price: 1800, value: 1.3 },
            3: { price: 2700, value: 1.5 },
        },
        maxLevel: 3,
        order: 3,
    },
};

export const MEDICAL_SHOP_UPGRADE_ITEMS_ORDER: MedicalShopUpgradeItemType[] = (
    Object.keys(MEDICAL_SHOP_UPGRADE_ITEM_CONFIG) as MedicalShopUpgradeItemType[]
).sort((a, b) => {
    return MEDICAL_SHOP_UPGRADE_ITEM_CONFIG[a].order - MEDICAL_SHOP_UPGRADE_ITEM_CONFIG[b].order;
});

export function isMedicalShopUpgradeItemType(value: string): value is MedicalShopUpgradeItemType {
    return Object.prototype.hasOwnProperty.call(MEDICAL_SHOP_UPGRADE_ITEM_CONFIG, value);
}

export function normalizeStoredMedicalShopUpgradeLevel(level: number): StoredMedicalShopUpgradeLevel {
    if (level <= 0) {
        return 0;
    }

    if (level === 1) {
        return 1;
    }

    if (level === 2) {
        return 2;
    }

    return MAX_STORED_MEDICAL_SHOP_UPGRADE_LEVEL;
}

export function getMedicalShopUpgradeLevelFromProgress(level: number): MedicalShopUpgradeLevel {
    const normalizedLevel = normalizeStoredMedicalShopUpgradeLevel(level);

    if (normalizedLevel <= 0) {
        return MIN_MEDICAL_SHOP_UPGRADE_LEVEL;
    }

    if (normalizedLevel === 1) {
        return 2;
    }

    return MAX_MEDICAL_SHOP_UPGRADE_LEVEL;
}

export function getNextMedicalShopUpgradeProgressLevel(level: number): StoredMedicalShopUpgradeLevel {
    const normalizedLevel = normalizeStoredMedicalShopUpgradeLevel(level);

    if (normalizedLevel >= MAX_STORED_MEDICAL_SHOP_UPGRADE_LEVEL) {
        return MAX_STORED_MEDICAL_SHOP_UPGRADE_LEVEL;
    }

    return (normalizedLevel + 1) as StoredMedicalShopUpgradeLevel;
}

export function isMedicalShopUpgradeProgressMaxed(level: number): boolean {
    return normalizeStoredMedicalShopUpgradeLevel(level) >= MAX_STORED_MEDICAL_SHOP_UPGRADE_LEVEL;
}

export function getMedicalShopUpgradeLevelConfig(
    upgradeType: MedicalShopUpgradeItemType,
    level: MedicalShopUpgradeLevel,
): MedicalShopUpgradeLevelConfig {
    return MEDICAL_SHOP_UPGRADE_ITEM_CONFIG[upgradeType].levels[level];
}

export function getMedicalShopUpgradeItemPrice(
    upgradeType: MedicalShopUpgradeItemType,
    level: MedicalShopUpgradeLevel,
): number {
    return getMedicalShopUpgradeLevelConfig(upgradeType, level).price;
}

export const medicalShopUpgradeTable = MEDICAL_SHOP_UPGRADE_ITEM_CONFIG;
export const MEDICAL_SHOP_UPGRADE_TABLE = MEDICAL_SHOP_UPGRADE_ITEM_CONFIG;

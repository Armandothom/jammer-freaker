import { WeaponConfig, WeaponType } from "./weapon-type.js";

export type UpgradeLevel = 1 | 2 | 3;
export type StoredWeaponUpgradeLevel = 0 | 1 | 2 | 3;
export type WeaponUpgradeDisplayValue = number | boolean;

export const MIN_WEAPON_UPGRADE_LEVEL: UpgradeLevel = 1;
export const MAX_WEAPON_UPGRADE_LEVEL: UpgradeLevel = 3;
export const MAX_STORED_WEAPON_UPGRADE_LEVEL: StoredWeaponUpgradeLevel = 3;

export type UpgradableWeaponType =
    | WeaponType.PISTOL
    | WeaponType.SMG
    | WeaponType.RIFLE
    | WeaponType.SNIPER;

export const WeaponUpgradeType = {
    DAMAGE: "damage",
    FIRE_RATE: "fire_rate",
    MAG_SIZE: "mag_size",
    MAXED_OUT: "maxed_out",
} as const;

export type WeaponUpgradeType =
    typeof WeaponUpgradeType[keyof typeof WeaponUpgradeType];

export type WeaponUpgradeLevelConfig = {
    price: number;
    value: WeaponUpgradeDisplayValue;
};

export const WeaponUpgradeTypeLabel: Record<WeaponUpgradeType, string> = {
    [WeaponUpgradeType.DAMAGE]: "Damage",
    [WeaponUpgradeType.FIRE_RATE]: "Fire Rate",
    [WeaponUpgradeType.MAG_SIZE]: "Mag Size",
    [WeaponUpgradeType.MAXED_OUT]: "Maxed Out",
};

export type WeaponUpgradeConfig = {
    [key in WeaponUpgradeType]: Record<UpgradeLevel, WeaponUpgradeLevelConfig>;
};

type WeaponUpgradePriceConfig = Record<WeaponUpgradeType, Record<UpgradeLevel, number>>;

const DAMAGE_VALUE_MULTIPLIERS: Record<UpgradeLevel, number> = {
    1: 1.2,
    2: 1.4,
    3: 1.6,
};

const FIRE_RATE_VALUE_MULTIPLIERS: Record<UpgradeLevel, number> = {
    1: 1.1,
    2: 1.25,
    3: 1.4,
};

const MAG_SIZE_VALUE_MULTIPLIERS: Record<UpgradeLevel, number> = {
    1: 1.2,
    2: 1.4,
    3: 1.6,
};

const WEAPON_UPGRADE_PRICE_CONFIG: Record<UpgradableWeaponType, WeaponUpgradePriceConfig> = {
    [WeaponType.PISTOL]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: 400,
            2: 700,
            3: 1000,
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: 300,
            2: 550,
            3: 800,
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: 250,
            2: 500,
            3: 750,
        },
        [WeaponUpgradeType.MAXED_OUT]: {
            1: 2000,
            2: 2000,
            3: 2000,
        },
    },

    [WeaponType.SMG]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: 500,
            2: 900,
            3: 1300,
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: 450,
            2: 800,
            3: 1200,
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: 300,
            2: 600,
            3: 900,
        },
        [WeaponUpgradeType.MAXED_OUT]: {
            1: 2600,
            2: 2600,
            3: 2600,
        },
    },

    [WeaponType.RIFLE]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: 700,
            2: 1200,
            3: 1800,
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: 500,
            2: 900,
            3: 1400,
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: 350,
            2: 700,
            3: 1100,
        },
        [WeaponUpgradeType.MAXED_OUT]: {
            1: 3000,
            2: 3000,
            3: 3000,
        },
    },

    [WeaponType.SNIPER]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: 1000,
            2: 1800,
            3: 2600,
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: 600,
            2: 1100,
            3: 1600,
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: 400,
            2: 800,
            3: 1400,
        },
        [WeaponUpgradeType.MAXED_OUT]: {
            1: 3900,
            2: 3900,
            3: 3900,
        },
    },
};

function roundUpgradeNumericValue(value: number): number {
    return Math.max(1, Math.round(value));
}

function buildNumericUpgradeLevels(
    baseValue: number,
    multipliers: Record<UpgradeLevel, number>,
): Record<UpgradeLevel, number> {
    return {
        1: roundUpgradeNumericValue(baseValue * multipliers[1]),
        2: roundUpgradeNumericValue(baseValue * multipliers[2]),
        3: roundUpgradeNumericValue(baseValue * multipliers[3]),
    };
}

function createWeaponUpgradeConfig(weaponType: UpgradableWeaponType): WeaponUpgradeConfig {
    const weaponBaseConfig = WeaponConfig[weaponType];
    const priceConfig = WEAPON_UPGRADE_PRICE_CONFIG[weaponType];
    const damageValues = buildNumericUpgradeLevels(
        weaponBaseConfig.damage,
        DAMAGE_VALUE_MULTIPLIERS,
    );
    const fireRateValues = buildNumericUpgradeLevels(
        weaponBaseConfig.fireRate,
        FIRE_RATE_VALUE_MULTIPLIERS,
    );
    const magSizeValues = buildNumericUpgradeLevels(
        weaponBaseConfig.maxBullets,
        MAG_SIZE_VALUE_MULTIPLIERS,
    );

    return {
        [WeaponUpgradeType.DAMAGE]: {
            1: { price: priceConfig[WeaponUpgradeType.DAMAGE][1], value: damageValues[1] },
            2: { price: priceConfig[WeaponUpgradeType.DAMAGE][2], value: damageValues[2] },
            3: { price: priceConfig[WeaponUpgradeType.DAMAGE][3], value: damageValues[3] },
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: { price: priceConfig[WeaponUpgradeType.FIRE_RATE][1], value: fireRateValues[1] },
            2: { price: priceConfig[WeaponUpgradeType.FIRE_RATE][2], value: fireRateValues[2] },
            3: { price: priceConfig[WeaponUpgradeType.FIRE_RATE][3], value: fireRateValues[3] },
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: { price: priceConfig[WeaponUpgradeType.MAG_SIZE][1], value: magSizeValues[1] },
            2: { price: priceConfig[WeaponUpgradeType.MAG_SIZE][2], value: magSizeValues[2] },
            3: { price: priceConfig[WeaponUpgradeType.MAG_SIZE][3], value: magSizeValues[3] },
        },
        [WeaponUpgradeType.MAXED_OUT]: {
            1: { price: priceConfig[WeaponUpgradeType.MAXED_OUT][1], value: true },
            2: { price: priceConfig[WeaponUpgradeType.MAXED_OUT][2], value: true },
            3: { price: priceConfig[WeaponUpgradeType.MAXED_OUT][3], value: true },
        },
    };
}

export const WEAPON_UPGRADE_CONFIG: Record<UpgradableWeaponType, WeaponUpgradeConfig> = {
    [WeaponType.PISTOL]: createWeaponUpgradeConfig(WeaponType.PISTOL),
    [WeaponType.SMG]: createWeaponUpgradeConfig(WeaponType.SMG),
    [WeaponType.RIFLE]: createWeaponUpgradeConfig(WeaponType.RIFLE),
    [WeaponType.SNIPER]: createWeaponUpgradeConfig(WeaponType.SNIPER),
};

export const WEAPON_UPGRADE_TYPES_ORDER: WeaponUpgradeType[] = [
    WeaponUpgradeType.DAMAGE,
    WeaponUpgradeType.FIRE_RATE,
    WeaponUpgradeType.MAG_SIZE,
    WeaponUpgradeType.MAXED_OUT,
];

export function isUpgradableWeaponType(value: string): value is UpgradableWeaponType {
    return value === WeaponType.PISTOL
        || value === WeaponType.SMG
        || value === WeaponType.RIFLE
        || value === WeaponType.SNIPER;
}

export function isWeaponUpgradeType(value: string): value is WeaponUpgradeType {
    return value === WeaponUpgradeType.DAMAGE
        || value === WeaponUpgradeType.FIRE_RATE
        || value === WeaponUpgradeType.MAG_SIZE
        || value === WeaponUpgradeType.MAXED_OUT;
}

export function normalizeStoredWeaponUpgradeLevel(level: number): StoredWeaponUpgradeLevel {
    if (level <= 0) {
        return 0;
    }

    if (level === 1) {
        return 1;
    }

    if (level === 2) {
        return 2;
    }

    return 3;
}

export function getWeaponUpgradeLevelFromProgress(level: number): UpgradeLevel {
    const normalizedLevel = normalizeStoredWeaponUpgradeLevel(level);

    if (normalizedLevel <= 0) {
        return MIN_WEAPON_UPGRADE_LEVEL;
    }

    if (normalizedLevel === 1) {
        return 2;
    }

    return MAX_WEAPON_UPGRADE_LEVEL;
}

export function getNextWeaponUpgradeProgressLevel(level: number): StoredWeaponUpgradeLevel {
    const normalizedLevel = normalizeStoredWeaponUpgradeLevel(level);

    if (normalizedLevel >= MAX_STORED_WEAPON_UPGRADE_LEVEL) {
        return MAX_STORED_WEAPON_UPGRADE_LEVEL;
    }

    return (normalizedLevel + 1) as StoredWeaponUpgradeLevel;
}

export function isWeaponUpgradeProgressMaxed(level: number): boolean {
    return normalizeStoredWeaponUpgradeLevel(level) >= MAX_STORED_WEAPON_UPGRADE_LEVEL;
}

export function getWeaponUpgradeLevelConfig(
    weaponType: UpgradableWeaponType,
    upgradeType: WeaponUpgradeType,
    level: UpgradeLevel,
): WeaponUpgradeLevelConfig {
    return WEAPON_UPGRADE_CONFIG[weaponType][upgradeType][level];
}

export function getWeaponUpgradePrice(
    weaponType: UpgradableWeaponType,
    upgradeType: WeaponUpgradeType,
    level: UpgradeLevel,
): number {
    return getWeaponUpgradeLevelConfig(weaponType, upgradeType, level).price;
}

export function getBaseWeaponUpgradeValue(
    weaponType: UpgradableWeaponType,
    upgradeType: WeaponUpgradeType,
): WeaponUpgradeDisplayValue {
    const weaponBaseConfig = WeaponConfig[weaponType];

    switch (upgradeType) {
        case WeaponUpgradeType.DAMAGE:
            return weaponBaseConfig.damage;

        case WeaponUpgradeType.FIRE_RATE:
            return weaponBaseConfig.fireRate;

        case WeaponUpgradeType.MAG_SIZE:
            return weaponBaseConfig.maxBullets;

        case WeaponUpgradeType.MAXED_OUT:
            return weaponBaseConfig.maxedOut;
    }
}

export function getCurrentWeaponUpgradeValue(
    weaponType: UpgradableWeaponType,
    upgradeType: WeaponUpgradeType,
    progressLevel: number,
) : WeaponUpgradeDisplayValue {
    const normalizedLevel = normalizeStoredWeaponUpgradeLevel(progressLevel);

    if (normalizedLevel === 0) {
        return getBaseWeaponUpgradeValue(weaponType, upgradeType);
    }

    if (upgradeType === WeaponUpgradeType.MAXED_OUT) {
        return true;
    }

    return getWeaponUpgradeLevelConfig(
        weaponType,
        upgradeType,
        normalizedLevel as UpgradeLevel,
    ).value;
}

export function getNextWeaponUpgradeValue(
    weaponType: UpgradableWeaponType,
    upgradeType: WeaponUpgradeType,
    progressLevel: number,
): WeaponUpgradeDisplayValue | null {
    const normalizedLevel = normalizeStoredWeaponUpgradeLevel(progressLevel);

    if (upgradeType === WeaponUpgradeType.MAXED_OUT) {
        return normalizedLevel >= 1
            ? null
            : true;
    }

    if (normalizedLevel >= MAX_STORED_WEAPON_UPGRADE_LEVEL) {
        return null;
    }

    return getWeaponUpgradeLevelConfig(
        weaponType,
        upgradeType,
        (normalizedLevel + 1) as UpgradeLevel,
    ).value;
}

export function formatWeaponUpgradeValue(value: WeaponUpgradeDisplayValue): string {
    if (typeof value === "boolean") {
        return value ? "ON" : "OFF";
    }

    if (Number.isInteger(value)) {
        return `${value}`;
    }

    return `${Math.round(value * 100) / 100}`;
}

export function getWeaponUpgradeName(
    upgradeType: WeaponUpgradeType,
): string {
    return `${WeaponUpgradeTypeLabel[upgradeType]}`;
}

export function getUpgradeValueIncrease(
    weaponType: UpgradableWeaponType,
    upgradeType: WeaponUpgradeType,
    progressLevel: number,
): string {
    const currentValue = getCurrentWeaponUpgradeValue(weaponType, upgradeType, progressLevel);
    const nextValue = getNextWeaponUpgradeValue(weaponType, upgradeType, progressLevel);

    if (nextValue == null) {
        return `MAX: ${formatWeaponUpgradeValue(currentValue)}`;
    }

    return `${formatWeaponUpgradeValue(currentValue)} >>> ${formatWeaponUpgradeValue(nextValue)}`;
}

export const SHOP_WEAPON_UPGRADE_CONFIG = WEAPON_UPGRADE_CONFIG;
export const SHOP_WEAPON_UPGRADE_TYPES_ORDER = WEAPON_UPGRADE_TYPES_ORDER;
export const weaponUpgradeTable = WEAPON_UPGRADE_CONFIG;

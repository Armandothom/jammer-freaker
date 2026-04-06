import { WeaponType } from "./weapon-type.js";

export type UpgradeLevel = 1 | 2 | 3;

export type UpgradableWeaponType =
    | WeaponType.PISTOL
    | WeaponType.SMG
    | WeaponType.RIFLE
    | WeaponType.SNIPER;

export const WeaponUpgradeType = {
    DAMAGE: "damage",
    FIRE_RATE: "fire_rate",
    MAG_SIZE: "mag_size",
} as const;

export type WeaponUpgradeType =
    typeof WeaponUpgradeType[keyof typeof WeaponUpgradeType];

type WeaponUpgradeLevelConfig = {
    price: number;
    value: number;
};


export type WeaponUpgradeConfig = {
    [key in WeaponUpgradeType]: Record<UpgradeLevel, WeaponUpgradeLevelConfig>;
};
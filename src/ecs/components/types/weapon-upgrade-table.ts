import { WeaponType } from "./weapon-type.js";
import { UpgradableWeaponType, WeaponUpgradeConfig, WeaponUpgradeType } from "./weapon-upgrade-config.js";


export const weaponUpgradeTable: Record<
    UpgradableWeaponType,
    WeaponUpgradeConfig
> = {
    [WeaponType.PISTOL]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: { price: 200, value: 5 },
            2: { price: 400, value: 10 },
            3: { price: 700, value: 15 },
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: { price: 150, value: 20 },
            2: { price: 300, value: 40 },
            3: { price: 500, value: 60 },
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: { price: 100, value: 2 },
            2: { price: 250, value: 4 },
            3: { price: 450, value: 6 },
        },
    },

    [WeaponType.SMG]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: { price: 300, value: 4 },
            2: { price: 600, value: 8 },
            3: { price: 900, value: 12 },
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: { price: 200, value: 30 },
            2: { price: 400, value: 60 },
            3: { price: 700, value: 90 },
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: { price: 150, value: 5 },
            2: { price: 350, value: 10 },
            3: { price: 600, value: 15 },
        },
    },

    [WeaponType.RIFLE]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: { price: 400, value: 6 },
            2: { price: 800, value: 12 },
            3: { price: 1200, value: 18 },
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: { price: 250, value: 15 },
            2: { price: 500, value: 30 },
            3: { price: 800, value: 45 },
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: { price: 200, value: 3 },
            2: { price: 400, value: 6 },
            3: { price: 700, value: 9 },
        },
    },

    [WeaponType.SNIPER]: {
        [WeaponUpgradeType.DAMAGE]: {
            1: { price: 800, value: 50 },
            2: { price: 1400, value: 100 },
            3: { price: 2000, value: 150 },
        },
        [WeaponUpgradeType.FIRE_RATE]: {
            1: { price: 300, value: 10 },
            2: { price: 600, value: 20 },
            3: { price: 1000, value: 30 },
        },
        [WeaponUpgradeType.MAG_SIZE]: {
            1: { price: 250, value: 1 },
            2: { price: 500, value: 2 },
            3: { price: 900, value: 3 },
        },
    },
};
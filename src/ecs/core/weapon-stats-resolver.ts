import type { InventoryComponent } from "../components/inventory-component.js";
import type { WeaponUpgradeState } from "../components/states/weapon-upgrade-state.js";
import {
    getCurrentWeaponUpgradeValue,
    isUpgradableWeaponType,
    WeaponUpgradeType,
} from "../components/types/weapon-upgrade-config.js";
import {
    WeaponConfig as BASE_WEAPON_CONFIG,
    type WeaponConfig as WeaponConfigData,
    WeaponType,
} from "../components/types/weapon-config.js";

export function resolveEffectiveWeaponConfig(
    weaponType: WeaponType,
    upgradeState?: WeaponUpgradeState | null,
): WeaponConfigData {
    const baseConfig = BASE_WEAPON_CONFIG[weaponType];

    if (!isUpgradableWeaponType(weaponType) || !upgradeState) {
        return { ...baseConfig };
    }

    return {
        ...baseConfig,
        damage: getCurrentWeaponUpgradeValue(
            weaponType,
            WeaponUpgradeType.DAMAGE,
            upgradeState.damageLevel,
        ) as number,
        fireRate: getCurrentWeaponUpgradeValue(
            weaponType,
            WeaponUpgradeType.FIRE_RATE,
            upgradeState.fireRateLevel,
        ) as number,
        maxBullets: getCurrentWeaponUpgradeValue(
            weaponType,
            WeaponUpgradeType.MAG_SIZE,
            upgradeState.magSizeLevel,
        ) as number,
        maxedOut: upgradeState.maxedOut,
    };
}

export function resolveEffectiveWeaponConfigFromInventory(
    inventory: InventoryComponent | null | undefined,
    weaponType: WeaponType,
): WeaponConfigData {
    const weaponState = inventory?.weapons.get(weaponType) ?? null;

    return resolveEffectiveWeaponConfig(weaponType, weaponState?.upgrades);
}

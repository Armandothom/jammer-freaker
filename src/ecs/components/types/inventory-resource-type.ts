export enum InventoryResourceType {
    PistolMag = "pistol_mag",
    SmgMag = "smg_mag",
    RifleMag = "rifle_mag",
    SniperMag = "sniper_mag",
    ShotgunShell = "ShotgunShell",
    ShotgunShellBox = "shotgun_shell_box",
    Grenade = "grenade",
    Epipen = "epipen",
    CombatStim = "combat_stim",
    Healpack = "healpack",
    Bandage = "bandage",
    Money = "money",
}

export const SHOTGUN_SHELLS_PER_BOX = 6;
export const MAX_STACKABLE_RESOURCE_AMOUNT = 99;

export function getInventoryResourceMaxAmount(resourceType: InventoryResourceType): number {
    switch (resourceType) {
        case InventoryResourceType.Money:
            return Number.POSITIVE_INFINITY;

        default:
            return MAX_STACKABLE_RESOURCE_AMOUNT;
    }
}

export function clampInventoryResourceAmount(
    resourceType: InventoryResourceType,
    amount: number,
): number {
    return Math.max(
        0,
        Math.min(amount, getInventoryResourceMaxAmount(resourceType)),
    );
}

import { MiscResourceType } from "./misc-resource-type.js";

export enum BackpackType {
    NO_BACKPACK = "no_backpack",
    SMALL_BACKPACK = "small_backpack",
    MEDIUM_BACKPACK = "medium_backpack",
    LARGE_BACKPACK = "large_backpack",
}

export type BackpackSizeConfig = {
    level: number,
    maxSlots: number,
}

export const BACKPACK_CONFIG: Record<BackpackType, BackpackSizeConfig> = {
    [BackpackType.NO_BACKPACK]: {
        level: 0,
        maxSlots: 4,
    },
    [BackpackType.SMALL_BACKPACK]: {
        level: 1,
        maxSlots: 8
    },
    [BackpackType.MEDIUM_BACKPACK]: {
        level: 2,
        maxSlots: 16
    },
    [BackpackType.LARGE_BACKPACK]: {
        level: 3,
        maxSlots: 24
    }
}

export const BACKPACK_TYPES_BY_LEVEL: readonly BackpackType[] = [
    BackpackType.NO_BACKPACK,
    BackpackType.SMALL_BACKPACK,
    BackpackType.MEDIUM_BACKPACK,
    BackpackType.LARGE_BACKPACK,
];

export function isBackpackType(value: unknown): value is BackpackType {
    return typeof value === "string"
        && BACKPACK_TYPES_BY_LEVEL.indexOf(value as BackpackType) !== -1;
}

export function normalizeBackpackType(value: unknown): BackpackType {
    return isBackpackType(value) ? value : BackpackType.NO_BACKPACK;
}

export function getBackpackLevel(backpackType: BackpackType): number {
    return BACKPACK_CONFIG[backpackType].level;
}

export function getBackpackMaxSlots(backpackType: BackpackType): number {
    return BACKPACK_CONFIG[backpackType].maxSlots;
}

export function getBackpackTypeByLevel(level: number): BackpackType {
    const normalizedLevel = Math.max(0, Math.floor(level));
    return BACKPACK_TYPES_BY_LEVEL[normalizedLevel] ?? BackpackType.LARGE_BACKPACK;
}

export const BACKPACK_MISC_RESOURCE_TYPES: readonly MiscResourceType[] = [
    MiscResourceType.SmallBackpack,
    MiscResourceType.MediumBackpack,
    MiscResourceType.LargeBackpack,
];

export function getBackpackTypeForMiscResource(
    miscResourceType: MiscResourceType,
): BackpackType | null {
    switch (miscResourceType) {
        case MiscResourceType.SmallBackpack:
            return BackpackType.SMALL_BACKPACK;

        case MiscResourceType.MediumBackpack:
            return BackpackType.MEDIUM_BACKPACK;

        case MiscResourceType.LargeBackpack:
            return BackpackType.LARGE_BACKPACK;

        default:
            return null;
    }
}

export function isBackpackMiscResourceType(
    miscResourceType: MiscResourceType,
): boolean {
    return getBackpackTypeForMiscResource(miscResourceType) !== null;
}

export type BuildingSize = {
    width: number;
    height: number;
};

export enum BuildingType {
    Massive = "massive",
    Large = "large",
    Medium = "medium",
    Small = "small",
}

export const BUILDING_SIZE_CONFIG: Record<BuildingType, BuildingSize> = {
    [BuildingType.Massive]: { width: 1024, height: 512 },
    [BuildingType.Large]: { width: 800, height: 512 },
    [BuildingType.Medium]: { width: 640, height: 512 },
    [BuildingType.Small]: { width: 320, height: 320 },
};

export const BUILDING_TYPE_PLACEMENT_ORDER: BuildingType[] = [
    BuildingType.Massive,
    BuildingType.Large,
    BuildingType.Medium,
    BuildingType.Small,
];

export const BUILDING_PLACEMENT_CONFIG = {
    sidewalkPadding: 32,
    buildingPadding: 32,
    placementGridSize: 32,
} as const;

export enum BuildingName {
    RESIDENCE = "residence",
    HARDWARE_STORE = "hardware_store",
    CONSTRUCTION_STORE = "construction_store",
    HOSPITAL = "hospital",
    BANK = "bank",
    KIOSK = "kiosk",
    POLICE_STATION = "police_station",
    POST_OFFICE = "post_office",
    SCHOOL_BUILDING = "school_building",
    MILITARY_CAMP = "military_camp",
    AUTO_REPAIR_SHOP = "auto_repair_shop",
}

export const BUILDING_NAMES: BuildingName[] = [
    BuildingName.RESIDENCE,
    BuildingName.HARDWARE_STORE,
    BuildingName.CONSTRUCTION_STORE,
    BuildingName.HOSPITAL,
    BuildingName.BANK,
    BuildingName.KIOSK,
    BuildingName.POLICE_STATION,
    BuildingName.POST_OFFICE,
    BuildingName.SCHOOL_BUILDING,
    BuildingName.MILITARY_CAMP,
    BuildingName.AUTO_REPAIR_SHOP,
];

export const BUILDING_TYPE_MAP: Record<BuildingName, BuildingType> = {
    [BuildingName.RESIDENCE]: BuildingType.Medium,
    [BuildingName.HARDWARE_STORE]: BuildingType.Medium,
    [BuildingName.CONSTRUCTION_STORE]: BuildingType.Large,
    [BuildingName.HOSPITAL]: BuildingType.Massive,
    [BuildingName.BANK]: BuildingType.Large,
    [BuildingName.KIOSK]: BuildingType.Small,
    [BuildingName.POLICE_STATION]: BuildingType.Large,
    [BuildingName.POST_OFFICE]: BuildingType.Medium,
    [BuildingName.SCHOOL_BUILDING]: BuildingType.Massive,
    [BuildingName.MILITARY_CAMP]: BuildingType.Large,
    [BuildingName.AUTO_REPAIR_SHOP]: BuildingType.Medium,
};

export function isBuildingName(value: unknown): value is BuildingName {
    return typeof value === "string"
        && BUILDING_NAMES.indexOf(value as BuildingName) !== -1;
}

import type { BuildingName } from "./buildings-config.js";

export type BuildingOrientation = "north" | "south" | "east" | "west";
export type BuildingAssetDirection = "N" | "S" | "E" | "W";
export type BuildingAssetTileType = `asset_${number}`;
export type BuildingDoorPanelSide = "left" | "right";
export type BuildingDoorTileType =
  | "door"
  | "door_left"
  | "door_right";

export type StandardBuildingTileType =
  | "out_of_bounds"
  | "window"
  | BuildingDoorTileType
  | "floor";

export type BuildingTileType =
  | StandardBuildingTileType
  | BuildingAssetTileType;

export interface BuildingTileDefinition {
  x: number;
  y: number;
  type: BuildingTileType;
  assetDirection?: BuildingAssetDirection;
}

export interface BuildingOrientationDefinition {
  orientation: BuildingOrientation;
  width: number;
  height: number;
  tiles: BuildingTileDefinition[];
}

export interface BuildingVariationDefinition {
  id: string;
  variation: number;
  orientations: Partial<Record<BuildingOrientation, BuildingOrientationDefinition>>;
}

export interface BuildingDefinition {
  id: BuildingName;
  name: string;
  tileSize: number;
  variations: BuildingVariationDefinition[];
}

export interface BuildingPlotDefinition {
  id: string;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  orientation: BuildingOrientation;
}

export interface BuildingPlacementRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlacedBuilding {
  buildingName: BuildingName;
  variationId: string;
  variationIndex: number;
  orientation: BuildingOrientation;
  plotId: string;
  tileSize: number;
  rect: BuildingPlacementRect;
  tiles: BuildingTileDefinition[];
}

export function isBuildingAssetTileType(tileType: BuildingTileType): tileType is BuildingAssetTileType {
  return /^asset_[1-9]\d*$/.test(tileType);
}

export function isBuildingDoorTileType(
  tileType: BuildingTileType | null | undefined,
): tileType is BuildingDoorTileType {
  return tileType === "door"
    || tileType === "door_left"
    || tileType === "door_right";
}

export function getBuildingDoorPanelSide(
  tileType: BuildingTileType | null | undefined,
): BuildingDoorPanelSide | null {
  switch (tileType) {
    case "door_left":
      return "left";

    case "door_right":
      return "right";

    default:
      return null;
  }
}

export function swapBuildingDoorPanelSide(
  tileType: BuildingTileType,
): BuildingTileType {
  switch (tileType) {
    case "door_left":
      return "door_right";

    case "door_right":
      return "door_left";

    default:
      return tileType;
  }
}

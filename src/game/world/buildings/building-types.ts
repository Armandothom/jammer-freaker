import type { BuildingName } from "./buildings-config.js";

export type BuildingOrientation = "north" | "south" | "east" | "west";
export type BuildingAssetDirection = "N" | "S" | "E" | "W";
export type BuildingAssetTileType = `asset_${number}`;

export type StandardBuildingTileType =
  | "out_of_bounds"
  | "window"
  | "door"
  | "door_1"
  | "door_2"
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

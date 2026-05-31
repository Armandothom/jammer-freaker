import { BuildingName, isBuildingName } from "./buildings-config.js";
import type {
  BuildingAssetDirection,
  BuildingAssetTileType,
  BuildingDefinition,
  BuildingOrientation,
  BuildingOrientationDefinition,
  BuildingTileDefinition,
  BuildingTileType,
  BuildingVariationDefinition,
  StandardBuildingTileType,
} from "./building-types.js";
import { isBuildingAssetTileType, swapBuildingDoorPanelSide } from "./building-types.js";

type RawBuildingTileRun = [unknown, unknown];

type RawBuildingOrientationDefinition = {
  orientation: unknown;
  width: unknown;
  height: unknown;
  encoding: unknown;
  tileTypes: unknown;
  tileRuns: unknown;
  assetDirections?: unknown;
};

type RawBuildingVariationDefinition = {
  id: unknown;
  variation: unknown;
  orientations: unknown;
};

type RawBuildingDefinition = {
  id: unknown;
  name: unknown;
  tileSize: unknown;
  variations: unknown;
};

type ImportedJsonModule = {
  default: unknown;
};

const RAW_BUILDING_MODULES = import.meta.glob<ImportedJsonModule>(
  "./*.json",
  { eager: true },
);

const COMPRESSED_BUILDING_ENCODING = "tile-rle-v1";
const BUILDING_ORIENTATIONS: BuildingOrientation[] = ["north", "south", "east", "west"];
const STANDARD_BUILDING_TILE_TYPES: StandardBuildingTileType[] = [
  "out_of_bounds",
  "window",
  "door",
  "door_left",
  "door_right",
  "floor",
];

export const BUILDING_REGISTRY: Partial<Record<BuildingName, BuildingDefinition>> =
  buildBuildingRegistry(RAW_BUILDING_MODULES);

export function getBuildingDefinition(
  buildingName: BuildingName,
): BuildingDefinition | null {
  return BUILDING_REGISTRY[buildingName] ?? null;
}

export function getBuildingOrientationDefinition(
  variation: BuildingVariationDefinition,
  orientation: BuildingOrientation,
): BuildingOrientationDefinition | null {
  const authoredOrientation = variation.orientations[orientation];
  const canonicalOrientation = variation.orientations.north ?? authoredOrientation;

  if (!canonicalOrientation) {
    return null;
  }

  if (
    orientation === canonicalOrientation.orientation ||
    (authoredOrientation && isAuthoredOrientationDifferent(canonicalOrientation, authoredOrientation))
  ) {
    return authoredOrientation ?? canonicalOrientation;
  }

  return rotateCanonicalOrientation(canonicalOrientation, orientation);
}

function buildBuildingRegistry(
  rawModules: Record<string, ImportedJsonModule>,
): Partial<Record<BuildingName, BuildingDefinition>> {
  const registry: Partial<Record<BuildingName, BuildingDefinition>> = {};

  for (const modulePath of Object.keys(rawModules)) {
    if (modulePath.endsWith("plots_area_summary.json")) {
      continue;
    }

    const rawModule = rawModules[modulePath];
    const definition = parseBuildingDefinition(rawModule.default, modulePath);

    if (registry[definition.id]) {
      throw new Error(`Duplicate building id "${definition.id}" found in "${modulePath}".`);
    }

    registry[definition.id] = definition;
  }

  return registry;
}

function parseBuildingDefinition(
  raw: unknown,
  sourcePath: string,
): BuildingDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Invalid building definition in "${sourcePath}".`);
  }

  const rawBuilding = raw as RawBuildingDefinition;
  const id = parseBuildingName(rawBuilding.id, `${sourcePath}.id`);
  const name = parseNonEmptyString(rawBuilding.name, `${sourcePath}.name`);
  const tileSize = parsePositiveInteger(rawBuilding.tileSize, `${sourcePath}.tileSize`);

  if (!Array.isArray(rawBuilding.variations) || rawBuilding.variations.length === 0) {
    throw new Error(`Building "${id}" must define at least one variation.`);
  }

  const variations = rawBuilding.variations.map((variation, index) => (
    parseBuildingVariation(id, variation, index)
  ));

  return {
    id,
    name,
    tileSize,
    variations,
  };
}

function parseBuildingVariation(
  buildingId: BuildingName,
  raw: unknown,
  index: number,
): BuildingVariationDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Variation "${index}" for "${buildingId}" is invalid.`);
  }

  const rawVariation = raw as RawBuildingVariationDefinition;
  const id = parseNonEmptyString(rawVariation.id, `${buildingId}.variations[${index}].id`);
  const variation = parseNonNegativeInteger(rawVariation.variation, `${buildingId}.variations[${index}].variation`);

  if (!isRecord(rawVariation.orientations)) {
    throw new Error(`Variation "${id}" must define orientations.`);
  }

  const orientations: Partial<Record<BuildingOrientation, BuildingOrientationDefinition>> = {};

  for (const orientation of BUILDING_ORIENTATIONS) {
    const rawOrientation = rawVariation.orientations[orientation];

    if (rawOrientation == null) {
      continue;
    }

    orientations[orientation] = parseBuildingOrientation(
      buildingId,
      id,
      orientation,
      rawOrientation,
    );
  }

  if (Object.keys(orientations).length === 0) {
    throw new Error(`Variation "${id}" must provide at least one orientation.`);
  }

  return {
    id,
    variation,
    orientations,
  };
}

function parseBuildingOrientation(
  buildingId: BuildingName,
  variationId: string,
  orientation: BuildingOrientation,
  raw: unknown,
): BuildingOrientationDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Orientation "${orientation}" for "${variationId}" is invalid.`);
  }

  const rawOrientation = raw as RawBuildingOrientationDefinition;
  const parsedOrientation = rawOrientation.orientation == null
    ? orientation
    : parseBuildingOrientationName(
      rawOrientation.orientation,
      `${buildingId}.${variationId}.${orientation}.orientation`,
    );
  const width = parsePositiveInteger(rawOrientation.width, `${buildingId}.${variationId}.${orientation}.width`);
  const height = parsePositiveInteger(rawOrientation.height, `${buildingId}.${variationId}.${orientation}.height`);

  if (parsedOrientation !== orientation) {
    throw new Error(
      `Orientation "${orientation}" for "${variationId}" declares "${parsedOrientation}".`,
    );
  }

  if (rawOrientation.encoding !== COMPRESSED_BUILDING_ENCODING) {
    throw new Error(
      `Building "${buildingId}" orientation "${orientation}" must use "${COMPRESSED_BUILDING_ENCODING}".`,
    );
  }

  const tiles = parseCompressedBuildingTiles(
    rawOrientation,
    buildingId,
    variationId,
    orientation,
    width,
    height,
  );

  return {
    orientation,
    width,
    height,
    tiles,
  };
}

function parseCompressedBuildingTiles(
  rawOrientation: RawBuildingOrientationDefinition,
  buildingId: BuildingName,
  variationId: string,
  orientation: BuildingOrientation,
  width: number,
  height: number,
): BuildingTileDefinition[] {
  if (!Array.isArray(rawOrientation.tileTypes) || rawOrientation.tileTypes.length === 0) {
    throw new Error(`Building "${buildingId}.${variationId}.${orientation}" must define tileTypes.`);
  }

  if (!Array.isArray(rawOrientation.tileRuns)) {
    throw new Error(`Building "${buildingId}.${variationId}.${orientation}" must define tileRuns.`);
  }

  const tileTypes = rawOrientation.tileTypes.map((rawType, index) => (
    parseBuildingTileType(rawType, `${buildingId}.${variationId}.${orientation}.tileTypes[${index}]`)
  ));
  const assetDirections = parseBuildingAssetDirections(
    rawOrientation.assetDirections,
    `${buildingId}.${variationId}.${orientation}.assetDirections`,
  );

  const expectedTileCount = width * height;
  const tiles: BuildingTileDefinition[] = [];
  let tileIndex = 0;

  for (let runIndex = 0; runIndex < rawOrientation.tileRuns.length; runIndex++) {
    const rawRun = rawOrientation.tileRuns[runIndex];

    if (!Array.isArray(rawRun) || rawRun.length !== 2) {
      throw new Error(`Invalid tile run "${runIndex}" for "${buildingId}.${variationId}.${orientation}".`);
    }

    const run = rawRun as RawBuildingTileRun;
    const tileTypeIndex = parseNonNegativeInteger(
      run[0],
      `${buildingId}.${variationId}.${orientation}.tileRuns[${runIndex}][0]`,
    );
    const runLength = parsePositiveInteger(
      run[1],
      `${buildingId}.${variationId}.${orientation}.tileRuns[${runIndex}][1]`,
    );
    const tileType = tileTypes[tileTypeIndex];

    if (tileType === undefined) {
      throw new Error(
        `Tile run "${runIndex}" for "${buildingId}.${variationId}.${orientation}" references an unknown tile type.`,
      );
    }

    for (let i = 0; i < runLength; i++) {
      if (tileIndex >= expectedTileCount) {
        throw new Error(
          `Building "${buildingId}.${variationId}.${orientation}" defines more than ${expectedTileCount} tiles.`,
        );
      }

      const tile: BuildingTileDefinition = {
        x: tileIndex % width,
        y: Math.floor(tileIndex / width),
        type: tileType,
      };

      if (isBuildingAssetTileType(tileType)) {
        tile.assetDirection = getRequiredBuildingAssetDirection(
          tileType,
          assetDirections,
          `${buildingId}.${variationId}.${orientation}`,
        );
      }

      tiles.push(tile);

      tileIndex += 1;
    }
  }

  if (tileIndex !== expectedTileCount) {
    throw new Error(
      `Building "${buildingId}.${variationId}.${orientation}" must define ${expectedTileCount} tiles, found ${tileIndex}.`,
    );
  }

  return tiles;
}

function rotateCanonicalOrientation(
  canonicalOrientation: BuildingOrientationDefinition,
  orientation: BuildingOrientation,
): BuildingOrientationDefinition {
  switch (orientation) {
    case "north":
      return canonicalOrientation;

    case "south":
      return {
        orientation,
        width: canonicalOrientation.width,
        height: canonicalOrientation.height,
        tiles: canonicalOrientation.tiles.map((tile) => ({
          x: canonicalOrientation.width - 1 - tile.x,
          y: canonicalOrientation.height - 1 - tile.y,
          type: rotateBuildingTileType(tile.type, "south"),
          assetDirection: rotateBuildingAssetDirection(tile.assetDirection, "south"),
        })),
      };

    case "east":
      return {
        orientation,
        width: canonicalOrientation.height,
        height: canonicalOrientation.width,
        tiles: canonicalOrientation.tiles.map((tile) => ({
          x: canonicalOrientation.height - 1 - tile.y,
          y: tile.x,
          type: rotateBuildingTileType(tile.type, "east"),
          assetDirection: rotateBuildingAssetDirection(tile.assetDirection, "east"),
        })),
      };

    case "west":
      return {
        orientation,
        width: canonicalOrientation.height,
        height: canonicalOrientation.width,
        tiles: canonicalOrientation.tiles.map((tile) => ({
          x: tile.y,
          y: canonicalOrientation.width - 1 - tile.x,
          type: rotateBuildingTileType(tile.type, "west"),
          assetDirection: rotateBuildingAssetDirection(tile.assetDirection, "west"),
        })),
      };

    default: {
      const exhaustiveCheck: never = orientation;
      return exhaustiveCheck;
    }
  }
}

function isAuthoredOrientationDifferent(
  canonicalOrientation: BuildingOrientationDefinition,
  authoredOrientation: BuildingOrientationDefinition,
): boolean {
  if (
    canonicalOrientation.width !== authoredOrientation.width ||
    canonicalOrientation.height !== authoredOrientation.height
  ) {
    return true;
  }

  if (canonicalOrientation.tiles.length !== authoredOrientation.tiles.length) {
    return true;
  }

  for (let index = 0; index < canonicalOrientation.tiles.length; index++) {
    const canonicalTile = canonicalOrientation.tiles[index];
    const authoredTile = authoredOrientation.tiles[index];

    if (
      canonicalTile.x !== authoredTile.x ||
      canonicalTile.y !== authoredTile.y ||
      canonicalTile.type !== authoredTile.type ||
      canonicalTile.assetDirection !== authoredTile.assetDirection
    ) {
      return true;
    }
  }

  return false;
}

function parseBuildingName(value: unknown, path: string): BuildingName {
  if (!isBuildingName(value)) {
    throw new Error(`"${path}" must be a valid BuildingName.`);
  }

  return value;
}

function parseBuildingOrientationName(value: unknown, path: string): BuildingOrientation {
  if (typeof value !== "string" || BUILDING_ORIENTATIONS.indexOf(value as BuildingOrientation) === -1) {
    throw new Error(`"${path}" must be a valid building orientation.`);
  }

  return value as BuildingOrientation;
}

function parseBuildingTileType(value: unknown, path: string): BuildingTileType {
  if (typeof value === "string" && isBuildingAssetTileType(value as BuildingTileType)) {
    return value as BuildingAssetTileType;
  }

  if (typeof value !== "string" || STANDARD_BUILDING_TILE_TYPES.indexOf(value as StandardBuildingTileType) === -1) {
    throw new Error(`"${path}" must be a valid building tile type.`);
  }

  return value as BuildingTileType;
}

function parseBuildingAssetDirections(
  value: unknown,
  path: string,
): Partial<Record<BuildingAssetTileType, BuildingAssetDirection>> {
  if (value == null) {
    return {};
  }

  if (!isRecord(value)) {
    throw new Error(`"${path}" must be an asset direction map.`);
  }

  const assetDirections: Partial<Record<BuildingAssetTileType, BuildingAssetDirection>> = {};

  for (const key of Object.keys(value)) {
    if (!isBuildingAssetTileType(key as BuildingTileType)) {
      throw new Error(`"${path}.${key}" must use an asset tile type key.`);
    }

    assetDirections[key as BuildingAssetTileType] = parseBuildingAssetDirection(
      value[key],
      `${path}.${key}`,
    );
  }

  return assetDirections;
}

function getRequiredBuildingAssetDirection(
  tileType: BuildingAssetTileType,
  assetDirections: Partial<Record<BuildingAssetTileType, BuildingAssetDirection>>,
  path: string,
): BuildingAssetDirection {
  const direction = assetDirections[tileType];

  if (!direction) {
    throw new Error(`"${path}.assetDirections.${tileType}" must be defined for asset tiles.`);
  }

  return direction;
}

function parseBuildingAssetDirection(value: unknown, path: string): BuildingAssetDirection {
  if (value !== "N" && value !== "S" && value !== "E" && value !== "W") {
    throw new Error(`"${path}" must be a valid asset direction.`);
  }

  return value;
}

function rotateBuildingAssetDirection(
  direction: BuildingAssetDirection | undefined,
  targetOrientation: BuildingOrientation,
): BuildingAssetDirection | undefined {
  if (!direction) {
    return undefined;
  }

  const clockwiseTurnsByOrientation: Record<BuildingOrientation, number> = {
    north: 0,
    east: 1,
    south: 2,
    west: 3,
  };
  const directions: BuildingAssetDirection[] = ["N", "E", "S", "W"];
  const directionIndex = directions.indexOf(direction);
  const rotatedIndex = (directionIndex + clockwiseTurnsByOrientation[targetOrientation]) % directions.length;

  return directions[rotatedIndex];
}

function rotateBuildingTileType(
  tileType: BuildingTileType,
  targetOrientation: BuildingOrientation,
): BuildingTileType {
  return targetOrientation === "south" || targetOrientation === "west"
    ? swapBuildingDoorPanelSide(tileType)
    : tileType;
}

function parsePositiveInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`"${path}" must be a positive integer.`);
  }

  return Number(value);
}

function parseNonNegativeInteger(value: unknown, path: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`"${path}" must be a non-negative integer.`);
  }

  return Number(value);
}

function parseNonEmptyString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`"${path}" must be a non-empty string.`);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

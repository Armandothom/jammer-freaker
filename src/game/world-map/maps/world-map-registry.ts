import {
  isWorldMapTerrainTileSolid,
  isWorldMapTerrainTileStreetSpawn,
  isWorldMapTerrainTileType,
} from "./world-map-terrain-config.js";
import type { WorldMapTerrainTileType } from "../types/tilemap-tile.js";

export type WorldMapId = string;

export interface WorldMapTileDefinition {
  x: number;
  y: number;
  type: WorldMapTerrainTileType;
}

export interface WorldMapTileCoordinates {
  tileX: number;
  tileY: number;
}

export interface WorldMapDefinition {
  id: WorldMapId;
  name: string;
  tileSize: number;
  width: number;
  height: number;
  tiles: WorldMapTileDefinition[];
  streetSpawnTiles: WorldMapTileCoordinates[];
  fallbackSpawnTiles: WorldMapTileCoordinates[];
}

export interface WorldMapSummary {
  id: WorldMapId;
  name: string;
  width: number;
  height: number;
}

type RawWorldMapTile = {
  x: unknown;
  y: unknown;
  type: unknown;
};

type RawWorldMapDefinition = {
  id: unknown;
  name: unknown;
  tileSize: unknown;
  width: unknown;
  height: unknown;
  encoding: unknown;
  tiles: unknown;
  tileTypes: unknown;
  tileRuns: unknown;
};

type ImportedJsonModule = {
  default: unknown;
};

const RAW_WORLD_MAP_MODULES = import.meta.glob<ImportedJsonModule>(
  "./map_*.json",
  { eager: true },
);

const COMPRESSED_WORLD_MAP_ENCODING = "tile-rle-v1";

export const WORLD_MAP_IDS: WorldMapId[] = [
  "map_0",
  "map_1",
  "map_2",
  "map_3",
  "map_4",
  "map_5",
  "map_6",
  "map_7",
];

export const WORLD_MAP_REGISTRY: Record<WorldMapId, WorldMapDefinition> =
  buildWorldMapRegistry(RAW_WORLD_MAP_MODULES);

export const WORLD_MAP_SUMMARIES: WorldMapSummary[] = WORLD_MAP_IDS.map((mapId) => {
  const map = WORLD_MAP_REGISTRY[mapId];

  return {
    id: map.id,
    name: map.name,
    width: map.width,
    height: map.height,
  };
});

function buildWorldMapRegistry(
  rawModules: Record<string, ImportedJsonModule>,
): Record<WorldMapId, WorldMapDefinition> {
  const registry: Record<WorldMapId, WorldMapDefinition> = {};

  for (const modulePath of Object.keys(rawModules)) {
    const rawModule = rawModules[modulePath];
    const definition = parseWorldMapDefinition(rawModule.default, modulePath);

    if (registry[definition.id]) {
      throw new Error(`Duplicate world map id "${definition.id}" found in "${modulePath}".`);
    }

    registry[definition.id] = definition;
  }

  for (const expectedMapId of WORLD_MAP_IDS) {
    if (!registry[expectedMapId]) {
      throw new Error(`Expected world map "${expectedMapId}" was not found.`);
    }
  }

  return registry;
}

function parseWorldMapDefinition(
  raw: unknown,
  sourcePath: string,
): WorldMapDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Invalid world map definition in "${sourcePath}".`);
  }

  const rawMap = raw as RawWorldMapDefinition;
  const id = parseNonEmptyString(rawMap.id, `${sourcePath}.id`);
  const name = parseNonEmptyString(rawMap.name, `${sourcePath}.name`);
  const tileSize = parsePositiveInteger(rawMap.tileSize, `${sourcePath}.tileSize`);
  const width = parsePositiveInteger(rawMap.width, `${sourcePath}.width`);
  const height = parsePositiveInteger(rawMap.height, `${sourcePath}.height`);

  const tiles = parseWorldMapTiles(rawMap, id, width, height, sourcePath);

  const seenTileKeys = new Set<string>();
  const streetSpawnTiles: WorldMapTileCoordinates[] = [];
  const fallbackSpawnTiles: WorldMapTileCoordinates[] = [];
  for (const tile of tiles) {
    const tileKey = `${tile.x}_${tile.y}`;

    if (seenTileKeys.has(tileKey)) {
      throw new Error(`Duplicate tile "${tileKey}" found in world map "${id}".`);
    }

    seenTileKeys.add(tileKey);

    if (isWorldMapTerrainTileStreetSpawn(tile.type)) {
      streetSpawnTiles.push({ tileX: tile.x, tileY: tile.y });
    }

    if (!isWorldMapTerrainTileSolid(tile.type)) {
      fallbackSpawnTiles.push({ tileX: tile.x, tileY: tile.y });
    }
  }

  const expectedTileCount = width * height;
  if (tiles.length !== expectedTileCount) {
    throw new Error(
      `World map "${id}" must define ${expectedTileCount} tiles, found ${tiles.length}.`,
    );
  }

  return {
    id,
    name,
    tileSize,
    width,
    height,
    tiles,
    streetSpawnTiles,
    fallbackSpawnTiles,
  };
}

function parseWorldMapTiles(
  rawMap: RawWorldMapDefinition,
  mapId: string,
  width: number,
  height: number,
  sourcePath: string,
): WorldMapTileDefinition[] {
  if (Array.isArray(rawMap.tiles)) {
    return rawMap.tiles.map((rawTile, index) => (
      parseWorldMapTile(mapId, width, height, rawTile, index)
    ));
  }

  if (rawMap.encoding === COMPRESSED_WORLD_MAP_ENCODING) {
    return parseCompressedWorldMapTiles(rawMap, mapId, width, height, sourcePath);
  }

  throw new Error(`World map "${mapId}" must define tiles or "${COMPRESSED_WORLD_MAP_ENCODING}" data.`);
}

function parseCompressedWorldMapTiles(
  rawMap: RawWorldMapDefinition,
  mapId: string,
  width: number,
  height: number,
  sourcePath: string,
): WorldMapTileDefinition[] {
  if (!Array.isArray(rawMap.tileTypes) || rawMap.tileTypes.length === 0) {
    throw new Error(`World map "${mapId}" must define tileTypes in "${sourcePath}".`);
  }

  if (!Array.isArray(rawMap.tileRuns)) {
    throw new Error(`World map "${mapId}" must define tileRuns in "${sourcePath}".`);
  }

  const tileTypes = rawMap.tileTypes.map((rawType, index) => {
    if (!isWorldMapTerrainTileType(rawType)) {
      throw new Error(`Unsupported terrain type "${String(rawType)}" in "${mapId}.tileTypes[${index}]".`);
    }

    return rawType;
  });

  const expectedTileCount = width * height;
  const tiles: WorldMapTileDefinition[] = [];
  let tileIndex = 0;

  for (let runIndex = 0; runIndex < rawMap.tileRuns.length; runIndex++) {
    const rawRun = rawMap.tileRuns[runIndex];

    if (!Array.isArray(rawRun) || rawRun.length !== 2) {
      throw new Error(`Invalid tile run "${runIndex}" for world map "${mapId}".`);
    }

    const tileTypeIndex = parseNonNegativeInteger(rawRun[0], `${mapId}.tileRuns[${runIndex}][0]`);
    const runLength = parsePositiveInteger(rawRun[1], `${mapId}.tileRuns[${runIndex}][1]`);
    const type = tileTypes[tileTypeIndex];

    if (type === undefined) {
      throw new Error(`Tile run "${runIndex}" for world map "${mapId}" references an unknown tile type.`);
    }

    for (let i = 0; i < runLength; i++) {
      if (tileIndex >= expectedTileCount) {
        throw new Error(`World map "${mapId}" defines more than ${expectedTileCount} compressed tiles.`);
      }

      tiles.push({
        x: tileIndex % width,
        y: Math.floor(tileIndex / width),
        type,
      });

      tileIndex += 1;
    }
  }

  if (tileIndex !== expectedTileCount) {
    throw new Error(
      `World map "${mapId}" must define ${expectedTileCount} compressed tiles, found ${tileIndex}.`,
    );
  }

  return tiles;
}

function parseWorldMapTile(
  mapId: string,
  width: number,
  height: number,
  raw: unknown,
  index: number,
): WorldMapTileDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Tile "${index}" for world map "${mapId}" is invalid.`);
  }

  const rawTile = raw as RawWorldMapTile;
  const x = parseNonNegativeInteger(rawTile.x, `${mapId}.tiles[${index}].x`);
  const y = parseNonNegativeInteger(rawTile.y, `${mapId}.tiles[${index}].y`);
  const type = rawTile.type;

  if (x >= width || y >= height) {
    throw new Error(`Tile "${index}" for world map "${mapId}" exceeds map bounds.`);
  }

  if (!isWorldMapTerrainTileType(type)) {
    throw new Error(`Unsupported terrain type "${String(type)}" in world map "${mapId}".`);
  }

  return {
    x,
    y,
    type,
  };
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

import type { BuildingOrientation } from "./building-types.js";
import type { BuildingName } from "./buildings-config.js";
import enemySpawnCatalog from "./building_spawns/enemy-spawns.json" with { type: "json" };
import lootSpawnCatalog from "./building_spawns/loot-spawns.json" with { type: "json" };

export type BuildingSpawnKind = "enemy" | "loot";

export interface BuildingSpawnPointDefinition {
  x: number;
  y: number;
}

type RawSpawnOrientation = {
  spawns?: unknown;
};

type RawSpawnVariation = {
  variation?: unknown;
  orientations?: Partial<Record<BuildingOrientation, RawSpawnOrientation>>;
};

type RawSpawnBuilding = {
  id?: unknown;
  variations?: RawSpawnVariation[];
};

type RawSpawnCatalog = {
  buildings?: RawSpawnBuilding[];
};

const SPAWN_CATALOG_BY_KIND: Record<BuildingSpawnKind, RawSpawnCatalog> = {
  enemy: enemySpawnCatalog as RawSpawnCatalog,
  loot: lootSpawnCatalog as RawSpawnCatalog,
};

export function getBuildingSpawnPoints(
  buildingName: BuildingName,
  variationIndex: number,
  orientation: BuildingOrientation,
  spawnKind: BuildingSpawnKind,
): BuildingSpawnPointDefinition[] {
  const catalog = SPAWN_CATALOG_BY_KIND[spawnKind];
  const building = catalog.buildings?.find((entry) => entry.id === buildingName);

  if (!building) {
    return [];
  }

  const variation = building.variations?.find((entry) => entry.variation === variationIndex);
  const spawnOrientation = variation?.orientations?.[orientation];

  if (!Array.isArray(spawnOrientation?.spawns)) {
    return [];
  }

  return spawnOrientation.spawns
    .map(parseSpawnPoint)
    .filter((point): point is BuildingSpawnPointDefinition => point !== null);
}

function parseSpawnPoint(raw: unknown): BuildingSpawnPointDefinition | null {
  if (!isRecord(raw)) {
    return null;
  }

  if (!Number.isInteger(raw.x) || !Number.isInteger(raw.y)) {
    return null;
  }

  return {
    x: Number(raw.x),
    y: Number(raw.y),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

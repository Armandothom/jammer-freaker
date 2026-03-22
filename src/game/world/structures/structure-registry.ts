import { EnemyType } from "../../../ecs/components/types/enemy-type.js";
import {
  StructureCategory,
  StructureDefinition,
  StructureEnemySpawnTileDefinition,
  StructureLootSpawnTileDefinition,
  StructureTileDefinition,
  StructureVariantDefinition,
  StructureVariantKey,
  isStructureWallTileType,
} from "../types/structure-definition.js";
import { StructureName } from "../types/structure-name.js";
import { StructureOrientation } from "../types/structure-orientation.js";

type RawStructureTile = {
  x: unknown;
  y: unknown;
  type: unknown;
  enemyType?: unknown;
  quantity?: unknown;
  lootTableId?: unknown;
  chance?: unknown;
};

type RawStructureVariant = {
  width: unknown;
  height: unknown;
  tiles: unknown;
};

type RawStructureDefinition = {
  id: unknown;
  category: unknown;
  variants: unknown;
};

type ImportedJsonModule = {
  default: unknown;
};

const RAW_STRUCTURE_MODULES = import.meta.glob<ImportedJsonModule>(
  "./*.json",
  { eager: true },
);

const VARIANT_KEYS: StructureVariantKey[] = ["north", "south", "east", "west"];
const STRUCTURE_CATEGORIES: StructureCategory[] = [
  "outer_structure",
  "great_outer_structure",
  "inner_structure",
  "main_building_structure",
  "walls_doors",
];

export const STRUCTURE_REGISTRY: Record<StructureName, StructureDefinition> =
  buildStructureRegistry(RAW_STRUCTURE_MODULES);

export function listStructureDefinitions(): StructureDefinition[] {
  return Object.keys(STRUCTURE_REGISTRY).map(
    structureId => STRUCTURE_REGISTRY[structureId],
  );
}

export function listStructureIds(): StructureName[] {
  return Object.keys(STRUCTURE_REGISTRY);
}

export function listStructureIdsByCategory(
  category: StructureCategory,
): StructureName[] {
  return listStructureDefinitions()
    .filter(definition => definition.category === category)
    .map(definition => definition.id);
}

export function getStructureDefinition(
  structureId: StructureName,
): StructureDefinition | null {
  return STRUCTURE_REGISTRY[structureId] ?? null;
}

export function getStructureVariant(
  structureId: StructureName,
  orientation: StructureOrientation,
): StructureVariantDefinition | null {
  const definition = getStructureDefinition(structureId);

  if (!definition) {
    return null;
  }

  return definition.variants[orientationToVariantKey(orientation)] ?? null;
}

export function getStructureFootprint(
  structureId: StructureName,
  orientation: StructureOrientation,
): { widthTiles: number; heightTiles: number } | null {
  const variant = getStructureVariant(structureId, orientation);

  if (!variant) {
    return null;
  }

  return {
    widthTiles: variant.width,
    heightTiles: variant.height,
  };
}

export function orientationToVariantKey(
  orientation: StructureOrientation,
): StructureVariantKey {
  switch (orientation) {
    case StructureOrientation.North:
      return "north";
    case StructureOrientation.South:
      return "south";
    case StructureOrientation.East:
      return "east";
    case StructureOrientation.West:
      return "west";
    default:
      return "north";
  }
}

function buildStructureRegistry(
  rawModules: Record<string, ImportedJsonModule>,
): Record<StructureName, StructureDefinition> {
  const registry: Record<StructureName, StructureDefinition> = {};

  for (const modulePath of Object.keys(rawModules)) {
    const rawModule = rawModules[modulePath];
    const definition = parseStructureDefinition(rawModule.default, modulePath);

    if (registry[definition.id]) {
      throw new Error(`Duplicate structure id "${definition.id}" found in "${modulePath}".`);
    }

    registry[definition.id] = definition;
  }

  return registry;
}

function parseStructureDefinition(
  raw: unknown,
  sourcePath: string,
): StructureDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Invalid structure definition in "${sourcePath}".`);
  }

  const definition = raw as RawStructureDefinition;
  const structureId = parseNonEmptyString(definition.id, `${sourcePath}.id`);
  const category = parseStructureCategory(
    definition.category,
    `${sourcePath}.category`,
  );

  if (!isRecord(definition.variants)) {
    throw new Error(`Structure "${structureId}" must define variants.`);
  }

  const variants: Partial<Record<StructureVariantKey, StructureVariantDefinition>> = {};

  for (const key of VARIANT_KEYS) {
    const rawVariant = definition.variants[key];
    if (rawVariant == null) {
      continue;
    }

    variants[key] = parseStructureVariant(structureId, key, rawVariant);
  }

  if (Object.keys(variants).length === 0) {
    throw new Error(`Structure "${structureId}" must provide at least one variant.`);
  }

  return {
    id: structureId,
    category,
    variants,
  };
}

function parseStructureVariant(
  structureId: StructureName,
  variantKey: StructureVariantKey,
  raw: unknown,
): StructureVariantDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Variant "${variantKey}" for "${structureId}" is invalid.`);
  }

  const variant = raw as RawStructureVariant;
  const width = parsePositiveInteger(variant.width, `${structureId}.${variantKey}.width`);
  const height = parsePositiveInteger(variant.height, `${structureId}.${variantKey}.height`);

  if (!Array.isArray(variant.tiles)) {
    throw new Error(`Variant "${variantKey}" for "${structureId}" must define tiles.`);
  }

  const tiles = variant.tiles.map((tile, index) =>
    parseStructureTile(structureId, variantKey, width, height, tile, index),
  );

  return {
    width,
    height,
    tiles,
  };
}

function parseStructureTile(
  structureId: StructureName,
  variantKey: StructureVariantKey,
  width: number,
  height: number,
  raw: unknown,
  index: number,
): StructureTileDefinition {
  if (!isRecord(raw)) {
    throw new Error(`Tile "${index}" for "${structureId}.${variantKey}" is invalid.`);
  }

  const tile = raw as RawStructureTile;
  const x = parseNonNegativeInteger(tile.x, `${structureId}.${variantKey}.tiles[${index}].x`);
  const y = parseNonNegativeInteger(tile.y, `${structureId}.${variantKey}.tiles[${index}].y`);
  const type = tile.type;

  if (x >= width || y >= height) {
    throw new Error(
      `Tile "${index}" for "${structureId}.${variantKey}" exceeds variant bounds.`,
    );
  }

  if (typeof type === "string" && isStructureWallTileType(type)) {
    return { x, y, type };
  }

  switch (type) {
    case "player_spawn":
      return { x, y, type };

    case "enemy_spawn":
      return {
        x,
        y,
        type,
        enemyType: parseEnemyType(
          tile.enemyType,
          `${structureId}.${variantKey}.tiles[${index}].enemyType`,
        ),
        quantity: tile.quantity == null
          ? 1
          : parsePositiveInteger(
            tile.quantity,
            `${structureId}.${variantKey}.tiles[${index}].quantity`,
          ),
      } satisfies StructureEnemySpawnTileDefinition;

    case "loot_spawn":
      return {
        x,
        y,
        type,
        lootTableId: parseNonEmptyString(
          tile.lootTableId,
          `${structureId}.${variantKey}.tiles[${index}].lootTableId`,
        ),
        chance: tile.chance == null
          ? 1
          : parseProbability(
            tile.chance,
            `${structureId}.${variantKey}.tiles[${index}].chance`,
          ),
      } satisfies StructureLootSpawnTileDefinition;

    default:
      throw new Error(
        `Unsupported tile type "${String(type)}" in "${structureId}.${variantKey}".`,
      );
  }
}

function parseEnemyType(value: unknown, path: string): EnemyType {
  if (typeof value !== "string" || !isEnemyType(value)) {
    throw new Error(`"${path}" must be a valid EnemyType.`);
  }

  return value as EnemyType;
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

function parseProbability(value: unknown, path: string): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
    throw new Error(`"${path}" must be a number between 0 and 1.`);
  }

  return value;
}

function parseStructureCategory(
  value: unknown,
  path: string,
): StructureCategory {
  if (
    typeof value !== "string" ||
    STRUCTURE_CATEGORIES.indexOf(value as StructureCategory) === -1
  ) {
    throw new Error(`"${path}" must be a valid structure category.`);
  }

  return value as StructureCategory;
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

function isEnemyType(value: string): value is EnemyType {
  switch (value) {
    case EnemyType.SOLDIER:
    case EnemyType.SNIPER:
    case EnemyType.KAMIKAZE:
    case EnemyType.JUGG:
    case EnemyType.BOMBER:
      return true;
    default:
      return false;
  }
}

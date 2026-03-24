import { EnemyType } from "../../../ecs/components/types/enemy-type.js";
import { StructureName } from "./structure-name.js";

export type StructureVariantKey = "north" | "south" | "east" | "west";
export type StructureCategory =
  | "outer_structure"
  | "great_outer_structure"
  | "inner_structure"
  | "main_building_structure"
  | "walls_doors"
  | "playerSpawn_hostageExtraction";

export type StructureDoorTileType =
  | `outer_door_${number}`
  | `inner_door_${number}`;

export type StructureWallTileType =
  | "wall"
  | StructureDoorTileType;

export type StructureGroundTileType =
  | "player_spawn"
  | "extraction_area";

export type StructureTileType =
  | StructureWallTileType
  | StructureGroundTileType
  | "enemy_spawn"
  | "loot_spawn";

export interface StructureWallTileDefinition {
  x: number;
  y: number;
  type: StructureWallTileType;
}

export interface StructurePlayerSpawnTileDefinition {
  x: number;
  y: number;
  type: "player_spawn";
}

export interface StructureExtractionAreaTileDefinition {
  x: number;
  y: number;
  type: "extraction_area";
}

export interface StructureEnemySpawnTileDefinition {
  x: number;
  y: number;
  type: "enemy_spawn";
  enemyType: EnemyType;
  quantity?: number;
}

export interface StructureLootSpawnTileDefinition {
  x: number;
  y: number;
  type: "loot_spawn";
  lootTableId: string;
  chance?: number;
}

export type StructureTileDefinition =
  | StructureWallTileDefinition
  | StructurePlayerSpawnTileDefinition
  | StructureExtractionAreaTileDefinition
  | StructureEnemySpawnTileDefinition
  | StructureLootSpawnTileDefinition;

export interface StructureVariantDefinition {
  width: number;
  height: number;
  tiles: StructureTileDefinition[];
}

export interface StructureDefinition {
  id: StructureName;
  category: StructureCategory;
  variants: Partial<Record<StructureVariantKey, StructureVariantDefinition>>;
}

export function isStructureDoorTileType(
  value: string,
): value is StructureDoorTileType {
  return /^((outer)|(inner))_door_\d+$/.test(value);
}

export function isStructureWallTileType(
  value: string,
): value is StructureWallTileType {
  return value === "wall" || isStructureDoorTileType(value);
}

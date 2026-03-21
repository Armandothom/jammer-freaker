import { EnemyType } from "../../../ecs/components/types/enemy-type.js";
import { StructureName } from "./structure-name.js";

export type StructureVariantKey = "north" | "south" | "east" | "west";

export type StructureTileType =
  | "wall"
  | "player_spawn"
  | "enemy_spawn"
  | "loot_spawn";

export interface StructureWallTileDefinition {
  x: number;
  y: number;
  type: "wall";
}

export interface StructurePlayerSpawnTileDefinition {
  x: number;
  y: number;
  type: "player_spawn";
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
  | StructureEnemySpawnTileDefinition
  | StructureLootSpawnTileDefinition;

export interface StructureVariantDefinition {
  width: number;
  height: number;
  tiles: StructureTileDefinition[];
}

export interface StructureDefinition {
  id: StructureName;
  variants: Partial<Record<StructureVariantKey, StructureVariantDefinition>>;
}


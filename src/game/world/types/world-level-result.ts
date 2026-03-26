import { EnemyType } from "../../../ecs/components/types/enemy-type.js";
import { StructureWallTileType } from "./structure-definition.js";
import { StructureName } from "./structure-name.js";
import { StructureOrientation } from "./structure-orientation.js";
import { WorldGroundTileType } from "./tilemap-tile.js";

export interface BakedWall {
    x: number;
    y: number;
    type: StructureWallTileType;
}

export interface BakedPlayerSpawn {
    x: number;
    y: number;
}

export interface BakedGroundTile {
    x: number;
    y: number;
    type: WorldGroundTileType;
}

export interface BakedEnemySpawn {
    x: number;
    y: number;
    enemyType: EnemyType;
    quantity: number;
}

export interface BakedLootSpawn {
    x: number;
    y: number;
    lootTableId: string;
    chance: number;
}

export interface BakedStructureResult {
    structureId: StructureName;
    orientation: StructureOrientation;
    width: number;
    height: number;
    groundTiles: BakedGroundTile[];
    walls: BakedWall[];
    playerSpawns: BakedPlayerSpawn[];
    enemySpawns: BakedEnemySpawn[];
    lootSpawns: BakedLootSpawn[];
}

export interface WorldLevelResult {
    groundTiles: BakedGroundTile[];
    walls: BakedWall[];
    playerSpawns: BakedPlayerSpawn[];
    enemySpawns: BakedEnemySpawn[];
    lootSpawns: BakedLootSpawn[];
}

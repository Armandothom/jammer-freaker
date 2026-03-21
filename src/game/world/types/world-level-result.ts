import { EnemyType } from "../../../ecs/components/types/enemy-type.js";
import { StructureName } from "./structure-name.js";
import { StructureOrientation } from "./structure-orientation.js";

export interface BakedWall {
    x: number;
    y: number;
    type: 'wall';
}

export interface BakedPlayerSpawn {
    x: number;
    y: number;
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
    walls: BakedWall[];
    playerSpawns: BakedPlayerSpawn[];
    enemySpawns: BakedEnemySpawn[];
    lootSpawns: BakedLootSpawn[];
}

export interface WorldLevelResult {
    walls: BakedWall[];
    playerSpawns: BakedPlayerSpawn[];
    enemySpawns: BakedEnemySpawn[];
    lootSpawns: BakedLootSpawn[];
}
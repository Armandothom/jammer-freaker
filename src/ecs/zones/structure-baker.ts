import { StructureName } from '../../game/world/types/structure-name.js';
import { StructureOrientation } from '../../game/world/types/structure-orientation.js';
import { getStructureDefinition, getStructureVariant } from '../../game/world/structures/structure-registry.js';
import { BakedStructureResult } from '../../game/world/types/world-level-result.js';
import { StructureTileDefinition } from '../../game/world/types/structure-definition.js';

export interface BakeParams {
    structureId: StructureName;
    worldX: number;
    worldY: number;
    orientation: StructureOrientation;
}

export class StructureBaker {
    public bake(params: BakeParams): BakedStructureResult | null {
        const def = getStructureDefinition(params.structureId);

        if (!def) {
            console.warn(`Structure not found: ${params.structureId}`);
            return null;
        }

        const variant = getStructureVariant(params.structureId, params.orientation);

        if (!variant) {
            console.warn(
                `Variant not found for structure ${params.structureId} in orientation ${params.orientation}`,
            );
            return null;
        }

        const result: BakedStructureResult = {
            structureId: def.id,
            orientation: params.orientation,
            width: variant.width,
            height: variant.height,
            walls: [],
            playerSpawns: [],
            enemySpawns: [],
            lootSpawns: [],
        };

        for (const tile of variant.tiles) {
            const worldX = params.worldX + tile.x;
            const worldY = params.worldY + tile.y;

            this.appendTileToResult(result, worldX, worldY, tile);
        }

        return result;
    }

    private appendTileToResult(
        result: BakedStructureResult,
        worldX: number,
        worldY: number,
        tile: StructureTileDefinition,
    ): void {
        switch (tile.type) {
            case 'wall':
                result.walls.push({
                    x: worldX,
                    y: worldY,
                    type: 'wall',
                });
                return;

            case 'player_spawn':
                result.playerSpawns.push({
                    x: worldX,
                    y: worldY,
                });
                return;

            case 'enemy_spawn':
                result.enemySpawns.push({
                    x: worldX,
                    y: worldY,
                    enemyType: tile.enemyType,
                    quantity: tile.quantity ?? 1,
                });
                return;

            case 'loot_spawn':
                result.lootSpawns.push({
                    x: worldX,
                    y: worldY,
                    lootTableId: tile.lootTableId,
                    chance: tile.chance ?? 1,
                });
                return;

            default:
                return;
        }
    }
}

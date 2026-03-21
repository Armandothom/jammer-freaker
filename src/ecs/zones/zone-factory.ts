import { StructureName } from '../../game/world/types/structure-name.js';
import { StructureOrientation } from '../../game/world/types/structure-orientation.js';
import { BakedStructureResult, WorldLevelResult } from '../../game/world/types/world-level-result.js';
import { WorldZone, ZoneType } from '../../game/world/types/zone-type.js';
import { getStructureFootprint, listStructureIds } from '../../game/world/structures/structure-registry.js';
import { StructureBaker } from './structure-baker.js';

export interface ZoneStructurePlacement {
    structureId: StructureName;
    orientation: StructureOrientation;
    tileX: number;
    tileY: number;
    zone: WorldZone;
}

export interface GenerateLevelParams {
    levelNumber: number;
    zones: WorldZone[];
}

export interface RandomLike {
    next(): number; // [0, 1)
}

export class MathRandom implements RandomLike {
    next(): number {
        return Math.random();
    }
}

type ZoneChanceTable = Record<ZoneType, number>;

export class ZoneFactory {
    private readonly structureBaker: StructureBaker;
    private readonly rng: RandomLike;

    private readonly spawnChanceByZoneType: ZoneChanceTable = {
        [ZoneType.NorthExterior]: 0.65,
        [ZoneType.SouthExterior]: 0.65,
        [ZoneType.EastExterior]: 0.65,
        [ZoneType.WestExterior]: 0.65,

        [ZoneType.NorthWestCorner]: 0.85,
        [ZoneType.NorthEastCorner]: 0.85,
        [ZoneType.SouthWestCorner]: 0.85,
        [ZoneType.SouthEastCorner]: 0.85,

        [ZoneType.InnerNorthWest]: 0.35,
        [ZoneType.InnerNorthEast]: 0.35,
        [ZoneType.InnerSouthWest]: 0.35,
        [ZoneType.InnerSouthEast]: 0.35,
    };

    private readonly orientationByZoneType: Record<ZoneType, StructureOrientation> = {
        [ZoneType.NorthExterior]: StructureOrientation.North,
        [ZoneType.SouthExterior]: StructureOrientation.South,
        [ZoneType.EastExterior]: StructureOrientation.East,
        [ZoneType.WestExterior]: StructureOrientation.West,
        [ZoneType.NorthWestCorner]: StructureOrientation.North,
        [ZoneType.NorthEastCorner]: StructureOrientation.North,
        [ZoneType.SouthWestCorner]: StructureOrientation.South,
        [ZoneType.SouthEastCorner]: StructureOrientation.South,
        [ZoneType.InnerNorthWest]: StructureOrientation.North,
        [ZoneType.InnerNorthEast]: StructureOrientation.North,
        [ZoneType.InnerSouthWest]: StructureOrientation.South,
        [ZoneType.InnerSouthEast]: StructureOrientation.South,
    };

    constructor(
        structureBaker: StructureBaker,
        rng: RandomLike = new MathRandom(),
    ) {
        this.structureBaker = structureBaker;
        this.rng = rng;
    }

    public generateLevel(params: GenerateLevelParams): WorldLevelResult {
        void params.levelNumber;
        return this.generateForZones(params.zones);
    }

    private generateForZones(zones: WorldZone[]): WorldLevelResult {
        const result = this.createEmptyWorldLevelResult();

        for (const zone of zones) {
            const bakedStructure = this.tryGenerateForZone(zone);

            if (!bakedStructure) {
                continue;
            }

            this.mergeStructureIntoWorldResult(result, bakedStructure);
        }

        return result;
    }

    private createEmptyWorldLevelResult(): WorldLevelResult {
        return {
            walls: [],
            playerSpawns: [],
            enemySpawns: [],
            lootSpawns: [],
        };
    }

    private mergeStructureIntoWorldResult(
        target: WorldLevelResult,
        source: BakedStructureResult,
    ): void {
        target.walls.push(...source.walls);
        target.playerSpawns.push(...source.playerSpawns);
        target.enemySpawns.push(...source.enemySpawns);
        target.lootSpawns.push(...source.lootSpawns);
    }

    private tryGenerateForZone(zone: WorldZone): BakedStructureResult | null {
        const chance = this.spawnChanceByZoneType[zone.type] ?? 0;

        if (!this.roll(chance)) {
            return null;
        }

        const orientation = this.resolveOrientation(zone.type);
        if (!orientation) {
            return null;
        }

        const structureId = this.resolveStructureId(zone, orientation);
        if (!structureId) {
            return null;
        }

        const footprint = getStructureFootprint(structureId, orientation);
        if (!footprint) {
            console.warn(`Missing footprint for structure "${structureId}" in orientation "${orientation}".`);
            return null;
        }

        if (footprint.widthTiles > zone.widthTiles || footprint.heightTiles > zone.heightTiles) {
            console.warn(`Structure "${structureId}" does not fit inside zone "${zone.type}".`);
            return null;
        }

        const offset = this.resolveOffset(zone, footprint);

        const placement: ZoneStructurePlacement = {
            structureId,
            orientation,
            tileX: zone.tileX + offset.x,
            tileY: zone.tileY + offset.y,
            zone,
        };

        return this.structureBaker.bake({
            structureId: placement.structureId,
            worldX: placement.tileX,
            worldY: placement.tileY,
            orientation: placement.orientation,
        });
    }

    private roll(chance: number): boolean {
        if (chance <= 0) return false;
        if (chance >= 1) return true;
        return this.rng.next() < chance;
    }

    private resolveStructureId(
        zone: WorldZone,
        orientation: StructureOrientation,
    ): StructureName | null {
        const availableStructures = listStructureIds().filter(structureId => {
            const footprint = getStructureFootprint(structureId, orientation);

            return footprint !== null &&
                footprint.widthTiles <= zone.widthTiles &&
                footprint.heightTiles <= zone.heightTiles;
        });

        if (availableStructures.length === 0) {
            return null;
        }

        return availableStructures[this.randomInt(0, availableStructures.length - 1)];
    }

    private resolveOrientation(zoneType: ZoneType): StructureOrientation | null {
        return this.orientationByZoneType[zoneType] ?? null;
    }

    private resolveOffset(
        zone: WorldZone,
        footprint: { widthTiles: number; heightTiles: number },
    ): { x: number; y: number } {
        const margin = 0;
        const maxOffsetX = Math.max(0, zone.widthTiles - footprint.widthTiles);
        const maxOffsetY = Math.max(0, zone.heightTiles - footprint.heightTiles);

        switch (zone.type) {
            case ZoneType.NorthExterior:
                return {
                    x: this.randomInt(0, maxOffsetX),
                    y: margin,
                };

            case ZoneType.SouthExterior:
                return {
                    x: this.randomInt(0, maxOffsetX),
                    y: maxOffsetY,
                };

            case ZoneType.EastExterior:
                return {
                    x: maxOffsetX,
                    y: this.randomInt(0, maxOffsetY),
                };

            case ZoneType.WestExterior:
                return {
                    x: margin,
                    y: this.randomInt(0, maxOffsetY),
                };

            case ZoneType.NorthWestCorner:
                return { x: margin, y: margin };

            case ZoneType.NorthEastCorner:
                return { x: maxOffsetX, y: margin };

            case ZoneType.SouthWestCorner:
                return { x: margin, y: maxOffsetY };

            case ZoneType.SouthEastCorner:
                return { x: maxOffsetX, y: maxOffsetY };

            case ZoneType.InnerNorthWest:
                return this.innerOffset(zone, footprint, -1, -1);

            case ZoneType.InnerNorthEast:
                return this.innerOffset(zone, footprint, 1, -1);

            case ZoneType.InnerSouthWest:
                return this.innerOffset(zone, footprint, -1, 1);

            case ZoneType.InnerSouthEast:
                return this.innerOffset(zone, footprint, 1, 1);

            default:
                return { x: 0, y: 0 };
        }
    }

    private innerOffset(
        zone: WorldZone,
        footprint: { widthTiles: number; heightTiles: number },
        dirX: -1 | 1,
        dirY: -1 | 1,
    ): { x: number; y: number } {
        const maxOffsetX = Math.max(0, zone.widthTiles - footprint.widthTiles);
        const maxOffsetY = Math.max(0, zone.heightTiles - footprint.heightTiles);

        const centerX = Math.floor(maxOffsetX / 2);
        const centerY = Math.floor(maxOffsetY / 2);

        const variationX = Math.floor(maxOffsetX * 0.2);
        const variationY = Math.floor(maxOffsetY * 0.2);

        const x = centerX + dirX * this.randomInt(0, Math.max(0, variationX));
        const y = centerY + dirY * this.randomInt(0, Math.max(0, variationY));

        return {
            x: this.clamp(x, 0, maxOffsetX),
            y: this.clamp(y, 0, maxOffsetY),
        };
    }

    private randomInt(min: number, max: number): number {
        if (max <= min) return min;
        return Math.floor(this.rng.next() * (max - min + 1)) + min;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}

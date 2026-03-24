import { getStructureFootprint, listStructureIdsByCategory } from '../../game/world/structures/structure-registry.js';
import { StructureCategory, StructureWallTileType } from '../../game/world/types/structure-definition.js';
import { StructureName } from '../../game/world/types/structure-name.js';
import { StructureOrientation } from '../../game/world/types/structure-orientation.js';
import { BakedStructureResult, WorldLevelResult } from '../../game/world/types/world-level-result.js';
import { WorldZone, ZoneType } from '../../game/world/types/zone-type.js';
import { StructureBaker } from './structure-baker.js';

export interface ZoneStructurePlacement {
    structureId: StructureName;
    orientation: StructureOrientation;
    tileX: number;
    tileY: number;
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

interface PlacementArea {
    tileX: number;
    tileY: number;
    widthTiles: number;
    heightTiles: number;
}

interface StructureCandidate {
    structureId: StructureName;
    orientation: StructureOrientation;
    footprint: {
        widthTiles: number;
        heightTiles: number;
    };
}

interface GreatOuterPlacement {
    area: PlacementArea;
    reservedZones: WorldZone[];
}

interface TilePosition {
    x: number;
    y: number;
}

interface MainBuildingPlacement {
    bakedStructure: BakedStructureResult;
    orientation: StructureOrientation;
}

interface WallsDoorsPlacement {
    bakedStructure: BakedStructureResult;
    reservedOpenTiles: TilePosition[];
}

type ZoneChanceTable = Record<ZoneType, number>;
const ALL_ORIENTATIONS: StructureOrientation[] = [
    StructureOrientation.North,
    StructureOrientation.South,
    StructureOrientation.East,
    StructureOrientation.West,
];

export class ZoneFactory {
    private readonly structureBaker: StructureBaker;
    private readonly rng: RandomLike;
    private readonly greatOuterSpawnChance = 0.65;

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
        const reservedExteriorZoneKeys = new Set<string>();
        const reservedOpenTileKeys = new Set<string>();

        const greatOuterPlacement = this.tryGenerateGreatOuterStructure(zones);
        if (greatOuterPlacement) {
            this.mergeStructureIntoWorldResult(result, greatOuterPlacement.bakedStructure);

            for (const zone of greatOuterPlacement.reservedZones) {
                reservedExteriorZoneKeys.add(this.zoneKey(zone));
            }
        }

        this.generatePlayerSpawnHostageExtraction(zones, reservedExteriorZoneKeys, result);
        this.generateOuterStructures(zones, reservedExteriorZoneKeys, result);
        this.generateInnerStructures(zones, result, reservedOpenTileKeys);
        this.removeWallsAtReservedTiles(result, reservedOpenTileKeys);

        return result;
    }

    private createEmptyWorldLevelResult(): WorldLevelResult {
        return {
            groundTiles: [],
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
        target.groundTiles.push(...source.groundTiles);
        target.walls.push(...source.walls);
        target.playerSpawns.push(...source.playerSpawns);
        target.enemySpawns.push(...source.enemySpawns);
        target.lootSpawns.push(...source.lootSpawns);
    }

    private generateInnerPerimeterWalls(
        zones: WorldZone[],
        result: WorldLevelResult,
    ): void {
        const innerZones = zones.filter(zone => this.isInnerZone(zone.type));
        if (innerZones.length === 0) {
            return;
        }

        const innerArea = this.combineZones(innerZones);
        const maxX = innerArea.tileX + innerArea.widthTiles - 1;
        const maxY = innerArea.tileY + innerArea.heightTiles - 1;

        for (let x = innerArea.tileX; x <= maxX; x++) {
            result.walls.push({ x, y: innerArea.tileY, type: 'wall' });
            result.walls.push({ x, y: maxY, type: 'wall' });
        }

        for (let y = innerArea.tileY + 1; y < maxY; y++) {
            result.walls.push({ x: innerArea.tileX, y, type: 'wall' });
            result.walls.push({ x: maxX, y, type: 'wall' });
        }
    }

    private generateOuterStructures(
        zones: WorldZone[],
        reservedExteriorZoneKeys: Set<string>,
        result: WorldLevelResult,
    ): void {
        for (const zone of zones) {
            if (!this.isExteriorZone(zone.type) || reservedExteriorZoneKeys.has(this.zoneKey(zone))) {
                continue;
            }

            const bakedStructure = this.tryGenerateForZoneCategory(zone, 'outer_structure');
            if (!bakedStructure) {
                continue;
            }

            this.mergeStructureIntoWorldResult(result, bakedStructure);
        }
    }

    private generatePlayerSpawnHostageExtraction(
        zones: WorldZone[],
        reservedExteriorZoneKeys: Set<string>,
        result: WorldLevelResult,
    ): void {
        const eligibleZones = this.shuffle(
            zones.filter(zone =>
                this.isExteriorZone(zone.type) &&
                !reservedExteriorZoneKeys.has(this.zoneKey(zone)),
            ),
        );

        for (const zone of eligibleZones) {
            const bakedStructure = this.tryGenerateFixedStructureForZone(
                zone,
                'playerSpawn_hostageExtraction',
            );

            if (!bakedStructure) {
                continue;
            }

            this.mergeStructureIntoWorldResult(result, bakedStructure);
            reservedExteriorZoneKeys.add(this.zoneKey(zone));
            return;
        }

        console.warn('Unable to place a playerSpawn_hostageExtraction structure in any exterior zone.');
    }

    private generateInnerStructures(
        zones: WorldZone[],
        result: WorldLevelResult,
        reservedOpenTileKeys: Set<string>,
    ): void {
        const innerZones = this.shuffle(
            zones.filter(zone => this.isInnerZone(zone.type)),
        );

        if (innerZones.length === 0) {
            return;
        }

        let mainBuildingZoneKey: string | null = null;
        let mainBuildingPlacement: MainBuildingPlacement | null = null;

        for (const zone of innerZones) {
            const mainBuilding = this.tryGenerateMainBuildingForZone(zone);

            if (!mainBuilding) {
                continue;
            }

            mainBuildingZoneKey = this.zoneKey(zone);
            mainBuildingPlacement = mainBuilding;
            break;
        }

        if (mainBuildingPlacement) {
            const wallsDoors = this.tryGenerateInnerWallsDoors(
                zones,
                mainBuildingPlacement.orientation,
            );

            if (wallsDoors) {
                this.mergeStructureIntoWorldResult(result, wallsDoors.bakedStructure);
                this.reserveOpenTiles(reservedOpenTileKeys, wallsDoors.reservedOpenTiles);
            } else {
                this.generateInnerPerimeterWalls(zones, result);
            }

            this.mergeStructureIntoWorldResult(result, mainBuildingPlacement.bakedStructure);
        } else {
            this.generateInnerPerimeterWalls(zones, result);
        }

        if (!mainBuildingZoneKey) {
            console.warn('Unable to place a main_building_structure in any inner zone.');
        }

        for (const zone of innerZones) {
            if (this.zoneKey(zone) === mainBuildingZoneKey) {
                continue;
            }

            const bakedStructure = this.tryGenerateForZoneCategory(zone, 'inner_structure');
            if (!bakedStructure) {
                continue;
            }

            this.mergeStructureIntoWorldResult(result, bakedStructure);
        }
    }

    private tryGenerateGreatOuterStructure(
        zones: WorldZone[],
    ): { bakedStructure: BakedStructureResult; reservedZones: WorldZone[] } | null {
        if (!this.roll(this.greatOuterSpawnChance)) {
            return null;
        }

        const placements = this.shuffle(this.buildGreatOuterPlacements(zones));

        for (const placement of placements) {
            const bakedStructure = this.tryGenerateForArea({
                area: placement.area,
                category: 'great_outer_structure',
                orientations: ALL_ORIENTATIONS,
            });

            if (!bakedStructure) {
                continue;
            }

            return {
                bakedStructure,
                reservedZones: placement.reservedZones,
            };
        }

        return null;
    }

    private tryGenerateForZoneCategory(
        zone: WorldZone,
        category: StructureCategory,
    ): BakedStructureResult | null {
        const chance = this.spawnChanceByZoneType[zone.type] ?? 0;

        if (!this.roll(chance)) {
            return null;
        }

        return this.tryGenerateFixedStructureForZone(zone, category);
    }

    private tryGenerateMainBuildingForZone(
        zone: WorldZone,
    ): MainBuildingPlacement | null {
        const candidate = this.resolveStructureCandidate(
            zone,
            'main_building_structure',
            this.resolveMainBuildingOrientations(zone.type),
        );

        if (!candidate) {
            return null;
        }

        const offset = this.resolveZoneOffset(
            zone,
            candidate.footprint,
            'main_building_structure',
        );
        const bakedStructure = this.structureBaker.bake({
            structureId: candidate.structureId,
            worldX: zone.tileX + offset.x,
            worldY: zone.tileY + offset.y,
            orientation: candidate.orientation,
        });

        if (!bakedStructure) {
            return null;
        }

        return {
            bakedStructure,
            orientation: candidate.orientation,
        };
    }

    private tryGenerateFixedStructureForZone(
        zone: WorldZone,
        category: StructureCategory,
    ): BakedStructureResult | null {
        const orientation = this.resolveOrientation(zone.type);
        if (!orientation) {
            return null;
        }

        const candidate = this.resolveStructureCandidate(
            zone,
            category,
            [orientation],
        );

        if (!candidate) {
            return null;
        }

        const offset = this.resolveZoneOffset(zone, candidate.footprint, category);

        return this.structureBaker.bake({
            structureId: candidate.structureId,
            worldX: zone.tileX + offset.x,
            worldY: zone.tileY + offset.y,
            orientation: candidate.orientation,
        });
    }

    private tryGenerateInnerWallsDoors(
        zones: WorldZone[],
        orientation: StructureOrientation,
    ): WallsDoorsPlacement | null {
        const innerZones = zones.filter(zone => this.isInnerZone(zone.type));
        if (innerZones.length === 0) {
            return null;
        }

        const innerArea = this.combineZones(innerZones);
        const wallsDoors = this.tryGenerateForArea({
            area: innerArea,
            category: 'walls_doors',
            orientations: [orientation],
        });

        if (!wallsDoors) {
            return null;
        }

        const outerDoorType = this.pickDoorType(wallsDoors.walls, 'outer_door_');
        const innerDoorType = this.pickDoorType(wallsDoors.walls, 'inner_door_');
        const reservedOpenTiles: TilePosition[] = [];

        if (!outerDoorType || !innerDoorType) {
            return {
                bakedStructure: wallsDoors,
                reservedOpenTiles,
            };
        }

        reservedOpenTiles.push(
            ...this.buildDoorwayOpenTiles(wallsDoors.walls, outerDoorType),
            ...this.buildDoorwayOpenTiles(wallsDoors.walls, innerDoorType),
        );
        wallsDoors.walls = wallsDoors.walls.filter(wall =>
            wall.type !== outerDoorType && wall.type !== innerDoorType,
        );

        return {
            bakedStructure: wallsDoors,
            reservedOpenTiles,
        };
    }

    private tryGenerateForArea(params: {
        area: PlacementArea;
        category: StructureCategory;
        orientations: StructureOrientation[];
    }): BakedStructureResult | null {
        const candidate = this.resolveStructureCandidate(
            params.area,
            params.category,
            params.orientations,
        );

        if (!candidate) {
            return null;
        }

        const offset = this.resolveAreaOffset(params.area, candidate.footprint);

        const placement: ZoneStructurePlacement = {
            structureId: candidate.structureId,
            orientation: candidate.orientation,
            tileX: params.area.tileX + offset.x,
            tileY: params.area.tileY + offset.y,
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

    private resolveStructureCandidate(
        area: PlacementArea,
        category: StructureCategory,
        orientations: StructureOrientation[],
    ): StructureCandidate | null {
        const candidates: StructureCandidate[] = [];

        for (const structureId of listStructureIdsByCategory(category)) {
            for (const orientation of orientations) {
                const footprint = getStructureFootprint(structureId, orientation);
                if (!footprint) {
                    continue;
                }

                if (footprint.widthTiles > area.widthTiles || footprint.heightTiles > area.heightTiles) {
                    continue;
                }

                candidates.push({
                    structureId,
                    orientation,
                    footprint,
                });
            }
        }

        if (candidates.length === 0) {
            return null;
        }

        return candidates[this.randomInt(0, candidates.length - 1)];
    }

    private resolveOrientation(zoneType: ZoneType): StructureOrientation | null {
        return this.orientationByZoneType[zoneType] ?? null;
    }

    private resolveMainBuildingOrientations(
        zoneType: ZoneType,
    ): StructureOrientation[] {
        switch (zoneType) {
            case ZoneType.InnerNorthWest:
                return [StructureOrientation.East];

            case ZoneType.InnerNorthEast:
                return [StructureOrientation.South];

            case ZoneType.InnerSouthWest:
                return [StructureOrientation.North];

            case ZoneType.InnerSouthEast:
                return [StructureOrientation.West];

            default:
                return ALL_ORIENTATIONS;
        }
    }

    private resolveAreaOffset(
        area: PlacementArea,
        footprint: { widthTiles: number; heightTiles: number },
    ): { x: number; y: number } {
        const possibleOffsets = this.resolvePossibleOffsets(area, footprint);
        return {
            x: this.pickOffset(possibleOffsets.x),
            y: this.pickOffset(possibleOffsets.y),
        };
    }

    private resolvePossibleOffsets(
        area: PlacementArea,
        footprint: { widthTiles: number; heightTiles: number },
    ): { x: number[]; y: number[] } {
        const maxOffsetX = Math.max(0, area.widthTiles - footprint.widthTiles);
        const maxOffsetY = Math.max(0, area.heightTiles - footprint.heightTiles);

        return {
            x: this.buildOffsetOptions(maxOffsetX),
            y: this.buildOffsetOptions(maxOffsetY),
        };
    }

    private resolveZoneOffset(
        zone: WorldZone,
        footprint: { widthTiles: number; heightTiles: number },
        category?: StructureCategory,
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
                return category === 'main_building_structure'
                    ? this.resolveMainBuildingOffset(zone, footprint)
                    : this.resolveInnerZoneOffset(zone, footprint);

            case ZoneType.InnerNorthEast:
                return category === 'main_building_structure'
                    ? this.resolveMainBuildingOffset(zone, footprint)
                    : this.resolveInnerZoneOffset(zone, footprint);

            case ZoneType.InnerSouthWest:
                return category === 'main_building_structure'
                    ? this.resolveMainBuildingOffset(zone, footprint)
                    : this.resolveInnerZoneOffset(zone, footprint);

            case ZoneType.InnerSouthEast:
                return category === 'main_building_structure'
                    ? this.resolveMainBuildingOffset(zone, footprint)
                    : this.resolveInnerZoneOffset(zone, footprint);

            default:
                return { x: 0, y: 0 };
        }
    }

    private resolveMainBuildingOffset(
        zone: WorldZone,
        footprint: { widthTiles: number; heightTiles: number },
    ): { x: number; y: number } {
        return this.resolveInnerZoneOffset(zone, footprint);
    }

    private resolveInnerZoneOffset(
        zone: WorldZone,
        footprint: { widthTiles: number; heightTiles: number },
    ): { x: number; y: number } {
        const maxOffsetX = Math.max(0, zone.widthTiles - footprint.widthTiles);
        const maxOffsetY = Math.max(0, zone.heightTiles - footprint.heightTiles);

        switch (zone.type) {
            case ZoneType.InnerNorthWest:
                return { x: maxOffsetX, y: maxOffsetY };

            case ZoneType.InnerNorthEast:
                return { x: 0, y: maxOffsetY };

            case ZoneType.InnerSouthWest:
                return { x: maxOffsetX, y: 0 };

            case ZoneType.InnerSouthEast:
                return { x: 0, y: 0 };

            default:
                return {
                    x: this.clamp(maxOffsetX, 0, maxOffsetX),
                    y: this.clamp(maxOffsetY, 0, maxOffsetY),
                };
        }
    }

    private buildOffsetOptions(maxOffset: number): number[] {
        if (maxOffset <= 0) {
            return [0];
        }

        return [0, maxOffset];
    }

    private pickOffset(options: number[]): number {
        if (options.length === 1) {
            return options[0];
        }

        return options[this.randomInt(0, options.length - 1)];
    }

    private buildGreatOuterPlacements(zones: WorldZone[]): GreatOuterPlacement[] {
        const placements: GreatOuterPlacement[] = [];

        const northZones = this.sortZonesByGrid(
            zones.filter(zone => zone.type === ZoneType.NorthExterior),
            'x',
        );
        const southZones = this.sortZonesByGrid(
            zones.filter(zone => zone.type === ZoneType.SouthExterior),
            'x',
        );
        const westZones = this.sortZonesByGrid(
            zones.filter(zone => zone.type === ZoneType.WestExterior),
            'y',
        );
        const eastZones = this.sortZonesByGrid(
            zones.filter(zone => zone.type === ZoneType.EastExterior),
            'y',
        );

        for (const reservedZones of [northZones, southZones, westZones, eastZones]) {
            if (reservedZones.length !== 2) {
                continue;
            }

            placements.push({
                area: this.combineZones(reservedZones),
                reservedZones,
            });
        }

        return placements;
    }

    private combineZones(zones: WorldZone[]): PlacementArea {
        const left = Math.min(...zones.map(zone => zone.tileX));
        const top = Math.min(...zones.map(zone => zone.tileY));
        const right = Math.max(...zones.map(zone => zone.tileX + zone.widthTiles));
        const bottom = Math.max(...zones.map(zone => zone.tileY + zone.heightTiles));

        return {
            tileX: left,
            tileY: top,
            widthTiles: right - left,
            heightTiles: bottom - top,
        };
    }

    private sortZonesByGrid(
        zones: WorldZone[],
        axis: 'x' | 'y',
    ): WorldZone[] {
        return [...zones].sort((a, b) => axis === 'x'
            ? a.zoneGridX - b.zoneGridX
            : a.zoneGridY - b.zoneGridY);
    }

    private shuffle<T>(items: T[]): T[] {
        const shuffled = [...items];

        for (let index = shuffled.length - 1; index > 0; index--) {
            const swapIndex = this.randomInt(0, index);
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }

        return shuffled;
    }

    private isExteriorZone(zoneType: ZoneType): boolean {
        switch (zoneType) {
            case ZoneType.NorthExterior:
            case ZoneType.SouthExterior:
            case ZoneType.EastExterior:
            case ZoneType.WestExterior:
            case ZoneType.NorthWestCorner:
            case ZoneType.NorthEastCorner:
            case ZoneType.SouthWestCorner:
            case ZoneType.SouthEastCorner:
                return true;
            default:
                return false;
        }
    }

    private isInnerZone(zoneType: ZoneType): boolean {
        switch (zoneType) {
            case ZoneType.InnerNorthWest:
            case ZoneType.InnerNorthEast:
            case ZoneType.InnerSouthWest:
            case ZoneType.InnerSouthEast:
                return true;
            default:
                return false;
        }
    }

    private zoneKey(zone: WorldZone): string {
        return `${zone.zoneGridX}:${zone.zoneGridY}`;
    }

    private pickDoorType(
        walls: BakedStructureResult['walls'],
        prefix: 'outer_door_' | 'inner_door_',
    ): StructureWallTileType | null {
        const doorTypes = Array.from(
            new Set(
                walls
                    .map(wall => wall.type)
                    .filter((type): type is StructureWallTileType => type.startsWith(prefix)),
            ),
        );

        if (doorTypes.length === 0) {
            return null;
        }

        return doorTypes[this.randomInt(0, doorTypes.length - 1)];
    }

    private buildDoorwayOpenTiles(
        walls: BakedStructureResult['walls'],
        doorType: StructureWallTileType,
    ): TilePosition[] {
        const doorwayTiles = walls.filter(wall => wall.type === doorType);
        if (doorwayTiles.length === 0) {
            return [];
        }

        const reservedTiles = new Map<string, TilePosition>();
        const minX = Math.min(...doorwayTiles.map(tile => tile.x));
        const maxX = Math.max(...doorwayTiles.map(tile => tile.x));
        const minY = Math.min(...doorwayTiles.map(tile => tile.y));
        const maxY = Math.max(...doorwayTiles.map(tile => tile.y));
        const isHorizontal = minY === maxY;

        for (const tile of doorwayTiles) {
            this.addReservedTile(reservedTiles, tile.x, tile.y);

            if (isHorizontal) {
                this.addReservedTile(reservedTiles, tile.x, tile.y - 1);
                this.addReservedTile(reservedTiles, tile.x, tile.y + 1);
            } else {
                this.addReservedTile(reservedTiles, tile.x - 1, tile.y);
                this.addReservedTile(reservedTiles, tile.x + 1, tile.y);
            }
        }

        return Array.from(reservedTiles.values());
    }

    private addReservedTile(
        reservedTiles: Map<string, TilePosition>,
        x: number,
        y: number,
    ): void {
        reservedTiles.set(`${x}:${y}`, { x, y });
    }

    private reserveOpenTiles(
        target: Set<string>,
        tiles: TilePosition[],
    ): void {
        for (const tile of tiles) {
            target.add(`${tile.x}:${tile.y}`);
        }
    }

    private removeWallsAtReservedTiles(
        result: WorldLevelResult,
        reservedOpenTileKeys: Set<string>,
    ): void {
        if (reservedOpenTileKeys.size === 0) {
            return;
        }

        result.walls = result.walls.filter(wall =>
            !reservedOpenTileKeys.has(`${wall.x}:${wall.y}`),
        );
    }

    private randomInt(min: number, max: number): number {
        if (max <= min) return min;
        return Math.floor(this.rng.next() * (max - min + 1)) + min;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}

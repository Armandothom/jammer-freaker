import type {
  BuildingTileDefinition,
  BuildingTileType,
  PlacedBuilding,
} from "./building-types.js";
import { isBuildingDoorTileType } from "./building-types.js";
import { getBuildingLootSpawnPoints } from "./building-spawn-registry.js";
import type { BuildingName } from "./buildings-config.js";

export type BuildingInteractionFeatureKind =
  | "door"
  | "loot_spawn";

export interface BuildingInteractionFeature {
  id: string;
  kind: BuildingInteractionFeatureKind;
  buildingName: BuildingName;
  buildingInstanceId: string;
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  tileSize: number;
  tileType?: BuildingTileType;
}

export class BuildingInteractionManager {
  private tileSize = 32;
  private readonly featuresByKind = new Map<BuildingInteractionFeatureKind, BuildingInteractionFeature[]>();
  private readonly buildingInstanceIdsByTile = new Map<string, string>();
  private readonly doorFeaturesByBuildingInstanceId = new Map<string, BuildingInteractionFeature[]>();

  public rebuild(placements: PlacedBuilding[]): void {
    this.clear();
    this.tileSize = placements[0]?.tileSize ?? this.tileSize;

    for (const placement of placements) {
      this.indexPlacement(placement);
    }
  }

  public clear(): void {
    this.featuresByKind.clear();
    this.buildingInstanceIdsByTile.clear();
    this.doorFeaturesByBuildingInstanceId.clear();
  }

  public getDoors(): BuildingInteractionFeature[] {
    return this.getFeaturesByKind("door");
  }

  public getLootSpawnPoints(): BuildingInteractionFeature[] {
    return this.getFeaturesByKind("loot_spawn");
  }

  public getDoorsForBuildingAtWorldPosition(worldX: number, worldY: number): BuildingInteractionFeature[] {
    const buildingInstanceId = this.getBuildingInstanceIdAtWorldPosition(worldX, worldY);

    if (!buildingInstanceId) {
      return [];
    }

    return [...(this.doorFeaturesByBuildingInstanceId.get(buildingInstanceId) ?? [])];
  }

  public getNearestDoorForBuildingAtWorldPosition(
    worldX: number,
    worldY: number,
  ): BuildingInteractionFeature | null {
    const doors = this.getDoorsForBuildingAtWorldPosition(worldX, worldY);

    if (doors.length === 0) {
      return null;
    }

    let nearestDoor = doors[0];
    let nearestDistanceSquared = this.getDistanceSquaredToFeature(worldX, worldY, nearestDoor);

    for (let index = 1; index < doors.length; index += 1) {
      const door = doors[index];
      const distanceSquared = this.getDistanceSquaredToFeature(worldX, worldY, door);

      if (distanceSquared < nearestDistanceSquared) {
        nearestDoor = door;
        nearestDistanceSquared = distanceSquared;
      }
    }

    return nearestDoor;
  }

  private indexPlacement(placement: PlacedBuilding): void {
    const originTileX = Math.round(placement.rect.x / placement.tileSize);
    const originTileY = Math.round(placement.rect.y / placement.tileSize);
    const buildingInstanceId = this.getBuildingInstanceId(placement, originTileX, originTileY);

    for (const tile of placement.tiles) {
      this.buildingInstanceIdsByTile.set(
        this.tileKey(originTileX + tile.x, originTileY + tile.y),
        buildingInstanceId,
      );
      this.indexDoorFeature(placement, buildingInstanceId, originTileX, originTileY, tile);
    }

    this.indexLootSpawnFeatures(placement, buildingInstanceId, originTileX, originTileY);
  }

  private indexDoorFeature(
    placement: PlacedBuilding,
    buildingInstanceId: string,
    originTileX: number,
    originTileY: number,
    tile: BuildingTileDefinition,
  ): void {
    if (!isBuildingDoorTileType(tile.type)) {
      return;
    }

    this.addFeature({
      ...this.buildBaseFeature(placement, buildingInstanceId, originTileX, originTileY, tile.x, tile.y),
      id: `${buildingInstanceId}:door:${tile.x}_${tile.y}`,
      kind: "door",
      tileType: tile.type,
    });
  }

  private indexLootSpawnFeatures(
    placement: PlacedBuilding,
    buildingInstanceId: string,
    originTileX: number,
    originTileY: number,
  ): void {
    const spawnPoints = getBuildingLootSpawnPoints(
      placement.buildingName,
      placement.variationIndex,
      placement.orientation,
    );

    spawnPoints.forEach((spawnPoint, index) => {
      this.addFeature({
        ...this.buildBaseFeature(
          placement,
          buildingInstanceId,
          originTileX,
          originTileY,
          spawnPoint.x,
          spawnPoint.y,
        ),
        id: `${buildingInstanceId}:loot_spawn:${index}:${spawnPoint.x}_${spawnPoint.y}`,
        kind: "loot_spawn",
      });
    });
  }

  private buildBaseFeature(
    placement: PlacedBuilding,
    buildingInstanceId: string,
    originTileX: number,
    originTileY: number,
    localX: number,
    localY: number,
  ): Omit<BuildingInteractionFeature, "id" | "kind" | "tileType"> {
    const tileX = originTileX + localX;
    const tileY = originTileY + localY;
    const worldX = tileX * placement.tileSize + placement.tileSize / 2;
    const worldY = tileY * placement.tileSize + placement.tileSize / 2;

    return {
      buildingName: placement.buildingName,
      buildingInstanceId,
      tileX,
      tileY,
      worldX,
      worldY,
      tileSize: placement.tileSize,
    };
  }

  private getFeaturesByKind(kind: BuildingInteractionFeatureKind): BuildingInteractionFeature[] {
    return [...(this.featuresByKind.get(kind) ?? [])];
  }

  private addFeature(feature: BuildingInteractionFeature): void {
    const features = this.featuresByKind.get(feature.kind) ?? [];
    features.push(feature);
    this.featuresByKind.set(feature.kind, features);

    if (feature.kind === "door") {
      const doors = this.doorFeaturesByBuildingInstanceId.get(feature.buildingInstanceId) ?? [];
      doors.push(feature);
      this.doorFeaturesByBuildingInstanceId.set(feature.buildingInstanceId, doors);
    }
  }

  private getBuildingInstanceId(
    placement: PlacedBuilding,
    originTileX: number,
    originTileY: number,
  ): string {
    return [
      placement.buildingName,
      placement.variationId,
      placement.orientation,
      placement.plotId,
      `${originTileX}_${originTileY}`,
    ].join(":");
  }

  private getBuildingInstanceIdAtWorldPosition(worldX: number, worldY: number): string | null {
    const tileX = Math.floor(worldX / this.tileSize);
    const tileY = Math.floor(worldY / this.tileSize);

    return this.buildingInstanceIdsByTile.get(this.tileKey(tileX, tileY)) ?? null;
  }

  private getDistanceSquaredToFeature(
    worldX: number,
    worldY: number,
    feature: BuildingInteractionFeature,
  ): number {
    const deltaX = feature.worldX - worldX;
    const deltaY = feature.worldY - worldY;

    return (deltaX * deltaX) + (deltaY * deltaY);
  }

  private tileKey(tileX: number, tileY: number): string {
    return `${tileX}_${tileY}`;
  }
}

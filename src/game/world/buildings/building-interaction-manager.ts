import type {
  BuildingAssetDirection,
  BuildingAssetTileType,
  BuildingOrientation,
  BuildingTileDefinition,
  BuildingTileType,
  PlacedBuilding,
} from "./building-types.js";
import { isBuildingAssetTileType } from "./building-types.js";
import type { LootContainerType } from "../loot/loot-container-config.js";
import { getBuildingAssetDefinition } from "./building-assets.js";
import { getBuildingSpawnPoints, type BuildingSpawnKind } from "./building-spawn-registry.js";
import type { BuildingName } from "./buildings-config.js";

export type BuildingInteractionFeatureKind =
  | "door"
  | "window"
  | "asset"
  | "loot_spawn"
  | "enemy_spawn";

export interface BuildingInteractionFeature {
  id: string;
  kind: BuildingInteractionFeatureKind;
  buildingName: BuildingName;
  buildingInstanceId: string;
  variationId: string;
  variationIndex: number;
  orientation: BuildingOrientation;
  plotId: string;
  localX: number;
  localY: number;
  tileX: number;
  tileY: number;
  worldX: number;
  worldY: number;
  tileSize: number;
  tileType?: BuildingTileType;
  assetType?: BuildingAssetTileType;
  assetDirection?: BuildingAssetDirection;
  spawnKind?: BuildingSpawnKind;
  lootContainerType?: LootContainerType;
  impact?: boolean;
  interactable: boolean;
  blocksMovement: boolean;
  blocksVision: boolean;
  seeThrough: boolean;
}

export class BuildingInteractionManager {
  private tileSize = 32;
  private readonly featuresById = new Map<string, BuildingInteractionFeature>();
  private readonly featuresByTile = new Map<string, BuildingInteractionFeature[]>();
  private readonly featuresByKind = new Map<BuildingInteractionFeatureKind, BuildingInteractionFeature[]>();
  private readonly featuresByBuildingInstance = new Map<string, BuildingInteractionFeature[]>();
  private readonly placementsByTile = new Map<string, PlacedBuilding>();
  private placements: PlacedBuilding[] = [];

  public rebuild(placements: PlacedBuilding[]): void {
    this.clear();
    this.placements = [...placements];
    this.tileSize = placements[0]?.tileSize ?? this.tileSize;

    for (const placement of placements) {
      this.indexPlacement(placement);
    }
  }

  public clear(): void {
    this.featuresById.clear();
    this.featuresByTile.clear();
    this.featuresByKind.clear();
    this.featuresByBuildingInstance.clear();
    this.placementsByTile.clear();
    this.placements = [];
  }

  public getAllPlacements(): PlacedBuilding[] {
    return [...this.placements];
  }

  public getAllFeatures(): BuildingInteractionFeature[] {
    return Array.from(this.featuresById.values());
  }

  public getFeatureById(featureId: string): BuildingInteractionFeature | null {
    return this.featuresById.get(featureId) ?? null;
  }

  public getFeaturesAtTile(tileX: number, tileY: number): BuildingInteractionFeature[] {
    return [...(this.featuresByTile.get(this.tileKey(tileX, tileY)) ?? [])];
  }

  public getPlacementAtTile(tileX: number, tileY: number): PlacedBuilding | null {
    return this.placementsByTile.get(this.tileKey(tileX, tileY)) ?? null;
  }

  public getFeaturesByKind(kind: BuildingInteractionFeatureKind): BuildingInteractionFeature[] {
    return [...(this.featuresByKind.get(kind) ?? [])];
  }

  public getDoors(): BuildingInteractionFeature[] {
    return this.getFeaturesByKind("door");
  }

  public getWindows(): BuildingInteractionFeature[] {
    return this.getFeaturesByKind("window");
  }

  public getLootSpawnPoints(): BuildingInteractionFeature[] {
    return this.getFeaturesByKind("loot_spawn");
  }

  public getEnemySpawnPoints(): BuildingInteractionFeature[] {
    return this.getFeaturesByKind("enemy_spawn");
  }

  public getBuildingFeatures(buildingInstanceId: string): BuildingInteractionFeature[] {
    return [...(this.featuresByBuildingInstance.get(buildingInstanceId) ?? [])];
  }

  public getFeaturesNearTile(
    tileX: number,
    tileY: number,
    radiusTiles = 1,
    kind?: BuildingInteractionFeatureKind,
  ): BuildingInteractionFeature[] {
    const features: BuildingInteractionFeature[] = [];

    for (let y = tileY - radiusTiles; y <= tileY + radiusTiles; y++) {
      for (let x = tileX - radiusTiles; x <= tileX + radiusTiles; x++) {
        for (const feature of this.getFeaturesAtTile(x, y)) {
          if (!kind || feature.kind === kind) {
            features.push(feature);
          }
        }
      }
    }

    return features;
  }

  public getFeaturesNearWorldPosition(
    worldX: number,
    worldY: number,
    radiusTiles = 1,
    kind?: BuildingInteractionFeatureKind,
  ): BuildingInteractionFeature[] {
    return this.getFeaturesNearTile(
      Math.floor(worldX / this.tileSize),
      Math.floor(worldY / this.tileSize),
      radiusTiles,
      kind,
    );
  }

  public isSeeThroughFeatureAtTile(tileX: number, tileY: number): boolean {
    return this.getFeaturesAtTile(tileX, tileY).some((feature) => feature.seeThrough);
  }

  private indexPlacement(placement: PlacedBuilding): void {
    const originTileX = Math.round(placement.rect.x / placement.tileSize);
    const originTileY = Math.round(placement.rect.y / placement.tileSize);
    const buildingInstanceId = this.getBuildingInstanceId(placement, originTileX, originTileY);

    for (const tile of placement.tiles) {
      const tileX = originTileX + tile.x;
      const tileY = originTileY + tile.y;
      this.placementsByTile.set(this.tileKey(tileX, tileY), placement);
      this.indexTileFeature(placement, buildingInstanceId, originTileX, originTileY, tile);
    }

    this.indexSpawnFeatures(placement, buildingInstanceId, originTileX, originTileY, "loot");
    this.indexSpawnFeatures(placement, buildingInstanceId, originTileX, originTileY, "enemy");
  }

  private indexTileFeature(
    placement: PlacedBuilding,
    buildingInstanceId: string,
    originTileX: number,
    originTileY: number,
    tile: BuildingTileDefinition,
  ): void {
    if (isDoorTile(tile.type)) {
      this.addFeature({
        ...this.buildBaseFeature(placement, buildingInstanceId, originTileX, originTileY, tile.x, tile.y),
        id: `${buildingInstanceId}:door:${tile.x}_${tile.y}`,
        kind: "door",
        tileType: tile.type,
        impact: true,
        interactable: true,
        blocksMovement: true,
        blocksVision: true,
        seeThrough: false,
      });
      return;
    }

    if (tile.type === "window") {
      this.addFeature({
        ...this.buildBaseFeature(placement, buildingInstanceId, originTileX, originTileY, tile.x, tile.y),
        id: `${buildingInstanceId}:window:${tile.x}_${tile.y}`,
        kind: "window",
        tileType: tile.type,
        impact: true,
        interactable: false,
        blocksMovement: true,
        blocksVision: false,
        seeThrough: true,
      });
      return;
    }

    if (isBuildingAssetTileType(tile.type)) {
      const asset = getBuildingAssetDefinition(placement.buildingName, tile.type);

      if (!asset) {
        throw new Error(`Missing asset config for "${placement.buildingName}.${tile.type}".`);
      }

      this.addFeature({
        ...this.buildBaseFeature(placement, buildingInstanceId, originTileX, originTileY, tile.x, tile.y),
        id: `${buildingInstanceId}:asset:${tile.x}_${tile.y}`,
        kind: "asset",
        tileType: tile.type,
        assetType: tile.type,
        assetDirection: tile.assetDirection,
        impact: asset.impact,
        interactable: false,
        blocksMovement: asset.impassable,
        blocksVision: !asset.seeThrough,
        seeThrough: asset.seeThrough,
      });
    }
  }

  private indexSpawnFeatures(
    placement: PlacedBuilding,
    buildingInstanceId: string,
    originTileX: number,
    originTileY: number,
    spawnKind: BuildingSpawnKind,
  ): void {
    const spawnPoints = getBuildingSpawnPoints(
      placement.buildingName,
      placement.variationIndex,
      placement.orientation,
      spawnKind,
    );
    const kind: BuildingInteractionFeatureKind = spawnKind === "loot" ? "loot_spawn" : "enemy_spawn";
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
        id: `${buildingInstanceId}:${kind}:${index}:${spawnPoint.x}_${spawnPoint.y}`,
        kind,
        spawnKind,
        impact: false,
        interactable: false,
        blocksMovement: false,
        blocksVision: false,
        seeThrough: true,
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
  ): Omit<BuildingInteractionFeature, "id" | "kind" | "interactable" | "blocksMovement" | "blocksVision" | "seeThrough"> {
    const tileX = originTileX + localX;
    const tileY = originTileY + localY;
    const worldX = tileX * placement.tileSize + placement.tileSize / 2;
    const worldY = tileY * placement.tileSize + placement.tileSize / 2;

    return {
      buildingName: placement.buildingName,
      buildingInstanceId,
      variationId: placement.variationId,
      variationIndex: placement.variationIndex,
      orientation: placement.orientation,
      plotId: placement.plotId,
      localX,
      localY,
      tileX,
      tileY,
      worldX,
      worldY,
      tileSize: placement.tileSize,
    };
  }

  private addFeature(feature: BuildingInteractionFeature): void {
    this.featuresById.set(feature.id, feature);
    this.appendToMapList(this.featuresByTile, this.tileKey(feature.tileX, feature.tileY), feature);
    this.appendToMapList(this.featuresByKind, feature.kind, feature);
    this.appendToMapList(this.featuresByBuildingInstance, feature.buildingInstanceId, feature);
  }

  private appendToMapList<TKey>(
    map: Map<TKey, BuildingInteractionFeature[]>,
    key: TKey,
    feature: BuildingInteractionFeature,
  ): void {
    const features = map.get(key) ?? [];
    features.push(feature);
    map.set(key, features);
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

  private tileKey(tileX: number, tileY: number): string {
    return `${tileX}_${tileY}`;
  }
}

function isDoorTile(tileType: BuildingTileType): boolean {
  return tileType === "door" || tileType === "door_1" || tileType === "door_2";
}

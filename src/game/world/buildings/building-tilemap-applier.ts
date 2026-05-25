import type { WorldTilemapManager } from "../world-tilemap-manager.js";
import { getBuildingAssetDefinition, getBuildingAssetRotation } from "./building-assets.js";
import { resolveBuildingTileSprite } from "./building-sprites.js";
import {
  isBuildingAssetTileType,
  type BuildingTileDefinition,
  type BuildingTileType,
  type PlacedBuilding,
} from "./building-types.js";

const QUARTER_TURN = Math.PI / 2;
type TileTypeLookup = (x: number, y: number) => BuildingTileType | null;

export class BuildingTilemapApplier {
  constructor(
    private readonly tilemapManager: WorldTilemapManager,
  ) {}

  public apply(placements: PlacedBuilding[]): void {
    for (const placement of placements) {
      this.applyPlacement(placement);
    }

    if (placements.length > 0) {
      this.tilemapManager.refreshPoiTiles();
    }
  }

  private applyPlacement(placement: PlacedBuilding): void {
    const originTileX = Math.round(placement.rect.x / placement.tileSize);
    const originTileY = Math.round(placement.rect.y / placement.tileSize);
    const tileTypeAt = buildTileTypeLookup(placement.tiles);

    for (const tile of placement.tiles) {
      const tileX = originTileX + tile.x;
      const tileY = originTileY + tile.y;
      const sprite = resolveBuildingTileSprite(placement.buildingName, tile.type);

      if (isBuildingAssetTileType(tile.type)) {
        const asset = getBuildingAssetDefinition(placement.buildingName, tile.type);

        if (!asset) {
          throw new Error(`Missing asset config for "${placement.buildingName}.${tile.type}".`);
        }

        this.tilemapManager.setGroundTile(
          tileX,
          tileY,
          "building_floor",
          sprite.spriteName,
          sprite.spriteSheetName,
        );
        this.tilemapManager.setAssetTile(
          tileX,
          tileY,
          asset.spriteName,
          asset.spriteSheetName,
          getBuildingAssetRotation(tile.assetDirection),
          {
            impact: asset.impact,
            impassable: asset.impassable,
            seeThrough: asset.seeThrough,
          },
        );
        continue;
      }

      switch (tile.type) {
        case "floor":
          this.tilemapManager.setGroundTile(
            tileX,
            tileY,
            "building_floor",
            sprite.spriteName,
            sprite.spriteSheetName,
          );
          break;

        case "door":
        case "door_1":
        case "door_2":
          this.tilemapManager.setGroundTile(
            tileX,
            tileY,
            "building_door",
            sprite.spriteName,
            sprite.spriteSheetName,
          );
          break;

        case "window":
          this.tilemapManager.setSeeThroughWall(
            tileX,
            tileY,
            sprite.spriteName,
            sprite.spriteSheetName,
            resolveWindowSpriteRotation(tile, tileTypeAt),
          );
          break;

        case "out_of_bounds":
          this.tilemapManager.setWall(
            tileX,
            tileY,
            sprite.spriteName,
            sprite.spriteSheetName,
          );
          break;

      }
    }
  }
}

function resolveWindowSpriteRotation(
  tile: BuildingTileDefinition,
  tileTypeAt: TileTypeLookup,
): number | null {
  const hasNorthWallNeighbor = isWindowWallNeighbor(tileTypeAt(tile.x, tile.y - 1));
  const hasSouthWallNeighbor = isWindowWallNeighbor(tileTypeAt(tile.x, tile.y + 1));
  const hasWestWallNeighbor = isWindowWallNeighbor(tileTypeAt(tile.x - 1, tile.y));
  const hasEastWallNeighbor = isWindowWallNeighbor(tileTypeAt(tile.x + 1, tile.y));
  const verticalWallScore = Number(hasNorthWallNeighbor) + Number(hasSouthWallNeighbor);
  const horizontalWallScore = Number(hasWestWallNeighbor) + Number(hasEastWallNeighbor);

  if (verticalWallScore !== horizontalWallScore) {
    return verticalWallScore > horizontalWallScore ? QUARTER_TURN : null;
  }

  const hasNorthInterior = isBuildingInteriorTile(tileTypeAt(tile.x, tile.y - 1));
  const hasSouthInterior = isBuildingInteriorTile(tileTypeAt(tile.x, tile.y + 1));
  const hasWestInterior = isBuildingInteriorTile(tileTypeAt(tile.x - 1, tile.y));
  const hasEastInterior = isBuildingInteriorTile(tileTypeAt(tile.x + 1, tile.y));
  const verticalWallInteriorScore = Number(hasWestInterior) + Number(hasEastInterior);
  const horizontalWallInteriorScore = Number(hasNorthInterior) + Number(hasSouthInterior);

  return verticalWallInteriorScore > horizontalWallInteriorScore ? QUARTER_TURN : null;
}

function buildTileTypeLookup(
  tiles: BuildingTileDefinition[],
): TileTypeLookup {
  const tileTypesByCoordinate = new Map<string, BuildingTileType>();

  for (const tile of tiles) {
    tileTypesByCoordinate.set(toTileKey(tile.x, tile.y), tile.type);
  }

  return (x: number, y: number) => tileTypesByCoordinate.get(toTileKey(x, y)) ?? null;
}

function isWindowWallNeighbor(tileType: BuildingTileType | null): boolean {
  return tileType === "out_of_bounds"
    || tileType === "window"
    || tileType === "door"
    || tileType === "door_1"
    || tileType === "door_2";
}

function isBuildingInteriorTile(tileType: BuildingTileType | null): boolean {
  return tileType === "floor" || (tileType !== null && isBuildingAssetTileType(tileType));
}

function toTileKey(x: number, y: number): string {
  return `${x}_${y}`;
}

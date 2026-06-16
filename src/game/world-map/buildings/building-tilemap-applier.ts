import type { WorldTilemapManager } from "../world-tilemap-manager.js";
import { getBuildingAssetDefinition, getBuildingAssetRotation } from "./building-assets.js";
import { resolveBuildingTileSprite } from "./building-sprites.js";
import {
  getBuildingDoorPanelSide,
  isBuildingAssetTileType,
  isBuildingDoorTileType,
  type BuildingOrientation,
  type BuildingTileDefinition,
  type BuildingTileType,
  type PlacedBuilding,
} from "./building-types.js";

const QUARTER_TURN = Math.PI / 2;
const HALF_TURN = Math.PI;
type TileTypeLookup = (x: number, y: number) => BuildingTileType | null;
type DoorAxis = "horizontal" | "vertical";

interface TileSpriteTransform {
  rotation: number | null;
  mirrorX: boolean;
  mirrorY: boolean;
}

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

      if (isBuildingDoorTileType(tile.type)) {
        const doorTransform = resolveDoorSpriteTransform(
          tile,
          tileTypeAt,
          placement.orientation,
        );
        const floorSprite = resolveBuildingTileSprite(placement.buildingName, "floor");

        this.tilemapManager.setGroundTile(
          tileX,
          tileY,
          "building_door",
          floorSprite.spriteName,
          floorSprite.spriteSheetName,
        );
        this.tilemapManager.setWall(
          tileX,
          tileY,
          sprite.spriteName,
          sprite.spriteSheetName,
          doorTransform.rotation,
          doorTransform.mirrorX,
          doorTransform.mirrorY,
        );
        this.tilemapManager.setBreakableTileRenderEnabled(tileX, tileY, false);
        this.tilemapManager.setWallTileVisibilityStencilRevealEnabled(tileX, tileY, false);
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

function resolveDoorSpriteTransform(
  tile: BuildingTileDefinition,
  tileTypeAt: TileTypeLookup,
  fallbackDirection: BuildingOrientation,
): TileSpriteTransform {
  const direction = resolveDoorDirection(tile, tileTypeAt, fallbackDirection);
  const axis = resolveDoorAxis(tile, tileTypeAt);

  return {
    rotation: resolveDoorSpriteRotation(direction),
    mirrorX: shouldMirrorDoorSprite(tile, tileTypeAt, axis, direction),
    mirrorY: false,
  };
}

function resolveDoorDirection(
  tile: BuildingTileDefinition,
  tileTypeAt: TileTypeLookup,
  fallbackDirection: BuildingOrientation,
): BuildingOrientation {
  const hasNorthInterior = isBuildingInteriorTile(tileTypeAt(tile.x, tile.y - 1));
  const hasSouthInterior = isBuildingInteriorTile(tileTypeAt(tile.x, tile.y + 1));
  const hasWestInterior = isBuildingInteriorTile(tileTypeAt(tile.x - 1, tile.y));
  const hasEastInterior = isBuildingInteriorTile(tileTypeAt(tile.x + 1, tile.y));

  if (hasSouthInterior !== hasNorthInterior) {
    return hasSouthInterior ? "north" : "south";
  }

  if (hasEastInterior !== hasWestInterior) {
    return hasEastInterior ? "west" : "east";
  }

  const axis = resolveDoorAxis(tile, tileTypeAt);

  if (axis === "horizontal" && isNorthSouthDirection(fallbackDirection)) {
    return fallbackDirection;
  }

  if (axis === "vertical" && isEastWestDirection(fallbackDirection)) {
    return fallbackDirection;
  }

  return axis === "horizontal" ? "north" : "west";
}

function resolveDoorAxis(
  tile: BuildingTileDefinition,
  tileTypeAt: TileTypeLookup,
): DoorAxis {
  const verticalWallScore =
    Number(isDoorWallNeighbor(tileTypeAt(tile.x, tile.y - 1))) +
    Number(isDoorWallNeighbor(tileTypeAt(tile.x, tile.y + 1)));
  const horizontalWallScore =
    Number(isDoorWallNeighbor(tileTypeAt(tile.x - 1, tile.y))) +
    Number(isDoorWallNeighbor(tileTypeAt(tile.x + 1, tile.y)));

  if (verticalWallScore !== horizontalWallScore) {
    return verticalWallScore > horizontalWallScore ? "vertical" : "horizontal";
  }

  const hasNorthInterior = isBuildingInteriorTile(tileTypeAt(tile.x, tile.y - 1));
  const hasSouthInterior = isBuildingInteriorTile(tileTypeAt(tile.x, tile.y + 1));
  const hasWestInterior = isBuildingInteriorTile(tileTypeAt(tile.x - 1, tile.y));
  const hasEastInterior = isBuildingInteriorTile(tileTypeAt(tile.x + 1, tile.y));
  const verticalWallInteriorScore = Number(hasWestInterior) + Number(hasEastInterior);
  const horizontalWallInteriorScore = Number(hasNorthInterior) + Number(hasSouthInterior);

  return verticalWallInteriorScore > horizontalWallInteriorScore ? "vertical" : "horizontal";
}

function resolveDoorSpriteRotation(direction: BuildingOrientation): number | null {
  switch (direction) {
    case "north":
      return null;

    case "east":
      return QUARTER_TURN;

    case "south":
      return HALF_TURN;

    case "west":
      return -QUARTER_TURN;

    default: {
      const exhaustiveCheck: never = direction;
      return exhaustiveCheck;
    }
  }
}

function shouldMirrorDoorSprite(
  tile: BuildingTileDefinition,
  tileTypeAt: TileTypeLookup,
  axis: DoorAxis,
  direction: BuildingOrientation,
): boolean {
  const panelSide = getBuildingDoorPanelSide(tile.type);

  if (panelSide) {
    const mirrorRightPanel = direction === "north" || direction === "east";
    return mirrorRightPanel
      ? panelSide === "right"
      : panelSide === "left";
  }

  const doorRun = getDoorRunPosition(tile, tileTypeAt, axis);

  if (doorRun.length <= 1) {
    return false;
  }

  const isSecondHalf = doorRun.index >= Math.ceil(doorRun.length / 2);
  const mirrorSecondHalf = direction === "north" || direction === "east";

  return mirrorSecondHalf ? isSecondHalf : !isSecondHalf;
}

function getDoorRunPosition(
  tile: BuildingTileDefinition,
  tileTypeAt: TileTypeLookup,
  axis: DoorAxis,
): { index: number; length: number } {
  const deltaX = axis === "horizontal" ? 1 : 0;
  const deltaY = axis === "vertical" ? 1 : 0;
  let startX = tile.x;
  let startY = tile.y;
  let endX = tile.x;
  let endY = tile.y;

  while (isDoorTile(tileTypeAt(startX - deltaX, startY - deltaY))) {
    startX -= deltaX;
    startY -= deltaY;
  }

  while (isDoorTile(tileTypeAt(endX + deltaX, endY + deltaY))) {
    endX += deltaX;
    endY += deltaY;
  }

  return {
    index: axis === "horizontal" ? tile.x - startX : tile.y - startY,
    length: axis === "horizontal" ? endX - startX + 1 : endY - startY + 1,
  };
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
    || isDoorTile(tileType);
}

function isDoorWallNeighbor(tileType: BuildingTileType | null): boolean {
  return tileType === "out_of_bounds" || isDoorTile(tileType);
}

function isDoorTile(tileType: BuildingTileType | null): boolean {
  return isBuildingDoorTileType(tileType);
}

function isBuildingInteriorTile(tileType: BuildingTileType | null): boolean {
  return tileType === "floor" || (tileType !== null && isBuildingAssetTileType(tileType));
}

function isNorthSouthDirection(direction: BuildingOrientation): boolean {
  return direction === "north" || direction === "south";
}

function isEastWestDirection(direction: BuildingOrientation): boolean {
  return direction === "east" || direction === "west";
}

function toTileKey(x: number, y: number): string {
  return `${x}_${y}`;
}

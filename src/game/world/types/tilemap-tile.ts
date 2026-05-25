import { SpriteName } from "./sprite-name.enum.js";
import type { SpriteSheetName } from "../../asset-manager/types/sprite-sheet-name.enum.js";

export type WorldMapTerrainTileType =
  | "ground_green"
  | "map_wall_visible"
  | "map_wall_visible_north"
  | "map_wall_visible_south"
  | "map_wall_visible_west"
  | "map_wall_visible_east"
  | "map_wall_visible_corner_north_west"
  | "map_wall_visible_corner_north_east"
  | "map_wall_visible_corner_south_west"
  | "map_wall_visible_corner_south_east"
  | "out_of_bounds"
  | "plot"
  | "river"
  | "sidewalk"
  | "sidewalk_curb"
  | "sidewalk_curb_north"
  | "sidewalk_curb_south"
  | "sidewalk_curb_west"
  | "sidewalk_curb_east"
  | "sidewalk_curb_corner_north_west"
  | "sidewalk_curb_corner_north_east"
  | "sidewalk_curb_corner_south_west"
  | "sidewalk_curb_corner_south_east"
  | "sidewalk_curb_corner_single_north_west"
  | "sidewalk_curb_corner_single_north_east"
  | "sidewalk_curb_corner_single_south_west"
  | "sidewalk_curb_corner_single_south_east"
  | "street"
  | "street_middle";

export type WorldGroundTileType =
  | "ground"
  | "building_floor"
  | "building_door"
  | "player_spawn"
  | "extraction_area"
  | WorldMapTerrainTileType;

export abstract class TilemapBase {
  x!: number;
  y!: number;
  spriteName?: SpriteName;
  spriteSheetName?: SpriteSheetName;
  spriteRotation?: number | null;
}
export abstract class TilemapTile extends TilemapBase {
  spriteName!: SpriteName;
  type!: WorldGroundTileType;
}

export abstract class TilemapWallTile extends TilemapBase {
  spriteName!: SpriteName;
  solid!: boolean;
  blocksVision!: boolean;
  impact!: boolean;
}

export enum WorldPoiTileType {
  COVER = "cover"
}
export interface WorldPoiTile extends TilemapBase {
  type: WorldPoiTileType
}

export abstract class TilemapPathInformation {
  maxTilesX!: number;
  maxTilesY!: number;
  impassableTiles!: Set<string>
  tileSize!: number;
}


export abstract class WorldMapCoordinates {
  x!: number
  y!: number
}
export abstract class WorldMapTileCoordinates {
  topLeft!: WorldMapCoordinates
  topRight!: WorldMapCoordinates
  bottomLeft!: WorldMapCoordinates
  bottomRight!: WorldMapCoordinates
}
export abstract class TilemapCoordinates {
  tileX!: number
  tileY!: number
}

export type CoordinateStringfied = string; //x_y
export type CoordinateBoundariesStringfied = string; //x1_y1_x2_y2

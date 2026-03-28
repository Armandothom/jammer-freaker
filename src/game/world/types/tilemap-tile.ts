import { SpriteName } from "./sprite-name.enum.js";

export type WorldGroundTileType = "ground" | "player_spawn" | "extraction_area";

export interface TilemapTile {
  x: number;
  y: number;
  spriteName: SpriteName;
  type: WorldGroundTileType;
}

export interface WorldWallTile {
  x: number;
  y: number;
  spriteName: SpriteName;
  solid: boolean;
}

export enum WorldPoiTileType {
  COVER = "cover"
}
export interface WorldPoiTile {
  x: number;
  y: number;
}
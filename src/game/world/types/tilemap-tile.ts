import { SpriteName } from "./sprite-name.enum.js";

export type WorldGroundTileType = "ground" | "player_spawn" | "extraction_area";

export abstract class TilemapBase {
  x!: number;
  y!: number;
  spriteName?: SpriteName;
}
export abstract class TilemapTile extends TilemapBase {
  spriteName!: SpriteName;
  type!: WorldGroundTileType;
}

export abstract class TilemapWallTile extends TilemapBase {
  spriteName!: SpriteName;
  solid!: boolean;
}

export enum WorldPoiTileType {
  COVER = "cover"
}
export interface WorldPoiTile extends TilemapBase {
  type : WorldPoiTileType
}

export abstract class TilemapPathInformation {
  maxTilesX! : number;
  maxTilesY! : number;
  impassableTiles!: Map<string, TilemapWallTile>
  tileSize! : number;
}
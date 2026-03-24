import { SpriteName } from "./sprite-name.enum.js";

export type WorldGroundTileType = "ground" | "player_spawn" | "extraction_area";

export interface TilemapTile {
  x: number;
  y: number;
  spriteName: SpriteName;
  type: WorldGroundTileType;
}

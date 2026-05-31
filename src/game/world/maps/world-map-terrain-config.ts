import { SpriteName } from "../types/sprite-name.enum.js";
import type { WorldMapTerrainTileType } from "../types/tilemap-tile.js";

const QUARTER_TURN = Math.PI / 2;
const HALF_TURN = Math.PI;

const MAP_WALL_VISIBLE_TERRAIN_TYPES: WorldMapTerrainTileType[] = [
  "map_wall_visible",
  "map_wall_visible_north",
  "map_wall_visible_south",
  "map_wall_visible_west",
  "map_wall_visible_east",
  "map_wall_visible_corner_north_west",
  "map_wall_visible_corner_north_east",
  "map_wall_visible_corner_south_west",
  "map_wall_visible_corner_south_east",
];

const SIDEWALK_CURB_TERRAIN_TYPES: WorldMapTerrainTileType[] = [
  "sidewalk_curb",
  "sidewalk_curb_north",
  "sidewalk_curb_south",
  "sidewalk_curb_west",
  "sidewalk_curb_east",
  "sidewalk_curb_corner_north_west",
  "sidewalk_curb_corner_north_east",
  "sidewalk_curb_corner_south_west",
  "sidewalk_curb_corner_south_east",
  "sidewalk_curb_corner_single_north_west",
  "sidewalk_curb_corner_single_north_east",
  "sidewalk_curb_corner_single_south_west",
  "sidewalk_curb_corner_single_south_east",
];

export const WORLD_MAP_TERRAIN_TYPES: WorldMapTerrainTileType[] = [
  "ground_green",
  ...MAP_WALL_VISIBLE_TERRAIN_TYPES,
  "out_of_bounds",
  "plot",
  "river",
  "sidewalk",
  ...SIDEWALK_CURB_TERRAIN_TYPES,
  "street",
  "street_middle",
];

export const WORLD_MAP_TERRAIN_SPRITE_BY_TYPE: Partial<Record<WorldMapTerrainTileType, SpriteName>> = {
  ground_green: SpriteName.GRASS_TERRAIN,
  map_wall_visible: SpriteName.MAP_WALL_TERRAIN,
  map_wall_visible_north: SpriteName.MAP_WALL_TERRAIN,
  map_wall_visible_south: SpriteName.MAP_WALL_TERRAIN,
  map_wall_visible_west: SpriteName.MAP_WALL_TERRAIN,
  map_wall_visible_east: SpriteName.MAP_WALL_TERRAIN,
  map_wall_visible_corner_north_west: SpriteName.MAP_WALL_TERRAIN_CORNER,
  map_wall_visible_corner_north_east: SpriteName.MAP_WALL_TERRAIN_CORNER,
  map_wall_visible_corner_south_west: SpriteName.MAP_WALL_TERRAIN_CORNER,
  map_wall_visible_corner_south_east: SpriteName.MAP_WALL_TERRAIN_CORNER,
  out_of_bounds: SpriteName.OOB_TERRAIN,
  plot: SpriteName.PLOT_TERRAIN,
  river: SpriteName.WATER_TERRAIN,
  sidewalk: SpriteName.SIDEWALK_TERRAIN,
  sidewalk_curb: SpriteName.SIDEWALK_CURB_NORTH,
  sidewalk_curb_north: SpriteName.SIDEWALK_CURB_NORTH,
  sidewalk_curb_south: SpriteName.SIDEWALK_CURB_NORTH,
  sidewalk_curb_west: SpriteName.SIDEWALK_CURB_NORTH,
  sidewalk_curb_east: SpriteName.SIDEWALK_CURB_NORTH,
  sidewalk_curb_corner_north_west: SpriteName.SIDEWALK_CURB_CORNER,
  sidewalk_curb_corner_north_east: SpriteName.SIDEWALK_CURB_CORNER,
  sidewalk_curb_corner_south_west: SpriteName.SIDEWALK_CURB_CORNER,
  sidewalk_curb_corner_south_east: SpriteName.SIDEWALK_CURB_CORNER,
  sidewalk_curb_corner_single_north_west: SpriteName.SIDEWALK_CURB_CORNER_SINGLE,
  sidewalk_curb_corner_single_north_east: SpriteName.SIDEWALK_CURB_CORNER_SINGLE,
  sidewalk_curb_corner_single_south_west: SpriteName.SIDEWALK_CURB_CORNER_SINGLE,
  sidewalk_curb_corner_single_south_east: SpriteName.SIDEWALK_CURB_CORNER_SINGLE,
  street: SpriteName.STREET_TERRAIN,
  street_middle: SpriteName.STREET_TERRAIN,
};

export const WORLD_MAP_TERRAIN_ROTATION_BY_TYPE: Partial<Record<WorldMapTerrainTileType, number>> = {
  map_wall_visible: 0,
  map_wall_visible_north: 0,
  map_wall_visible_east: QUARTER_TURN,
  map_wall_visible_south: HALF_TURN,
  map_wall_visible_west: -QUARTER_TURN,
  map_wall_visible_corner_north_east: 0,
  map_wall_visible_corner_south_east: QUARTER_TURN,
  map_wall_visible_corner_south_west: HALF_TURN,
  map_wall_visible_corner_north_west: -QUARTER_TURN,
  sidewalk_curb: 0,
  sidewalk_curb_north: 0,
  sidewalk_curb_east: QUARTER_TURN,
  sidewalk_curb_south: HALF_TURN,
  sidewalk_curb_west: -QUARTER_TURN,
  sidewalk_curb_corner_north_east: 0,
  sidewalk_curb_corner_south_east: QUARTER_TURN,
  sidewalk_curb_corner_south_west: HALF_TURN,
  sidewalk_curb_corner_north_west: -QUARTER_TURN,
  sidewalk_curb_corner_single_south_east: 0,
  sidewalk_curb_corner_single_south_west: QUARTER_TURN,
  sidewalk_curb_corner_single_north_west: HALF_TURN,
  sidewalk_curb_corner_single_north_east: -QUARTER_TURN,
};

const WORLD_MAP_STREET_SPAWN_TERRAIN_TYPES = new Set<WorldMapTerrainTileType>([
  "street",
  "street_middle",
]);

export function isWorldMapTerrainTileType(value: unknown): value is WorldMapTerrainTileType {
  return typeof value === "string"
    && WORLD_MAP_TERRAIN_TYPES.indexOf(value as WorldMapTerrainTileType) !== -1;
}

export function isWorldMapTerrainTileSolid(type: WorldMapTerrainTileType): boolean {
  return type === "out_of_bounds"
    || type === "river"
    || isWorldMapTerrainTileVisibleWall(type);
}

export function isWorldMapTerrainTileVisibleWall(type: WorldMapTerrainTileType): boolean {
  return type.startsWith("map_wall_visible");
}

export function isWorldMapTerrainTileStreetSpawn(type: WorldMapTerrainTileType): boolean {
  return WORLD_MAP_STREET_SPAWN_TERRAIN_TYPES.has(type);
}

export function resolveWorldMapTerrainSpriteName(type: WorldMapTerrainTileType): SpriteName {
  const spriteName = WORLD_MAP_TERRAIN_SPRITE_BY_TYPE[type];

  if (!spriteName) {
    throw new Error(`Missing sprite mapping for terrain type "${type}".`);
  }

  return spriteName;
}

export function resolveWorldMapTerrainSpriteRotation(type: WorldMapTerrainTileType): number | null {
  return WORLD_MAP_TERRAIN_ROTATION_BY_TYPE[type] ?? null;
}

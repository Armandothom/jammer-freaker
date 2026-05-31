import {
  WORLD_MAP_IDS,
  WORLD_MAP_REGISTRY,
  WORLD_MAP_SUMMARIES,
  type WorldMapDefinition,
  type WorldMapId,
  type WorldMapSummary,
  type WorldMapTileCoordinates,
} from "./maps/world-map-registry.js";

export class WorldMapManager {
  public readonly defaultMapId: WorldMapId = WORLD_MAP_IDS[0];

  public getMap(mapId: WorldMapId): WorldMapDefinition {
    const map = WORLD_MAP_REGISTRY[mapId];

    if (!map) {
      throw new Error(`World map "${mapId}" was not found.`);
    }

    return map;
  }

  public getMapSummaries(): WorldMapSummary[] {
    return WORLD_MAP_SUMMARIES.map((map) => ({ ...map }));
  }

  public getNextMapId(currentMapId: WorldMapId): WorldMapId {
    const currentIndex = WORLD_MAP_IDS.indexOf(currentMapId);

    if (currentIndex === -1) {
      return this.defaultMapId;
    }

    return WORLD_MAP_IDS[(currentIndex + 1) % WORLD_MAP_IDS.length];
  }

  public getMapIndex(mapId: WorldMapId): number {
    return WORLD_MAP_IDS.indexOf(mapId);
  }

  public resolveMapId(mapId: string | null | undefined): WorldMapId {
    if (mapId && WORLD_MAP_REGISTRY[mapId]) {
      return mapId;
    }

    return this.defaultMapId;
  }

  public getRandomStreetSpawnTile(mapId: WorldMapId): WorldMapTileCoordinates {
    const map = this.getMap(mapId);
    const candidates = map.streetSpawnTiles.length > 0
      ? map.streetSpawnTiles
      : map.fallbackSpawnTiles;

    if (candidates.length === 0) {
      return {
        tileX: Math.floor(map.width / 2),
        tileY: Math.floor(map.height / 2),
      };
    }

    const selectedIndex = Math.floor(Math.random() * candidates.length);
    const selectedTile = candidates[selectedIndex];

    return {
      tileX: selectedTile.tileX,
      tileY: selectedTile.tileY,
    };
  }
}

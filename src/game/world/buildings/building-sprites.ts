import { SpriteSheetName } from "../../asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../types/sprite-name.enum.js";
import { isBuildingAssetTileType, type BuildingTileType } from "./building-types.js";
import { BuildingName } from "./buildings-config.js";

export interface BuildingSpriteRef {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
}

export interface BuildingSpriteSet {
  wall: BuildingSpriteRef;
  floor: BuildingSpriteRef;
  door: BuildingSpriteRef;
  window: BuildingSpriteRef;
}

export const BUILDING_SPRITES: Record<BuildingName, BuildingSpriteSet> = {
  [BuildingName.RESIDENCE]: {
    wall: {
      spriteName: SpriteName.BROWN_WALL,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.HARDWARE_STORE]: {
    wall: {
      spriteName: SpriteName.CONCRETE_WALL_2,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.CONSTRUCTION_STORE]: {
    wall: {
      spriteName: SpriteName.CONCRETE_WALL_3,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.HOSPITAL]: {
    wall: {
      spriteName: SpriteName.CLEAN_WALL_1,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.BANK]: {
    wall: {
      spriteName: SpriteName.CLEAN_WALL_2,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.KIOSK]: {
    wall: {
      spriteName: SpriteName.BEIGE_WALL,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.POLICE_STATION]: {
    wall: {
      spriteName: SpriteName.BLUE_WALL,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.POST_OFFICE]: {
    wall: {
      spriteName: SpriteName.CONCRETE_WALL_1,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.SCHOOL_BUILDING]: {
    wall: {
      spriteName: SpriteName.BROWN_WALL,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.MILITARY_CAMP]: {
    wall: {
      spriteName: SpriteName.BLUE_WALL,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },

  [BuildingName.AUTO_REPAIR_SHOP]: {
    wall: {
      spriteName: SpriteName.CONCRETE_WALL_2,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
    floor: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    door: {
      spriteName: SpriteName.SIDEWALK_TERRAIN,
      spriteSheetName: SpriteSheetName.TERRAIN,
    },
    window: {
      spriteName: SpriteName.WINDOW,
      spriteSheetName: SpriteSheetName.BUILDING_WALLS,
    },
  },
};

export function resolveBuildingTileSprite(
  buildingName: BuildingName,
  tileType: BuildingTileType,
): BuildingSpriteRef {
  const sprites = BUILDING_SPRITES[buildingName];

  if (isBuildingAssetTileType(tileType)) {
    return sprites.floor;
  }

  switch (tileType) {
    case "out_of_bounds":
      return sprites.wall;

    case "window":
      return sprites.window;

    case "door":
    case "door_1":
    case "door_2":
      return sprites.door;

    case "floor":
      return sprites.floor;
  }
}

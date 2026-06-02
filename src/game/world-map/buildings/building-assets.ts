import { SpriteSheetName } from "../../asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../types/sprite-name.enum.js";
import type { BuildingAssetDirection, BuildingAssetTileType } from "./building-types.js";
import { BuildingName } from "./buildings-config.js";

export interface BuildingAssetDefinition {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
  impact: boolean;
  impassable: boolean;
  seeThrough: boolean;
}

type BuildingAssetDefinitions = Partial<Record<BuildingAssetTileType, BuildingAssetDefinition>>;

const DEFAULT_BLOCKING_ASSET_PROPS = {
  impact: true,
  impassable: true,
  seeThrough: true,
} as const;

const DEFAULT_BLOCKING_SEETHROUGH_ASSET_PROPS = {
  impact: false,
  impassable: true,
  seeThrough: true,
} as const;

export const BUILDING_ASSETS: Partial<Record<BuildingName, BuildingAssetDefinitions>> = {
  [BuildingName.RESIDENCE]: {
    asset_1: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
    asset_2: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
    asset_3: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
  },

  [BuildingName.HARDWARE_STORE]: {
    asset_1: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
  },

  [BuildingName.KIOSK]: {
    asset_1: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
    asset_2: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
  },

  [BuildingName.SCHOOL_BUILDING]: {
    asset_1: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
    asset_2: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
    asset_3: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
    asset_4: {
      spriteName: SpriteName.BLANK,
      spriteSheetName: SpriteSheetName.BLANK,
      ...DEFAULT_BLOCKING_ASSET_PROPS,
    },
  },
};

export function getBuildingAssetDefinition(
  buildingName: BuildingName,
  assetTileType: BuildingAssetTileType,
): BuildingAssetDefinition | null {
  return BUILDING_ASSETS[buildingName]?.[assetTileType] ?? null;
}

export function getBuildingAssetRotation(assetDirection: BuildingAssetDirection | undefined): number | null {
  const direction = assetDirection ?? "E";

  switch (direction) {
    case "E":
      return null;

    case "S":
      return Math.PI / 2;

    case "W":
      return Math.PI;

    case "N":
      return -Math.PI / 2;

    default: {
      const exhaustiveCheck: never = direction;
      return exhaustiveCheck;
    }
  }
}

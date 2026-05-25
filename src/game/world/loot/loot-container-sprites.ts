import { SpriteSheetName } from "../../asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../types/sprite-name.enum.js";
import { LootContainerType } from "./loot-container-config.js";

export interface LootContainerSpriteRef {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
}

export const LOOT_CONTAINER_SPRITES: Record<LootContainerType, LootContainerSpriteRef> = {
  [LootContainerType.DRAWER]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.TOOLBOX]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.WOODEN_CRATE]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.CARD_BOX]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.MEDICAL_BAG]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.MILITARY_CRATE]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.CASH_REGISTER]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },

  [LootContainerType.VAULT]: {
    spriteName: SpriteName.WOODEN_BOX_1,
    spriteSheetName: SpriteSheetName.WOODEN_BOX,
  },
};

export function getLootContainerSprite(containerType: LootContainerType): LootContainerSpriteRef {
  return LOOT_CONTAINER_SPRITES[containerType];
}

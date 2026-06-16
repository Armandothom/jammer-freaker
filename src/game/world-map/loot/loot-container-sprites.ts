import { SpriteSheetName } from "../../asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../types/sprite-name.enum.js";
import { LootContainerType } from "./loot-container-config.js";

export interface LootContainerSpriteRef {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
}

const WOODEN_BOX_PLACEHOLDER: LootContainerSpriteRef = {
  spriteName: SpriteName.WOODEN_BOX_1,
  spriteSheetName: SpriteSheetName.WOODEN_BOX,
};

export const LOOT_CONTAINER_SPRITES: Record<LootContainerType, LootContainerSpriteRef> = {
  [LootContainerType.DRAWER]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.TOOLBOX]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.WOODEN_CRATE]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.SCHOOL_BOX]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.CARD_BOX]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.MEDICAL_BAG]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.MILITARY_CRATE]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.CASH_REGISTER]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.OFFICE_DRAWER]: WOODEN_BOX_PLACEHOLDER,

  [LootContainerType.VAULT]: WOODEN_BOX_PLACEHOLDER,
};

export function getLootContainerSprite(containerType: LootContainerType): LootContainerSpriteRef {
  return LOOT_CONTAINER_SPRITES[containerType];
}

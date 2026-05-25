import { LootContainerType } from "./loot-container-config.js";

export type LootTableItemId = string;

export interface LootTableEntry {
  itemId: LootTableItemId;
  minAmount: number;
  maxAmount: number;
  weight: number;
}

export interface LootTableDefinition {
  containerType: LootContainerType;
  entries: readonly LootTableEntry[];
}

export const LOOT_TABLES: Record<LootContainerType, LootTableDefinition> = {
  [LootContainerType.DRAWER]: {
    containerType: LootContainerType.DRAWER,
    entries: [],
  },

  [LootContainerType.TOOLBOX]: {
    containerType: LootContainerType.TOOLBOX,
    entries: [],
  },

  [LootContainerType.WOODEN_CRATE]: {
    containerType: LootContainerType.WOODEN_CRATE,
    entries: [],
  },

  [LootContainerType.CARD_BOX]: {
    containerType: LootContainerType.CARD_BOX,
    entries: [],
  },

  [LootContainerType.MEDICAL_BAG]: {
    containerType: LootContainerType.MEDICAL_BAG,
    entries: [],
  },

  [LootContainerType.MILITARY_CRATE]: {
    containerType: LootContainerType.MILITARY_CRATE,
    entries: [],
  },

  [LootContainerType.CASH_REGISTER]: {
    containerType: LootContainerType.CASH_REGISTER,
    entries: [],
  },

  [LootContainerType.VAULT]: {
    containerType: LootContainerType.VAULT,
    entries: [],
  },
};

export function getLootTable(containerType: LootContainerType): LootTableDefinition {
  return LOOT_TABLES[containerType];
}

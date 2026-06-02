export enum LootContainerType {
  DRAWER = "drawer",
  TOOLBOX = "toolbox",
  WOODEN_CRATE = "wooden_crate",
  SCHOOL_BOX = "school_box",
  CARD_BOX = "card_box",
  MEDICAL_BAG = "medical_bag",
  MILITARY_CRATE = "military_crate",
  CASH_REGISTER = "cash_register",
  OFFICE_DRAWER = "office_drawer",
  VAULT = "vault",
}

export interface LootContainerDefinition {
  type: LootContainerType;
  displayName: string;
  maxLootSlots: number;
  chanceToReroll: number;
}

export const LOOT_CONTAINER_TYPES: readonly LootContainerType[] = [
  LootContainerType.DRAWER,
  LootContainerType.SCHOOL_BOX,
  LootContainerType.TOOLBOX,
  LootContainerType.WOODEN_CRATE,
  LootContainerType.CARD_BOX,
  LootContainerType.MEDICAL_BAG,
  LootContainerType.MILITARY_CRATE,
  LootContainerType.CASH_REGISTER,
  LootContainerType.OFFICE_DRAWER,
  LootContainerType.VAULT,
];

export const LOOT_CONTAINER_DEFINITIONS: Record<LootContainerType, LootContainerDefinition> = {
  [LootContainerType.DRAWER]: {
    type: LootContainerType.DRAWER,
    displayName: "Drawer",
    maxLootSlots: 4,
    chanceToReroll: 0.75,
  },

  [LootContainerType.TOOLBOX]: {
    type: LootContainerType.TOOLBOX,
    displayName: "Toolbox",
    maxLootSlots: 4,
    chanceToReroll: 0.75,
  },

  [LootContainerType.WOODEN_CRATE]: {
    type: LootContainerType.WOODEN_CRATE,
    displayName: "Wooden Crate",
    maxLootSlots: 8,
    chanceToReroll: 0.75,
  },

  [LootContainerType.SCHOOL_BOX]: {
    type: LootContainerType.SCHOOL_BOX,
    displayName: "School Box",
    maxLootSlots: 8,
    chanceToReroll: 0.75,
  },

  [LootContainerType.CARD_BOX]: {
    type: LootContainerType.CARD_BOX,
    displayName: "Card Box",
    maxLootSlots: 8,
    chanceToReroll: 0.75,
  },

  [LootContainerType.MEDICAL_BAG]: {
    type: LootContainerType.MEDICAL_BAG,
    displayName: "Medical Bag",
    maxLootSlots: 4,
    chanceToReroll: 0.75,
  },

  [LootContainerType.MILITARY_CRATE]: {
    type: LootContainerType.MILITARY_CRATE,
    displayName: "Military Crate",
    maxLootSlots: 8,
    chanceToReroll: 0.66,
  },

  [LootContainerType.CASH_REGISTER]: {
    type: LootContainerType.CASH_REGISTER,
    displayName: "Cash Register",
    maxLootSlots: 2,
    chanceToReroll: 0.5,
  },

  [LootContainerType.OFFICE_DRAWER]: {
    type: LootContainerType.OFFICE_DRAWER,
    displayName: "Office Drawer",
    maxLootSlots: 4,
    chanceToReroll: 0.75,
  },

  [LootContainerType.VAULT]: {
    type: LootContainerType.VAULT,
    displayName: "Vault",
    maxLootSlots: 4,
    chanceToReroll: 0.5,
  },
};

export const MAX_LOOT_CONTAINER_SLOTS = LOOT_CONTAINER_TYPES.reduce((maxSlots, containerType) => {
  return Math.max(maxSlots, LOOT_CONTAINER_DEFINITIONS[containerType].maxLootSlots);
}, 0);

export function getLootContainerDefinition(containerType: LootContainerType): LootContainerDefinition {
  return LOOT_CONTAINER_DEFINITIONS[containerType];
}

export function isLootContainerType(value: unknown): value is LootContainerType {
  return typeof value === "string"
    && LOOT_CONTAINER_TYPES.indexOf(value as LootContainerType) !== -1;
}

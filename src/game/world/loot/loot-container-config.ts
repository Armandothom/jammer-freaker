export enum LootContainerType {
  DRAWER = "drawer",
  TOOLBOX = "toolbox",
  WOODEN_CRATE = "wooden_crate",
  CARD_BOX = "card_box",
  MEDICAL_BAG = "medical_bag",
  MILITARY_CRATE = "military_crate",
  CASH_REGISTER = "cash_register",
  VAULT = "vault",
}

export interface LootContainerDefinition {
  type: LootContainerType;
  displayName: string;
}

export const LOOT_CONTAINER_TYPES: readonly LootContainerType[] = [
  LootContainerType.DRAWER,
  LootContainerType.TOOLBOX,
  LootContainerType.WOODEN_CRATE,
  LootContainerType.CARD_BOX,
  LootContainerType.MEDICAL_BAG,
  LootContainerType.MILITARY_CRATE,
  LootContainerType.CASH_REGISTER,
  LootContainerType.VAULT,
];

export const LOOT_CONTAINER_DEFINITIONS: Record<LootContainerType, LootContainerDefinition> = {
  [LootContainerType.DRAWER]: {
    type: LootContainerType.DRAWER,
    displayName: "Drawer",
  },

  [LootContainerType.TOOLBOX]: {
    type: LootContainerType.TOOLBOX,
    displayName: "Toolbox",
  },

  [LootContainerType.WOODEN_CRATE]: {
    type: LootContainerType.WOODEN_CRATE,
    displayName: "Wooden Crate",
  },

  [LootContainerType.CARD_BOX]: {
    type: LootContainerType.CARD_BOX,
    displayName: "Card Box",
  },

  [LootContainerType.MEDICAL_BAG]: {
    type: LootContainerType.MEDICAL_BAG,
    displayName: "Medical Bag",
  },

  [LootContainerType.MILITARY_CRATE]: {
    type: LootContainerType.MILITARY_CRATE,
    displayName: "Military Crate",
  },

  [LootContainerType.CASH_REGISTER]: {
    type: LootContainerType.CASH_REGISTER,
    displayName: "Cash Register",
  },

  [LootContainerType.VAULT]: {
    type: LootContainerType.VAULT,
    displayName: "Vault",
  },
};

export function getLootContainerDefinition(containerType: LootContainerType): LootContainerDefinition {
  return LOOT_CONTAINER_DEFINITIONS[containerType];
}

export function isLootContainerType(value: unknown): value is LootContainerType {
  return typeof value === "string"
    && LOOT_CONTAINER_TYPES.indexOf(value as LootContainerType) !== -1;
}

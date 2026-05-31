import { BUILDING_NAMES, BuildingName } from "../buildings/buildings-config.js";
import { LootContainerType } from "./loot-container-config.js";

export interface LootContainerWeightEntry {
  containerType: LootContainerType;
  weight: number;
}

export interface BuildingLootContext {
  buildingName: BuildingName;
  containerWeights: readonly LootContainerWeightEntry[];
}

export const BUILDING_LOOT_CONTEXTS: Record<BuildingName, BuildingLootContext> = {
  [BuildingName.RESIDENCE]: {
    buildingName: BuildingName.RESIDENCE,
    containerWeights: [
      { containerType: LootContainerType.DRAWER, weight: 60 },
      { containerType: LootContainerType.TOOLBOX, weight: 25 },
      { containerType: LootContainerType.MEDICAL_BAG, weight: 15 },
    ],
  },

  [BuildingName.HARDWARE_STORE]: {
    buildingName: BuildingName.HARDWARE_STORE,
    containerWeights: [
      { containerType: LootContainerType.CARD_BOX, weight: 65 },
      { containerType: LootContainerType.CASH_REGISTER, weight: 35 },
    ],
  },

  [BuildingName.CONSTRUCTION_STORE]: {
    buildingName: BuildingName.CONSTRUCTION_STORE,
    containerWeights: [
      { containerType: LootContainerType.WOODEN_CRATE, weight: 45 },
      { containerType: LootContainerType.TOOLBOX, weight: 35 },
      { containerType: LootContainerType.CASH_REGISTER, weight: 20 },
    ],
  },

  [BuildingName.HOSPITAL]: {
    buildingName: BuildingName.HOSPITAL,
    containerWeights: [
      { containerType: LootContainerType.MEDICAL_BAG, weight: 70 },
      { containerType: LootContainerType.DRAWER, weight: 30 },
    ],
  },

  [BuildingName.BANK]: {
    buildingName: BuildingName.BANK,
    containerWeights: [
      { containerType: LootContainerType.VAULT, weight: 100 },
    ],
  },

  [BuildingName.KIOSK]: {
    buildingName: BuildingName.KIOSK,
    containerWeights: [
      { containerType: LootContainerType.CASH_REGISTER, weight: 100 },
    ],
  },

  [BuildingName.POLICE_STATION]: {
    buildingName: BuildingName.POLICE_STATION,
    containerWeights: [
      { containerType: LootContainerType.MILITARY_CRATE, weight: 65 },
      { containerType: LootContainerType.OFFICE_DRAWER, weight: 35 },
    ],
  },

  [BuildingName.POST_OFFICE]: {
    buildingName: BuildingName.POST_OFFICE,
    containerWeights: [
      { containerType: LootContainerType.OFFICE_DRAWER, weight: 100 },
    ],
  },

  [BuildingName.SCHOOL_BUILDING]: {
    buildingName: BuildingName.SCHOOL_BUILDING,
    containerWeights: [
      { containerType: LootContainerType.SCHOOL_BOX, weight: 100 },
    ],
  },

  [BuildingName.MILITARY_CAMP]: {
    buildingName: BuildingName.MILITARY_CAMP,
    containerWeights: [
      { containerType: LootContainerType.MILITARY_CRATE, weight: 100 },
    ],
  },

  [BuildingName.AUTO_REPAIR_SHOP]: {
    buildingName: BuildingName.AUTO_REPAIR_SHOP,
    containerWeights: [
      { containerType: LootContainerType.TOOLBOX, weight: 100 },
    ],
  },
};

export function getLootContainerWeightTableForBuilding(buildingName: BuildingName): LootContainerWeightEntry[] {
  return BUILDING_LOOT_CONTEXTS[buildingName].containerWeights.map((entry) => ({ ...entry }));
}

export function getLootContainerTypesForBuilding(buildingName: BuildingName): LootContainerType[] {
  return BUILDING_LOOT_CONTEXTS[buildingName].containerWeights.map((entry) => entry.containerType);
}

export function getBuildingNamesForLootContainer(containerType: LootContainerType): BuildingName[] {
  return BUILDING_NAMES.filter((buildingName) => (
    BUILDING_LOOT_CONTEXTS[buildingName].containerWeights.some((entry) => entry.containerType === containerType)
  ));
}

export function getRandomLootContainerTypeForBuilding(buildingName: BuildingName): LootContainerType | null {
  const rollableEntries = getRollableContainerWeights(buildingName);
  const totalWeight = rollableEntries.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let roll = Math.random() * totalWeight;

  for (const entry of rollableEntries) {
    if (roll < entry.weight) {
      return entry.containerType;
    }

    roll -= entry.weight;
  }

  return rollableEntries[rollableEntries.length - 1]?.containerType ?? null;
}

function getRollableContainerWeights(buildingName: BuildingName): LootContainerWeightEntry[] {
  return BUILDING_LOOT_CONTEXTS[buildingName].containerWeights.filter((entry) => (
    Number.isFinite(entry.weight) && entry.weight > 0
  ));
}

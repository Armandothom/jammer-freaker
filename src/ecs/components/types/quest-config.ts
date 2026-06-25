import { InventoryResourceType } from "./inventory-resource-type.js";
import {
    LOOT_ITEM_CATEGORY,
    type LootItemCategory,
} from "./loot-item-category.js";
import type { MiscResourceType } from "./misc-resource-type.js";
import { BuildingName } from "../../../game/world-map/buildings/buildings-config.js";

export enum QuestType {
    COLLECTOR = "collector",
    DEMOLITION = "demoltion",
    WIPE = "wipe",
    HVT = "hvt",
    FINAL = "final",
}

export const QUEST_TRADER = {
    BILL: "Bill",
    CUCKOO: "Cuckoo",
    DIGNITAS: "Dignitas",
    PORCUPINE: "Porcupine",
} as const;

export type QuestTrader = typeof QUEST_TRADER[keyof typeof QUEST_TRADER];

export type QuestCollectObjective =
    | { item: InventoryResourceType | MiscResourceType; quantity: number }
    | { category: LootItemCategory; quantity: number };

export type QuestDemolitionObjective = {
    target: BuildingName;
    quantity: number;
};

export type QuestObjective =
    | QuestCollectObjective
    | QuestDemolitionObjective
    | { target: string; quantity: number };

export type QuestReward =
    | { item: InventoryResourceType | string; quantity: number }
    | { skillUpgrade: true };

export interface QuestConfigEntry {
    trader: QuestTrader;
    title: string;
    type: QuestType;
    objectives: readonly QuestObjective[];
    bestSources: readonly string[];
    rewards: readonly QuestReward[];
    repeatable?: boolean;
}

export const QUEST_CONFIG = {
    DIGNITAS_1: {
        trader: QUEST_TRADER.DIGNITAS,
        title: "Collector 1",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.MEDICAL_SUPPLIES, quantity: 10 }],
        bestSources: ["Residence", "Hospital"],
        rewards: [
            { item: InventoryResourceType.Bandage, quantity: 5 },
            { item: InventoryResourceType.Money, quantity: 100 },
        ],
    },

    DIGNITAS_2: {
        trader: QUEST_TRADER.DIGNITAS,
        title: "Collector 2",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.MEDICAL_SUPPLIES, quantity: 10 }],
        bestSources: ["Hospital"],
        rewards: [
            { item: InventoryResourceType.Healpack, quantity: 5 },
            { item: InventoryResourceType.Money, quantity: 100 },
        ],
    },

    DIGNITAS_3: {
        trader: QUEST_TRADER.DIGNITAS,
        title: "Collector 3",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES, quantity: 5 }],
        bestSources: ["Hospital", "Police Station"],
        rewards: [
            { item: InventoryResourceType.Epipen, quantity: 3 },
            { item: InventoryResourceType.Money, quantity: 100 },
        ],
    },

    DIGNITAS_4: {
        trader: QUEST_TRADER.DIGNITAS,
        title: "Demolition",
        type: QuestType.DEMOLITION,
        objectives: [{ target: BuildingName.HOSPITAL, quantity: 1 }],
        bestSources: ["Hospital"],
        rewards: [
            { item: InventoryResourceType.Epipen, quantity: 3 },
            { item: InventoryResourceType.CombatStim, quantity: 3 },
            { item: InventoryResourceType.Bandage, quantity: 3 },
            { item: InventoryResourceType.Healpack, quantity: 3 },
        ],
    },

    DIGNITAS_5: {
        trader: QUEST_TRADER.DIGNITAS,
        title: "HVT",
        type: QuestType.HVT,
        objectives: [{ target: "Hospital Boss", quantity: 1 }],
        bestSources: ["Hospital"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    DIGNITAS_6: {
        trader: QUEST_TRADER.DIGNITAS,
        title: "Final",
        type: QuestType.FINAL,
        objectives: [],
        bestSources: [],
        rewards: [],
    },

    BILL_1: {
        trader: QUEST_TRADER.BILL,
        title: "Collector 1",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES, quantity: 10 }],
        bestSources: ["Residence", "Police Station", "Post Office"],
        rewards: [
            { item: InventoryResourceType.Money, quantity: 100 },
            { item: "Weapon Parts", quantity: 3 },
            { item: InventoryResourceType.Grenade, quantity: 3 },
        ],
    },

    BILL_2: {
        trader: QUEST_TRADER.BILL,
        title: "Collector 2",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES, quantity: 1 }],
        bestSources: ["Post Office", "Police Station"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    BILL_3: {
        trader: QUEST_TRADER.BILL,
        title: "Demolition",
        type: QuestType.DEMOLITION,
        objectives: [{ target: BuildingName.RESIDENCE, quantity: 5 }],
        bestSources: ["Residential"],
        rewards: [
            { item: "Weapon Parts", quantity: 3 },
            { item: "Each Mag", quantity: 3 },
        ],
    },

    BILL_4: {
        trader: QUEST_TRADER.BILL,
        title: "Collector 3",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES, quantity: 5 }],
        bestSources: ["Many"],
        rewards: [
            { item: InventoryResourceType.Money, quantity: 100 },
            { item: "Weapon Parts", quantity: 5 },
            { item: InventoryResourceType.Grenade, quantity: 5 },
        ],
    },

    BILL_5: {
        trader: QUEST_TRADER.BILL,
        title: "HVT",
        type: QuestType.HVT,
        objectives: [{ target: "Police Station Boss", quantity: 1 }],
        bestSources: ["Police Station"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    BILL_6: {
        trader: QUEST_TRADER.BILL,
        title: "Final",
        type: QuestType.FINAL,
        objectives: [],
        bestSources: [],
        rewards: [],
    },

    PORCUPINE_1: {
        trader: QUEST_TRADER.PORCUPINE,
        title: "Wipe 1",
        type: QuestType.WIPE,
        objectives: [{ target: "Enemy", quantity: 20 }],
        bestSources: ["All"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    PORCUPINE_2: {
        trader: QUEST_TRADER.PORCUPINE,
        title: "Collector 1",
        type: QuestType.COLLECTOR,
        objectives: [{ category: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES, quantity: 10 }],
        bestSources: ["Construction Store"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    PORCUPINE_3: {
        trader: QUEST_TRADER.PORCUPINE,
        title: "Wipe 2",
        type: QuestType.WIPE,
        objectives: [{ target: "Enemy", quantity: 50 }],
        bestSources: ["All"],
        rewards: [
            { item: InventoryResourceType.Money, quantity: 100 },
            { skillUpgrade: true },
        ],
    },

    PORCUPINE_4: {
        trader: QUEST_TRADER.PORCUPINE,
        title: "HVT",
        type: QuestType.HVT,
        objectives: [{ target: "Military Camp Boss", quantity: 1 }],
        bestSources: ["Military Camp"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    PORCUPINE_5: {
        trader: QUEST_TRADER.PORCUPINE,
        title: "Final",
        type: QuestType.FINAL,
        objectives: [],
        bestSources: [],
        rewards: [],
    },

    CUCKOO_1: {
        trader: QUEST_TRADER.CUCKOO,
        title: "Collector 1",
        type: QuestType.COLLECTOR,
        repeatable: true,
        objectives: [{ category: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES, quantity: 10 }],
        bestSources: ["Residence", "Construction Store"],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    CUCKOO_2: {
        trader: QUEST_TRADER.CUCKOO,
        title: "Collector 2",
        type: QuestType.COLLECTOR,
        repeatable: true,
        objectives: [{ category: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES, quantity: 5 }],
        bestSources: [],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    CUCKOO_3: {
        trader: QUEST_TRADER.CUCKOO,
        title: "Collector 3",
        type: QuestType.COLLECTOR,
        repeatable: true,
        objectives: [{ category: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES, quantity: 10 }],
        bestSources: [],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    CUCKOO_4: {
        trader: QUEST_TRADER.CUCKOO,
        title: "Collector 4",
        type: QuestType.COLLECTOR,
        repeatable: true,
        objectives: [{ category: LOOT_ITEM_CATEGORY.GENERAL_SUPPLIES, quantity: 5 }],
        bestSources: [],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },

    CUCKOO_5: {
        trader: QUEST_TRADER.CUCKOO,
        title: "Collector 5",
        type: QuestType.COLLECTOR,
        repeatable: true,
        objectives: [{ category: LOOT_ITEM_CATEGORY.CONSTRUCTION_SUPPLIES, quantity: 10 }],
        bestSources: [],
        rewards: [{ item: InventoryResourceType.Money, quantity: 100 }],
    },
} as const satisfies Record<string, QuestConfigEntry>;

export type QuestId = keyof typeof QUEST_CONFIG;

export const QUEST_TRADER_QUEST_IDS: Record<QuestTrader, readonly QuestId[]> = {
    [QUEST_TRADER.BILL]: [
        "BILL_1",
        "BILL_2",
        "BILL_3",
        "BILL_4",
        "BILL_5",
        "BILL_6",
    ],
    [QUEST_TRADER.CUCKOO]: [
        "CUCKOO_1",
        "CUCKOO_2",
        "CUCKOO_3",
        "CUCKOO_4",
        "CUCKOO_5",
    ],
    [QUEST_TRADER.DIGNITAS]: [
        "DIGNITAS_1",
        "DIGNITAS_2",
        "DIGNITAS_3",
        "DIGNITAS_4",
        "DIGNITAS_5",
        "DIGNITAS_6",
    ],
    [QUEST_TRADER.PORCUPINE]: [
        "PORCUPINE_1",
        "PORCUPINE_2",
        "PORCUPINE_3",
        "PORCUPINE_4",
        "PORCUPINE_5",
    ],
};

export function isQuestTrader(value: unknown): value is QuestTrader {
    return value === QUEST_TRADER.BILL
        || value === QUEST_TRADER.CUCKOO
        || value === QUEST_TRADER.DIGNITAS
        || value === QUEST_TRADER.PORCUPINE;
}

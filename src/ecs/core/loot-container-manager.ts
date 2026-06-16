import { BuildingInteractionManager } from "../../game/world-map/buildings/building-interaction-manager.js";
import { getRandomLootContainerTypeForBuilding } from "../../game/world-map/loot/building-loot-contexts.js";
import { getLootContainerDefinition, LootContainerType } from "../../game/world-map/loot/loot-container-config.js";
import { getLootContainerSprite } from "../../game/world-map/loot/loot-container-sprites.js";
import { getLootTable, type LootTableEntry } from "../../game/world-map/loot/loot-tables.js";
import {
    LootContainerContentComponent,
    type LootContainerLootSlot,
} from "../components/loot-container-content.component.js";
import { EntityFactory } from "../entities/entity-factory.js";

const SPAWN_CHANCE = 0.5;

export class LootContainerManager {
    private readonly spawnedLootSpawnPointIds = new Set<string>();
    private readonly spawnedContainerEntityIds = new Set<number>();

    constructor(
        private buildingManager: BuildingInteractionManager,
        private entityFactory: EntityFactory,
    ) {

    }

    create(): void {
        const lootSpawnPoints = this.buildingManager.getLootSpawnPoints();

        for (const lootSpawnPoint of lootSpawnPoints) {
            if (this.spawnedLootSpawnPointIds.has(lootSpawnPoint.id)) continue;

            this.spawnedLootSpawnPointIds.add(lootSpawnPoint.id);

            if (!this.rollSpawnChance()) continue;

            const lootContainerType = getRandomLootContainerTypeForBuilding(lootSpawnPoint.buildingName);

            if (!lootContainerType) continue;

            const lootContainerSprite = getLootContainerSprite(lootContainerType);
            const lootContainerContent = this.rollContainerLoot(lootContainerType);
            const startX = lootSpawnPoint.worldX - lootSpawnPoint.tileSize / 2;
            const startY = lootSpawnPoint.worldY - lootSpawnPoint.tileSize / 2;
            const entityId = this.entityFactory.createLootContainer(
                startX,
                startY,
                lootContainerSprite.spriteName,
                lootContainerSprite.spriteSheetName,
                lootContainerType,
                lootContainerContent,
                lootSpawnPoint.tileX,
                lootSpawnPoint.tileY,
            );

            this.spawnedContainerEntityIds.add(entityId);
        }
    }

    rollContainerLoot(lootContainerType: LootContainerType): LootContainerContentComponent {
        const lootContainerDefinition = getLootContainerDefinition(lootContainerType);
        const lootSlots: LootContainerLootSlot[] = [];

        for (let slotIndex = 0; slotIndex < lootContainerDefinition.maxLootSlots; slotIndex++) {
            if (slotIndex > 0 && !this.rollRerollChance(lootContainerDefinition.chanceToReroll)) {
                break;
            }

            const lootSlot = this.rollLootSlot(lootContainerType);

            if (!lootSlot) {
                break;
            }

            lootSlots.push(lootSlot);
        }

        return new LootContainerContentComponent(
            lootSlots,
            lootContainerDefinition.maxLootSlots,
        );
    }

    reset(): void {
        for (const entityId of this.spawnedContainerEntityIds) {
            this.entityFactory.destroyLootContainer(entityId);
        }

        this.spawnedLootSpawnPointIds.clear();
        this.spawnedContainerEntityIds.clear();
    }

    private rollSpawnChance(): boolean {
        return Math.random() < SPAWN_CHANCE;
    }

    private rollRerollChance(chanceToReroll: number): boolean {
        return Math.random() < chanceToReroll;
    }

    private rollLootSlot(lootContainerType: LootContainerType): LootContainerLootSlot | null {
        const lootTable = getLootTable(lootContainerType);
        const lootEntry = this.rollLootTableEntry(lootTable.entries);

        if (!lootEntry) {
            return null;
        }

        return {
            itemId: lootEntry.itemId,
            amount: this.rollLootAmount(lootEntry),
        };
    }

    private rollLootTableEntry(entries: readonly LootTableEntry[]): LootTableEntry | null {
        const totalWeight = entries.reduce((sum, entry) => {
            return entry.weight > 0 ? sum + entry.weight : sum;
        }, 0);

        if (totalWeight <= 0) {
            return null;
        }

        let roll = Math.random() * totalWeight;

        for (const entry of entries) {
            if (entry.weight <= 0) {
                continue;
            }

            roll -= entry.weight;

            if (roll < 0) {
                return entry;
            }
        }

        return entries.find((entry) => entry.weight > 0) ?? null;
    }

    private rollLootAmount(lootEntry: LootTableEntry): number {
        const minAmount = Math.ceil(lootEntry.minAmount);
        const maxAmount = Math.floor(lootEntry.maxAmount);
        const normalizedMaxAmount = Math.max(minAmount, maxAmount);

        return minAmount + Math.floor(Math.random() * (normalizedMaxAmount - minAmount + 1));
    }
}

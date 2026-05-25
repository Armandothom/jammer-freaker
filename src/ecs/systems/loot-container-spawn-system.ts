import { BuildingInteractionManager } from "../../game/world/buildings/building-interaction-manager.js";
import { getRandomLootContainerTypeForBuilding } from "../../game/world/loot/building-loot-contexts.js";
import { getLootContainerSprite } from "../../game/world/loot/loot-container-sprites.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

const SPAWN_CHANCE = 0.5;

export class LootContainerSpawnSystem implements ISystem {
    private readonly spawnedLootSpawnPointIds = new Set<string>();
    private readonly spawnedContainerEntityIds = new Set<number>();

    constructor(
        private buildingManager: BuildingInteractionManager,
        private entityFactory: EntityFactory,
    ) {

    }

    update(deltaTime: number): void {
        const lootSpawnPoints = this.buildingManager.getLootSpawnPoints();

        for (const lootSpawnPoint of lootSpawnPoints) {
            if (this.spawnedLootSpawnPointIds.has(lootSpawnPoint.id)) continue;

            this.spawnedLootSpawnPointIds.add(lootSpawnPoint.id);

            if (!this.rollSpawnChance()) continue;

            const lootContainerType = getRandomLootContainerTypeForBuilding(lootSpawnPoint.buildingName);

            if (!lootContainerType) continue;

            const lootContainerSprite = getLootContainerSprite(lootContainerType);
            const startX = lootSpawnPoint.worldX - lootSpawnPoint.tileSize / 2;
            const startY = lootSpawnPoint.worldY - lootSpawnPoint.tileSize / 2;
            const entityId = this.entityFactory.createLootContainer(
                startX,
                startY,
                lootContainerSprite.spriteName,
                lootContainerSprite.spriteSheetName,
                lootContainerType,
            );

            this.spawnedContainerEntityIds.add(entityId);
        }
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
}

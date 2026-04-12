import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { ComponentStore } from "../core/component-store.js";
import { InventoryManager } from "../core/inventory-manager.js";
import { LevelEndReason, LevelManager } from "../core/level-manager.js";

export class LevelUpdateSystem {
    private levelTime = 0;
    private levelCompleted = false;
    private deadEnemiesAtLevelStart = 0;
    private moneyAtLevelStart = 0;
    private trackedLevelBuildId = -1;

    constructor(
        private levelManager: LevelManager,
        private inventoryManager: InventoryManager,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
    ) {
    }

    public update(deltaTime: number): void {
        this.resetTrackingIfNeeded();

        if (this.levelManager.getCurrentLevelEndReason() != null) {
            return;
        }

        this.levelTime += deltaTime;

        if (this.levelManager.levelUpdatePending) {
            this.levelCompleted = true;
            this.levelManager.levelUpdatePending = false;
        }

        if (!this.levelCompleted) {
            return;
        }

        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        if (playerEntityId == null) {
            this.levelCompleted = false;
            return;
        }

        const inventory = this.inventoryComponentStore.getOrNull(playerEntityId);
        if (!inventory) {
            this.levelCompleted = false;
            return;
        }

        const totalEnemiesKilled = Math.max(
            0,
            this.enemyDeadComponentStore.getAllEntities().length - this.deadEnemiesAtLevelStart,
        );

        const currentMoney = this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);
        const extraMoney = 0

        this.levelManager.levelStats = {
            time: this.formatLevelTime(),
            enemiesKilled: totalEnemiesKilled,
            currentMoney,
            extraMoney,
        };
        this.levelCompleted = false;
        this.levelManager.endCurrentLevel(LevelEndReason.Victory);
    }

    private resetTrackingIfNeeded(): void {
        if (this.trackedLevelBuildId === this.levelManager.levelBuildId) {
            return;
        }

        this.trackedLevelBuildId = this.levelManager.levelBuildId;
        this.levelTime = 0;
        this.levelCompleted = false;
        this.deadEnemiesAtLevelStart = this.enemyDeadComponentStore.getAllEntities().length;
        this.moneyAtLevelStart = this.readCurrentMoney();
    }

    private readCurrentMoney(): number {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        if (playerEntityId == null) {
            return 0;
        }

        const inventory = this.inventoryComponentStore.getOrNull(playerEntityId);
        if (!inventory) {
            return 0;
        }

        return this.inventoryManager.getResourceAmount(inventory, InventoryResourceType.Money);
    }

    private pad2(value: number): string {
        return value < 10 ? '0' + value : '' + value;
    }

    private pad3(value: number): string {
        if (value < 10) return '00' + value;
        if (value < 100) return '0' + value;
        return '' + value;
    }

    private formatLevelTime(): string {
        const totalMs = Math.floor(this.levelTime * 1000);

        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const milliseconds = totalMs % 1000;

        return `${this.pad2(minutes)}:${this.pad2(seconds)}:${this.pad3(milliseconds)}`;
    }
}

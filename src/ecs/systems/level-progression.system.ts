import { ISystem } from "./system.interface.js";
import { LevelManager } from "../core/level-manager.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { ComponentStore } from "../core/component-store.js";

export class LevelProgressionSystem implements ISystem {
    private timeInLevel = 0;
    private totalKillsToProgress = 5;

    constructor(
        private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent>,
        private levelManager: LevelManager,
    ) {
    }

    update(deltaTime: number): void {
        const enemiesKilledReference = this.enemiesKilledComponentStore.getAllEntities();
        const totalEnemiesKilled = enemiesKilledReference.length;
        const levelTimeInSeconds = 60;
        const enemyKillIncrease = 5;

        this.timeInLevel += deltaTime;
        const previousTime = this.timeInLevel - deltaTime;

        const shouldUpdateLevelByTime =
            previousTime < levelTimeInSeconds &&
            this.timeInLevel >= levelTimeInSeconds &&
            totalEnemiesKilled >= this.totalKillsToProgress / 2;

        if (shouldUpdateLevelByTime) {
            this.timeInLevel = 0;
            //console.log("Level update");
            this.totalKillsToProgress += enemyKillIncrease + totalEnemiesKilled;
            this.levelManager.levelUpdatePending = true;
        }

        if (totalEnemiesKilled == this.totalKillsToProgress) {
            this.timeInLevel = 0;
            //console.log("Level update");
            this.totalKillsToProgress += enemyKillIncrease + totalEnemiesKilled;
            this.levelManager.levelUpdatePending = true;
        }
    }
}
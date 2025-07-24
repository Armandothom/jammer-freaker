import { ISystem } from "./system.interface.js";
import { LevelManager } from "../core/level-manager.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { ComponentStore } from "../core/component-store.js";

export class LevelProgressionSystem implements ISystem {
    private timeInLevel = 0;
    private totalKillsToProgress = 10;

    constructor(
        private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent>,
        private levelManager: LevelManager,
    ) {

    }

    update(deltaTime: number): void {
        const enemiesKilledReference = this.enemiesKilledComponentStore.getAllEntities();
        const totalEnemiesKilled = enemiesKilledReference.length;
        const levelTimeInSeconds = 1;
        const enemyKillIncrease = 10;

        this.timeInLevel += deltaTime;
        const previousTime = this.timeInLevel - deltaTime;

        //&& totalEnemiesKilled >= this.totalKillsToProgress / 2
        if (previousTime < levelTimeInSeconds && this.timeInLevel >= levelTimeInSeconds) {
            this.timeInLevel = -9999;
            console.log("Level update");
            this.levelManager.update();
        }

        if (totalEnemiesKilled == this.totalKillsToProgress) {
            this.timeInLevel = 0;
            this.totalKillsToProgress += enemyKillIncrease;
            this.levelManager.update();
        }
    }
}
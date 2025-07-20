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
        const levelTimeInSeconds = 120;
        const enemyKillIncrease = 10;

        this.timeInLevel += deltaTime;
        const previousTime = this.timeInLevel - deltaTime;

        if (previousTime < levelTimeInSeconds && this.timeInLevel >= levelTimeInSeconds && totalEnemiesKilled >= this.totalKillsToProgress / 2) {
            this.timeInLevel = 0;
            this.totalKillsToProgress += enemyKillIncrease;
            console.log("Level update");
            console.log(totalEnemiesKilled, enemyKillIncrease);
            this.levelManager.update();
        }

        if (totalEnemiesKilled == this.totalKillsToProgress) {
            this.timeInLevel = 0;
            this.totalKillsToProgress += enemyKillIncrease;
            this.levelManager.update();
        }
    }
}
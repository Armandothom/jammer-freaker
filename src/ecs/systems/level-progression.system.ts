import { ISystem } from "./system.interface.js";
import { LevelManager } from "../core/level-manager.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { ComponentStore } from "../core/component-store.js";

export class LevelProgressionSystem implements ISystem {
    private timeInLevel = 0;
    private totalKillsToProgress = 1;

    constructor(
        private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent>,
        private levelManager: LevelManager,
    ) {
    }

    update(deltaTime: number): void {
        const enemiesKilledReference = this.enemiesKilledComponentStore.getAllEntities();
        const totalEnemiesKilled = enemiesKilledReference.length;
        //console.log(totalEnemiesKilled, this.timeInLevel);
        const levelTimeInSeconds = 5;
        const enemyKillIncrease = 10;

        this.timeInLevel += deltaTime;
        const previousTime = this.timeInLevel - deltaTime;

        const shouldUpdateLevelByTime =
            previousTime < levelTimeInSeconds && 
            this.timeInLevel >= levelTimeInSeconds && 
            totalEnemiesKilled >= this.totalKillsToProgress;

        if (shouldUpdateLevelByTime) {
            this.timeInLevel = 0;
            //console.log("Level update");
            this.totalKillsToProgress += enemyKillIncrease;
            this.levelManager.levelUpdatePending = true;
        }

        if (totalEnemiesKilled == this.totalKillsToProgress) {
            this.timeInLevel = 0;
            //console.log("Level update");
            this.totalKillsToProgress += enemyKillIncrease;
            this.levelManager.levelUpdatePending = true;
        }
    }
}
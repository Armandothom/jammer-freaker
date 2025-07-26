import { LevelManager } from "../core/level-manager.js";

export class LevelUpdateSystem {
    constructor(
        private levelManager: LevelManager
    ) {
    }

    public async update(): Promise<void> {
        if (this.levelManager.levelUpdatePending) {
            this.levelManager.levelUpdatePending = false;
            await this.levelManager.update(); // agora sim, com await, sleep, som etc
        }
    }
}
import { EnemyType } from "../components/types/enemy-type.js";
import { ComponentStore } from "./component-store.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { sleep } from "../../utils/sleep.js";
import { EnemyLifecicleSystem } from "../systems/enemy-lifecicle.system.js";

export type EnemyInitialSpawn = { name: string; quantity: number }[];

export class LevelManager {
    public previousLevel = 0;
    public levelNumber: number;
    public levelUpdatePending = false;
    public zoomProgressionFactor: number;
    public tileProgressionFactor: number;

    constructor(
        private enemyLifecicleSystem: EnemyLifecicleSystem,
        private tilemapManager: WorldTilemapManager,
        private cameraManager: CameraManager,
    ) {
        this.levelNumber = this.previousLevel;
        this.zoomProgressionFactor = 2;
        this.tileProgressionFactor = 4;
    }
    async update() {
        this.previousLevel = this.levelNumber;
        const newLevel = this.previousLevel + 1;
        this.levelNumber = newLevel;

        console.log("Level Number", this.levelNumber);

        if (this.levelNumber >= 0 && this.levelNumber <= 8) {
            await this.enemyLifecicleSystem.levelUpdate(this.levelInitialEnemies(), this.levelNumber);
            if (this.levelNumber > 1) {
                this.cameraManager.viewportXAxisTiles = 10 + (this.tileProgressionFactor) * this.levelNumber;
                this.cameraManager.viewportYAxisTiles = 10 + (this.tileProgressionFactor) * this.levelNumber;
                this.tilemapManager._maxNumberTilesX = 10 + (this.tileProgressionFactor) * this.levelNumber;
                this.tilemapManager._maxNumberTilesY = 10 + (this.tileProgressionFactor) * this.levelNumber;


                this.cameraManager.getViewport();
                this.tilemapManager.generateTilemap();

                this.zoomProgressionFactor = 2 - (1.5 / 8) * this.levelNumber;
            }
        }
    }

    public levelInitialEnemies(): { name: string; quantity: number }[] {
        return [
            { name: EnemyType.SOLDIER, quantity: 4 * this.levelNumber },
            { name: EnemyType.SNIPER, quantity: 2 * this.levelNumber - 1 },
            { name: EnemyType.JUGG, quantity: this.levelNumber >= 3 ? (this.levelNumber - 2) : 0 },
            { name: EnemyType.KAMIKAZE, quantity: this.levelNumber >= 3 ? (this.levelNumber - 2) : 0 },
            { name: EnemyType.BOMBER, quantity: this.levelNumber >= 3 ? (this.levelNumber - 2) : 0 },
        ]
    }
}
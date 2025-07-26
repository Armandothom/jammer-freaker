import { EnemyType } from "../components/types/enemy-type.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemySpawnSystem } from "../systems/enemy-spawn.system.js";
import { sleep } from "../../utils/sleep.js";
import { ComponentStore } from "./component-store.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";

export type EnemyInitialSpawn = { name: string; quantity: number };

export class LevelManager {
    public previousLevel = 0;
    private levelNumber: number;
    public zoomProgressionFactor: number;
    public tileProgressionFactor: number;

    constructor(
        private enemySpawnSystem: EnemySpawnSystem,
        private entityFactory: EntityFactory,
        private soundManager: SoundManager,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private tilemapManager: WorldTilemapManager,
        private cameraManager: CameraManager,
    ) {
        this.levelNumber = this.previousLevel + 1;
        this.zoomProgressionFactor = 2;
        this.tileProgressionFactor = 4;
    }
    async update() {
        const newLevel = this.previousLevel + 1;
        this.previousLevel = newLevel;
        this.levelNumber = newLevel;

        console.log("Level Number", this.levelNumber);

        //Kill all enemies and Spawn new ones

        if (this.levelNumber > 1) {
            this.killAllEnemies();
            await sleep(10);
        }

        const initialEnemiesTable = this.levelInitialEnemies(this.levelNumber);

        this.enemySpawnSystem.initialEnemiesSpawn(initialEnemiesTable);
        //console.log("Level Progredido:", levelNumber);
        //const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!
        this.levelNumber = 2;

        if (this.levelNumber >= 0 && this.levelNumber <= 8) {
            this.cameraManager.viewportXAxisTiles = 10 + (this.tileProgressionFactor) * this.levelNumber;
            this.cameraManager.viewportYAxisTiles = 10 + (this.tileProgressionFactor) * this.levelNumber;
            this.tilemapManager._maxNumberTilesX = 10 + (this.tileProgressionFactor) * this.levelNumber;
            this.tilemapManager._maxNumberTilesY = 10 + (this.tileProgressionFactor) * this.levelNumber;

            this.cameraManager.getViewport();
            this.tilemapManager.generateTilemap();

            this.zoomProgressionFactor = 2 - (1.5 / 8) * this.levelNumber;
            console.log("zoomProg levelManager", this.zoomProgressionFactor);
        }
    }

    levelInitialEnemies(level: number): { name: EnemyType, quantity: number }[] {
        return [
            { name: EnemyType.SOLDIER, quantity: 4 * this.levelNumber },
            { name: EnemyType.SNIPER, quantity: 2 * this.levelNumber - 1 },
            { name: EnemyType.JUGG, quantity: level >= 3 ? (this.levelNumber - 2) : 0 },
            { name: EnemyType.KAMIKAZE, quantity: level >= 3 ? (this.levelNumber - 2) : 0 },
            { name: EnemyType.BOMBER, quantity: level >= 3 ? (this.levelNumber - 2) : 0 },
        ]
    }

    async killAllEnemies() {

        console.log("killallenemies call");
        const enemyEntities = this.enemyComponentStore.getAllEntities();
        this.soundManager.playSound("A10_BARRAGE");

        await sleep(2);
        for (const enemyEntity of enemyEntities) {
            this.entityFactory.destroyEnemy(enemyEntity);
        }

        return;
    }
}
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldLevelResult } from "../../game/world/types/world-level-result.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { EnemyLifecicleSystem } from "../systems/enemy-lifecicle.system.js";
import { ZoneFactory } from "../zones/zone-factory.js";

export class LevelManager {
    public previousLevel = 0;
    public levelNumber: number;
    public levelUpdatePending = false;

    constructor(
        private enemyLifecicleSystem: EnemyLifecicleSystem,
        private tilemapManager: WorldTilemapManager,
        private cameraManager: CameraManager,
        private zoneFactory: ZoneFactory,
    ) {
        this.levelNumber = this.previousLevel;
    }

    async update(): Promise<void> {
        this.previousLevel = this.levelNumber;
        this.levelNumber = this.previousLevel + 1;

        this.rebuildLevel();
    }

    private rebuildLevel(): void {
        this.endCurrentLevel();

        const levelResult = this.zoneFactory.generateLevel({
            levelNumber: this.levelNumber,
            zones: this.tilemapManager.zones,
        });

        this.applyLevelResult(levelResult);

        this.finalizeLevelBuild();
    }

    private applyLevelResult(levelResult: WorldLevelResult): void {
        this.tilemapManager.applyWorldLevelResult(levelResult);

    }

    private endCurrentLevel(): void {
        this.tilemapManager.clearLevelGeometry();

    }

    private finalizeLevelBuild(): void {
    }
}
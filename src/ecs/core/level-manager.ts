
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";

export class LevelManager {
    public previousLevel = 0;
    private levelNumber: number;
    public zoomProgressionFactor: number;
    public tileProgressionFactor: number;
    constructor(
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

        //const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!
        this.levelNumber = 5;

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
}
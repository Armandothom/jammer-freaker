
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

        if (this.levelNumber >= 0 && this.levelNumber <= 8) {
        this.cameraManager.viewportXAxisTiles += this.tileProgressionFactor;
        this.cameraManager.viewportYAxisTiles += this.tileProgressionFactor;
        this.tilemapManager._maxNumberTilesX += this.tileProgressionFactor;
        this.tilemapManager._maxNumberTilesY += this.tileProgressionFactor;

        this.cameraManager.getViewport();
        this.tilemapManager.generateTilemap();

        
            this.zoomProgressionFactor = this.zoomProgressionFactor * (1 - 1 / 6);
        }
    }
}
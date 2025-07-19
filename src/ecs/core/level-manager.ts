export class LevelManager {
    public previousLevel = 0;
    public initialSpriteSize = 80;
    public initialBulletSize = 24;
    public initialTiles = 8;
    private levelNumber: number;
    public zoomProgressionFactor: number;
    public tileProgressionFactor: number;
    constructor(
    ) {
        this.levelNumber = this.previousLevel + 1;
        this.zoomProgressionFactor = 0;
        this.tileProgressionFactor = 0;
        if (this.levelNumber >= 0 && this.levelNumber <= 8) {
            this.zoomProgressionFactor = 1.5 * this.levelNumber;
            this.tileProgressionFactor = 4 * this.levelNumber;
        }
    }

    async update() {
        const newLevel = this.previousLevel + 1;
        this.previousLevel = newLevel;

        //console.log("Level Progredido:", levelNumber);
    }
}
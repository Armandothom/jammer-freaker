export class LevelManager {
    public previousLevel = 0;
    private levelNumber: number;
    public zoomProgressionFactor: number;
    public tileProgressionFactor: number;
    constructor(
    ) {
        this.levelNumber = this.previousLevel + 1;
        this.zoomProgressionFactor = 1;
        this.tileProgressionFactor = 1;
        if (this.levelNumber >= 0 && this.levelNumber <= 8) {
            this.zoomProgressionFactor = 1 * this.levelNumber;
            this.tileProgressionFactor = 1 * this.levelNumber;
        }
    }

    async update() {
        // const newLevel = this.previousLevel + 1;
        // this.previousLevel = newLevel;

        //console.log("Level Progredido:", levelNumber);
    }
}
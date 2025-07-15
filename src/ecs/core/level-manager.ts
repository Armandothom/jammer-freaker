export class LevelManager {
    public previousLevel = 0;
    constructor(
        
    ) {
    }

    update() {
        const levelNumber = this.previousLevel + 1;
        this.previousLevel = levelNumber;
        //console.log("Level Progredido:", levelNumber);
    }
}
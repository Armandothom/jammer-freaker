import { createNoise2D } from 'simplex-noise';
import { WorldTilemapManager } from '../../game/world/world-tilemap-manager.js';

export class LevelManager {
    public previousLevel = 0;
    constructor(
        
    ) {
    }

    update() {
        const levelNumber = this.previousLevel + 1;
        this.previousLevel = levelNumber;
        
        const noise2d = createNoise2D();



        //console.log("Level Progredido:", levelNumber);
    }
}
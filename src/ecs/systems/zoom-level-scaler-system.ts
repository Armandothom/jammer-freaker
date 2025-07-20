import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { LevelManager } from "../core/level-manager.js";
import { ISystem } from "./system.interface.js";

export class SpriteLevelScalerSystem implements ISystem {
    constructor(
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private spriteManager : SpriteManager,
        private levelManager : LevelManager,
        private tilemapManager : WorldTilemapManager
    ) { }

    update(deltaTime: number): void {
        const sprites = this.spriteComponentStore.getValuesAndEntityId();
        const zoomProgressionFactor = this.levelManager.zoomProgressionFactor;
        this.tilemapManager.tileSize = this.tilemapManager.tileSize * this.levelManager.tileProgressionFactor;
        for (const sprite of sprites) {
            const spriteProperties = this.spriteManager.getSpriteSheetProperties(sprite[1].spriteSheetName);
            sprite[1].height = spriteProperties.originalRenderSpriteHeight * zoomProgressionFactor;
            sprite[1].width = spriteProperties.originalRenderSpriteWidth * zoomProgressionFactor;
        }
    }

}
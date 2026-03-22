import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { LevelManager } from "../core/level-manager.js";
import { ISystem } from "./system.interface.js";

export class SpriteLevelScalerSystem implements ISystem {
    constructor(
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private spriteManager: SpriteManager,
        private levelManager: LevelManager,
        private tilemapManager: WorldTilemapManager,
        private renderableComponentStore: ComponentStore<RenderableComponent>,
    ) { }

    update(deltaTime: number): void {
        const sprites = this.spriteComponentStore.getValuesAndEntityId();
        const zoomProgressionFactor = 1;
        for (const sprite of sprites) {
            if (!this.renderableComponentStore.has(sprite[0])) continue;
            //console.log("sprite", sprite[1].spriteName, sprite[1].spriteSheetName);
            const spriteProperties = this.spriteManager.getSpriteProperties(sprite[1].spriteName, sprite[1].spriteSheetName);
            sprite[1].height = spriteProperties.sprite.originalRenderSpriteHeight * zoomProgressionFactor;
            sprite[1].width = spriteProperties.sprite.originalRenderSpriteWidth * zoomProgressionFactor;
        }
    }

}
import { AssetManager } from "../../game/asset-manager/asset-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { RenderSystem } from "../systems/render-system.js";
import { CoreManager } from "./core-manager.js";

export class SystemRunner {
    private renderSystem : RenderSystem;
    private cameraManager : CameraManager;
    constructor(
      private worldTilemapManager : WorldTilemapManager,
      private assetManager : AssetManager,
      private spriteManager : SpriteManager,
      private rendererEngine : RendererEngine
    ) {
      this.cameraManager = new CameraManager(this.worldTilemapManager)
      this.renderSystem = new RenderSystem(this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager);
    }


    update() {
      this.renderSystem.update(CoreManager.timeSinceLastRender);
    }
}
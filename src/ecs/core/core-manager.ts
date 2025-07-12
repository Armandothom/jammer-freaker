import { AssetManager } from "../../game/asset-manager/asset-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { SystemRunner } from "./system-runner.js";

export class CoreManager {
    private previousTimestamp = 0;
    static timeSinceLastRender = 0;
    private _assetManager : AssetManager;
    private _spriteManager!: SpriteManager;
    private _systemRunner!: SystemRunner;
    private _worldTilemapManager : WorldTilemapManager;
    private _rendererEngine : RendererEngine;
    constructor() {
        this._assetManager = new AssetManager();
        this._worldTilemapManager = new WorldTilemapManager();
        this._rendererEngine = new RendererEngine();
    }

    public async init() {
        console.log("Loading Game...");
        await this._assetManager.loadAssets();
        this._spriteManager = new SpriteManager(this._assetManager);
        //TBD how to handle
        this._rendererEngine.init();
        ///TBD how to handle
        console.log("Game generated");
        this._systemRunner = new SystemRunner(this._worldTilemapManager, this._assetManager, this._spriteManager, this._rendererEngine);
        window.requestAnimationFrame(this.runLoop.bind(this));
    }

    private runLoop(startTimePageLoaded : number) {
        CoreManager.timeSinceLastRender = (startTimePageLoaded - this.previousTimestamp) / 1000;
        this.previousTimestamp = startTimePageLoaded;
        this._systemRunner.update();
        window.requestAnimationFrame(this.runLoop.bind(this))
    }
}
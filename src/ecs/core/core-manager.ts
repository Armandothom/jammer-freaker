import { AssetManager } from "../../game/asset-manager/asset-manager.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { EntityManager } from "./entity-manager.js";
import { SystemRunner } from "./system-runner.js";
import { SoundMap } from "../../game/asset-manager/consts/sound-mapped.values.js"

export class CoreManager {
    private previousTimestamp = 0;
    static timeSinceLastRender = 0;
    private _assetManager: AssetManager;
    private _spriteManager!: SpriteManager;
    private _systemRunner!: SystemRunner;
    private _worldTilemapManager!: WorldTilemapManager;
    private _rendererEngine: RendererEngine;
    private _entityManager: EntityManager;
    private _soundManager!: SoundManager;

    constructor() {
        this._assetManager = new AssetManager();
        this._rendererEngine = new RendererEngine();
        this._entityManager = new EntityManager();
        this._soundManager = new SoundManager();
    }

    public async init() {
        console.log("Loading Game...");
        await this._assetManager.loadAssets();
        await this._soundManager.loadMultipleSounds();
        this._spriteManager = new SpriteManager(this._assetManager);
        this._rendererEngine.init();
        console.log("Game generated");
        this._worldTilemapManager = new WorldTilemapManager(this._spriteManager);
        this._systemRunner = new SystemRunner(this._worldTilemapManager, this._spriteManager, this._entityManager, this._soundManager, this._rendererEngine,);
        this._systemRunner.initialize();
        window.requestAnimationFrame(this.runLoop.bind(this));
    }

    private runLoop(startTimePageLoaded: number) {
        CoreManager.timeSinceLastRender = (startTimePageLoaded - this.previousTimestamp) / 1000;
        this.previousTimestamp = startTimePageLoaded;
        this._systemRunner.update();
        window.requestAnimationFrame(this.runLoop.bind(this))
    }
}
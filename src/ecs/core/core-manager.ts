import { AssetManager } from "../../game/asset-manager/asset-manager.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { EntityManager } from "./entity-manager.js";
import { LevelManager } from "./level-manager.js";
import { SystemRunner } from "./system-runner.js";
import { SoundMap } from "../../game/asset-manager/consts/sound-mapped.values.js"
import { FreezeManager } from "./freeze-manager.js";

export class CoreManager {
    private previousTimestamp = 0;
    static timeSinceLastRender = 0;
    static timeGlobalSinceStart = 0;
    private _assetManager: AssetManager;
    private _spriteManager!: SpriteManager;
    private _systemRunner!: SystemRunner;
    private _worldTilemapManager!: WorldTilemapManager;
    private _rendererEngine: RendererEngine;
    private _entityManager: EntityManager;
    private _soundManager!: SoundManager;
    private _levelManager!: LevelManager;
    private _freezeManager!: FreezeManager;

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
        this._systemRunner = new SystemRunner(this._worldTilemapManager, this._spriteManager, this._entityManager, this._soundManager, this._rendererEngine, this._levelManager, this._freezeManager);
        this._systemRunner.initialize();        
        this._soundManager.resumeOnUserGesture();
        //this._soundManager.playSound("THEME", true, 0.1);
        CoreManager.timeGlobalSinceStart = 0;
        window.requestAnimationFrame(this.runLoop.bind(this));
    }

    private runLoop(startTimePageLoaded: number) {
        CoreManager.timeSinceLastRender = (startTimePageLoaded - this.previousTimestamp) / 1000;
        CoreManager.timeGlobalSinceStart += CoreManager.timeSinceLastRender
        this.previousTimestamp = startTimePageLoaded;
        this._systemRunner.update();
        window.requestAnimationFrame(this.runLoop.bind(this))
    }
}
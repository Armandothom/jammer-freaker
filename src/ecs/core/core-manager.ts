import { AssetManager } from "../../game/asset-manager/asset-manager.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import { GameManager } from "./game-manager.js";

export class CoreManager {
    private static readonly FPS_DEBUG_INTERVAL_SECONDS = 5;
    private previousTimestamp = 0;
    private fpsFrameCount = 0;
    private fpsElapsedTime = 0;
    static timeSinceLastRender = 0;
    static timeGlobalSinceStart = 0;
    private _assetManager: AssetManager;
    private _spriteManager!: SpriteManager;
    private _textManager!: TextManager;
    private _gameManager!: GameManager;
    private _worldTilemapManager!: WorldTilemapManager;
    private _rendererEngine: RendererEngine;
    private _entityManager: EntityManager;
    private _soundManager!: SoundManager;
    private _debugManager!: DebugManager;

    constructor() {
        this._assetManager = new AssetManager();
        this._rendererEngine = new RendererEngine();
        this._entityManager = new EntityManager();
        this._soundManager = new SoundManager();
        this._debugManager = new DebugManager();
    }

    public async init() {
        console.log("Loading Game...");
        await this._assetManager.loadAssets();
        await this._soundManager.loadMultipleSounds();
        this._spriteManager = new SpriteManager(this._assetManager);
        this._rendererEngine.init();
        this._textManager = new TextManager(this._assetManager);
        console.log("Game generated");

        this._worldTilemapManager = new WorldTilemapManager();
        this._gameManager = new GameManager(this._worldTilemapManager, this._spriteManager, this._textManager, this._entityManager, this._soundManager, this._rendererEngine, this._debugManager);
        this._gameManager.initialize();
        this._soundManager.resumeOnUserGesture();
        //this._soundManager.playSound("THEME", true, 0.1);
        CoreManager.timeGlobalSinceStart = 0;
        window.requestAnimationFrame(this.runLoop.bind(this));
    }

    private runLoop(startTimePageLoaded: number) {
        const isFirstFrame = this.previousTimestamp === 0;
        CoreManager.timeSinceLastRender = (startTimePageLoaded - this.previousTimestamp) / 1000;
        CoreManager.timeGlobalSinceStart += CoreManager.timeSinceLastRender
        this.previousTimestamp = startTimePageLoaded;
        if (!isFirstFrame) {
            this.debugFps(CoreManager.timeSinceLastRender);
        }
        this._gameManager.update();
        window.requestAnimationFrame(this.runLoop.bind(this))
    }

    private debugFps(deltaTime: number) {
        if (deltaTime <= 0) {
            return;
        }

        this.fpsFrameCount += 1;
        this.fpsElapsedTime += deltaTime;

        if (this.fpsElapsedTime < CoreManager.FPS_DEBUG_INTERVAL_SECONDS) {
            return;
        }

        const fps = this.fpsFrameCount / this.fpsElapsedTime;
        console.log(`[DEBUG][FPS] ${fps.toFixed(1)}`);
        this.fpsFrameCount = 0;
        this.fpsElapsedTime = 0;
    }
}

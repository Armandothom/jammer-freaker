import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { GameplaySystemRunner } from "./gameplay-system-runner.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import { ShopSystemRunner } from "./shop-system-runner.js";
import { GameState } from "./types/game-state.enum.js";

export class GameManager {
    private readonly gameplaySystemRunner: GameplaySystemRunner;
    private readonly shopSystemRunner: ShopSystemRunner;
    private readonly weatherManager: WeatherManager;
    private activeState: GameState = GameState.GameplayState;
    private inventorySnapshot: InventorySnapshot | null = null;

    constructor(
        private worldTilemapManager: WorldTilemapManager,
        private spriteManager: SpriteManager,
        private textManager: TextManager,
        private entityManager: EntityManager,
        private soundManager: SoundManager,
        private rendererEngine: RendererEngine,
        private debugManager: DebugManager,
    ) {
        this.weatherManager = new WeatherManager();
        this.gameplaySystemRunner = new GameplaySystemRunner(
            this.worldTilemapManager,
            this.spriteManager,
            this.textManager,
            this.entityManager,
            this.soundManager,
            this.rendererEngine,
            this.debugManager,
            this.weatherManager,
        );
        this.shopSystemRunner = new ShopSystemRunner(
            this.spriteManager,
            this.textManager,
            this.rendererEngine,
            this.debugManager,
            this.entityManager,
            this.weatherManager,
        );
        this.gameplaySystemRunner.bindGameManager(this);
        this.shopSystemRunner.bindGameManager(this);
    }

    initialize(): void {
        this.gameplaySystemRunner.initialize();
    }

    update(): void {
        switch (this.activeState) {
            case GameState.GameplayState:
                this.gameplaySystemRunner.update();
                return;

            case GameState.ShopHubState:
            case GameState.GunsShopState:
            case GameState.MedicalShopState:
                this.shopSystemRunner.update();
                return;

            default: {
                const exhaustiveCheck: never = this.activeState;
                throw new Error(`Unsupported game state: ${exhaustiveCheck}`);
            }
        }
    }

    requestShopHubState(): void {
        this.requestShopState(GameState.ShopHubState);
    }

    requestGunsShopState(): void {
        this.requestShopState(GameState.GunsShopState);
    }

    requestMedicalShopState(): void {
        this.requestShopState(GameState.MedicalShopState);
    }

    requestGameplayState(): void {
        if (this.activeState === GameState.GameplayState) {
            return;
        }

        this.inventorySnapshot = this.shopSystemRunner.captureInventorySnapshot();
        this.gameplaySystemRunner.startNextLevelWithInventorySnapshot(this.inventorySnapshot);
        this.shopSystemRunner.reset();
        this.activeState = GameState.GameplayState;

        console.log("[GameManager] Transitioned to GameplayState.");
        console.log("[GameManager] Inventory snapshot:", this.inventorySnapshot);
    }

    private requestShopState(nextState: GameState.ShopHubState | GameState.GunsShopState | GameState.MedicalShopState): void {
        if (this.activeState === nextState) {
            return;
        }

        if (this.activeState === GameState.GameplayState) {
            this.inventorySnapshot = this.gameplaySystemRunner.capturePlayerInventorySnapshot();
            this.shopSystemRunner.reset();
            this.shopSystemRunner.setInventorySnapshot(this.inventorySnapshot);
            this.shopSystemRunner.initialize();
        } else if (this.isShopState(this.activeState)) {
            this.inventorySnapshot = this.shopSystemRunner.captureInventorySnapshot();
            this.shopSystemRunner.syncInventorySnapshot(this.inventorySnapshot);
        }

        this.activeState = nextState;

        console.log(`[GameManager] Transitioned to ${nextState}.`);
        console.log("[GameManager] Inventory snapshot:", this.inventorySnapshot);
    }

    private isShopState(state: GameState): state is GameState.ShopHubState | GameState.GunsShopState | GameState.MedicalShopState {
        return state === GameState.ShopHubState
            || state === GameState.GunsShopState
            || state === GameState.MedicalShopState;
    }

    getCurrentState(): GameState {
        return this.activeState;
    }

    getWeatherManager(): WeatherManager {
        return this.weatherManager;
    }
}

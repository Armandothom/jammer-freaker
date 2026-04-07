import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
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
        this.gameplaySystemRunner = new GameplaySystemRunner(
            this.worldTilemapManager,
            this.spriteManager,
            this.textManager,
            this.entityManager,
            this.soundManager,
            this.rendererEngine,
            this.debugManager,
        );
        this.shopSystemRunner = new ShopSystemRunner(
            this.spriteManager,
            this.textManager,
            this.rendererEngine,
            this.debugManager,
            this.entityManager,
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

            case GameState.ShopState:
                this.shopSystemRunner.update();
                return;

            default: {
                const exhaustiveCheck: never = this.activeState;
                throw new Error(`Unsupported game state: ${exhaustiveCheck}`);
            }
        }
    }

    requestShopState(): void {
        if (this.activeState === GameState.ShopState) {
            return;
        }

        this.inventorySnapshot = this.gameplaySystemRunner.capturePlayerInventorySnapshot();
        this.shopSystemRunner.reset();
        this.shopSystemRunner.setInventorySnapshot(this.inventorySnapshot);
        this.shopSystemRunner.initialize();
        this.activeState = GameState.ShopState;

        console.log("[GameManager] Transitioned to ShopState.");
        console.log("[GameManager] Inventory snapshot:", this.inventorySnapshot);
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

    getCurrentState(): GameState {
        return this.activeState;
    }
}

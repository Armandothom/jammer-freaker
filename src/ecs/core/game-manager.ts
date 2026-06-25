import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { WorldMapManager } from "../../game/world-map/world-map-manager.js";
import { WorldTilemapManager } from "../../game/world-map/world-tilemap-manager.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import type { QuestSnapshot } from "../components/snapshots/quest-snapshot.js";
import type { StorageSnapshot } from "../components/snapshots/storage-snapshot.js";
import type { QuestTrader } from "../components/types/quest-config.js";
import { WeaponType } from "../components/types/weapon-config.js";
import { GameplaySystemRunner } from "./gameplay-system-runner.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import { InventoryManager } from "./inventory-manager.js";
import { ShopSystemRunner } from "./shop-system-runner.js";
import { GameState } from "./types/game-state.enum.js";

type QuestReturnState =
    | GameState.ShopHubState
    | GameState.CampStorageState
    | GameState.WareBuyerState
    | GameState.MissionSelectState
    | GameState.GunsShopState
    | GameState.MedicalShopState
    | GameState.CombatShopState;

type ShopState = QuestReturnState | GameState.QuestState;

export class GameManager {
    private readonly gameplaySystemRunner: GameplaySystemRunner;
    private readonly shopSystemRunner: ShopSystemRunner;
    private readonly weatherManager: WeatherManager;
    private activeState: GameState = GameState.ShopHubState;
    private inventorySnapshot: InventorySnapshot | null = GameManager.createInitialInventorySnapshot();
    private storageSnapshot: StorageSnapshot | null = null;
    private questSnapshot: QuestSnapshot | null = null;
    private wareBuyerSaleSnapshot: StorageSnapshot | null = null;
    private questReturnState: QuestReturnState = GameState.ShopHubState;

    constructor(
        private worldTilemapManager: WorldTilemapManager,
        private worldMapManager: WorldMapManager,
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
            this.worldMapManager,
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
            this.worldMapManager,
        );
        this.gameplaySystemRunner.bindGameManager(this);
        this.shopSystemRunner.bindGameManager(this);
    }

    private static createInitialInventorySnapshot(): InventorySnapshot {
        const inventoryManager = new InventoryManager();

        return inventoryManager.createDefaultInventory(WeaponType.PISTOL).toSnapshot();
    }

    initialize(): void {
        this.shopSystemRunner.setInventorySnapshot(this.inventorySnapshot);
        this.shopSystemRunner.setStorageSnapshot(this.storageSnapshot);
        this.shopSystemRunner.setQuestSnapshot(this.questSnapshot);
        this.shopSystemRunner.setWareBuyerSaleSnapshot(this.wareBuyerSaleSnapshot);
        this.shopSystemRunner.initialize();
    }

    update(): void {
        switch (this.activeState) {
            case GameState.GameplayState:
                this.gameplaySystemRunner.update();
                return;

            case GameState.ShopHubState:
            case GameState.CampStorageState:
            case GameState.WareBuyerState:
            case GameState.MissionSelectState:
            case GameState.GunsShopState:
            case GameState.MedicalShopState:
            case GameState.CombatShopState:
            case GameState.QuestState:
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

    requestCampStorageState(): void {
        this.requestShopState(GameState.CampStorageState);
    }

    requestWareBuyerState(): void {
        this.requestShopState(GameState.WareBuyerState);
    }

    requestMissionSelectState(): void {
        this.requestShopState(GameState.MissionSelectState);
    }

    requestGunsShopState(): void {
        this.requestShopState(GameState.GunsShopState);
    }

    requestMedicalShopState(): void {
        this.requestShopState(GameState.MedicalShopState);
    }

    requestCombatShopState(): void {
        this.requestShopState(GameState.CombatShopState);
    }

    requestQuestState(trader: QuestTrader): void {
        if (this.activeState !== GameState.QuestState && this.isQuestReturnState(this.activeState)) {
            this.questReturnState = this.activeState;
        }

        this.shopSystemRunner.openQuestForTrader(trader);
        this.requestShopState(GameState.QuestState);
    }

    requestReturnFromQuestState(): void {
        this.requestShopState(this.questReturnState);
    }

    requestGameplayState(mapId?: string | null): void {
        if (this.activeState === GameState.GameplayState) {
            return;
        }

        const selectedMapId = this.worldMapManager.resolveMapId(mapId);
        this.inventorySnapshot = this.shopSystemRunner.captureInventorySnapshot();
        this.storageSnapshot = this.shopSystemRunner.captureStorageSnapshot();
        this.questSnapshot = this.shopSystemRunner.captureQuestSnapshot();
        this.wareBuyerSaleSnapshot = this.shopSystemRunner.captureWareBuyerSaleSnapshot();
        this.gameplaySystemRunner.setQuestSnapshot(this.questSnapshot);
        this.gameplaySystemRunner.startMapWithInventorySnapshot(selectedMapId, this.inventorySnapshot);
        this.shopSystemRunner.reset();
        this.activeState = GameState.GameplayState;

        console.log(`[GameManager] Transitioned to GameplayState (${selectedMapId}).`);
        console.log("[GameManager] Inventory snapshot:", this.inventorySnapshot);
    }

    private requestShopState(nextState: ShopState): void {
        if (this.activeState === nextState) {
            return;
        }

        if (this.activeState === GameState.GameplayState) {
            this.inventorySnapshot = this.gameplaySystemRunner.capturePlayerInventorySnapshot();
            this.questSnapshot = this.gameplaySystemRunner.captureQuestSnapshot();
            this.shopSystemRunner.reset();
            this.shopSystemRunner.setInventorySnapshot(this.inventorySnapshot);
            this.shopSystemRunner.setStorageSnapshot(this.storageSnapshot);
            this.shopSystemRunner.setQuestSnapshot(this.questSnapshot);
            this.shopSystemRunner.setWareBuyerSaleSnapshot(this.wareBuyerSaleSnapshot);
            this.shopSystemRunner.initialize();
        } else if (this.isShopState(this.activeState)) {
            this.inventorySnapshot = this.shopSystemRunner.captureInventorySnapshot();
            this.storageSnapshot = this.shopSystemRunner.captureStorageSnapshot();
            this.questSnapshot = this.shopSystemRunner.captureQuestSnapshot();
            this.wareBuyerSaleSnapshot = this.shopSystemRunner.captureWareBuyerSaleSnapshot();
            this.shopSystemRunner.syncInventorySnapshot(this.inventorySnapshot);
            this.shopSystemRunner.syncStorageSnapshot(this.storageSnapshot);
            this.shopSystemRunner.syncQuestSnapshot(this.questSnapshot);
            this.shopSystemRunner.syncWareBuyerSaleSnapshot(this.wareBuyerSaleSnapshot);
        }

        this.activeState = nextState;

        console.log(`[GameManager] Transitioned to ${nextState}.`);
        console.log("[GameManager] Inventory snapshot:", this.inventorySnapshot);
    }

    private isQuestReturnState(state: GameState): state is QuestReturnState {
        return state === GameState.ShopHubState
            || state === GameState.CampStorageState
            || state === GameState.WareBuyerState
            || state === GameState.MissionSelectState
            || state === GameState.GunsShopState
            || state === GameState.MedicalShopState
            || state === GameState.CombatShopState;
    }

    private isShopState(state: GameState): state is ShopState {
        return this.isQuestReturnState(state)
            || state === GameState.QuestState;
    }

    getCurrentState(): GameState {
        return this.activeState;
    }

    getWeatherManager(): WeatherManager {
        return this.weatherManager;
    }

}

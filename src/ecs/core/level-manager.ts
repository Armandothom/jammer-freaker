import { CameraManager } from "../../game/world-map/camera-manager.js";
import { BuildingInteractionManager } from "../../game/world-map/buildings/building-interaction-manager.js";
import { BuildingInPlotSorter } from "../../game/world-map/buildings/building-in-plot-sorter.js";
import { BuildingTilemapApplier } from "../../game/world-map/buildings/building-tilemap-applier.js";
import { WorldEdgeChunkManager } from "../../game/world-map/world-edge-chunk-manager.js";
import { WorldEdgeManager } from "../../game/world-map/world-edge-manager.js";
import { WorldMapManager } from "../../game/world-map/world-map-manager.js";
import { WorldTilemapManager } from "../../game/world-map/world-tilemap-manager.js";
import { HealthComponent } from "../components/health.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import {
    getMedicalShopUpgradeLevelConfig,
    MedicalShopUpgradeItemType,
    normalizeStoredMedicalShopUpgradeLevel,
    type MedicalShopUpgradeLevel,
} from "../components/types/medical-shop-upgrade-item-config.js";
import { PlayerInitialProperties } from "../components/types/player-properties.js";
import { WeaponType } from "../components/types/weapon-config.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemyLifecicleSystem } from "../systems/enemy-lifecicle.system.js";
import { ComponentStore } from "./component-store.js";
import { GameManager } from "./game-manager.js";
import type { LootContainerManager } from "./loot-container-manager.js";
import { WorldImpassableChunkManager } from "../../game/world-map/world-impassable-chunk-manager.js";

export enum LevelEndReason {
    PlayerDeath = "player_death",
    Victory = "victory",
    Abort = "abort",
    Reset = "reset"
}

export type LevelStats = {
    time: string,
    enemiesKilled: number,
    currentMoney: number,
    extraMoney: number,
}

export class LevelManager {
    public previousLevel = 0;
    public levelNumber: number;
    public levelBuildId = 0;
    public levelUpdatePending = false;
    public levelStats: LevelStats;
    private currentLevelEndReason: LevelEndReason | null = null;
    private currentLevelInitialInventorySnapshot: InventorySnapshot | null = null;
    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();
    private gameManager: GameManager | null = null;
    private nextPlayerInventorySnapshot: InventorySnapshot | null = null;
    private stateTransitionRequested = false;
    private beforeLevelRebuildHandlers: Array<() => void> = [];
    private lootContainerManager: LootContainerManager | null = null;
    private currentMapId: string;
    private readonly buildingInPlotSorter: BuildingInPlotSorter;
    private readonly buildingTilemapApplier: BuildingTilemapApplier;
    private readonly buildingInteractionManager: BuildingInteractionManager;

    constructor(
        private enemyLifecicleSystem: EnemyLifecicleSystem,
        private worldMapManager: WorldMapManager,
        private tilemapManager: WorldTilemapManager,
        private worldEdgeManager: WorldEdgeManager,
        private worldEdgeChunkManager: WorldEdgeChunkManager,
        private worldImpassableChunkManager: WorldImpassableChunkManager,
        private cameraManager: CameraManager,
        private entityFactory: EntityFactory,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private playerInitialProperties: PlayerInitialProperties,
    ) {
        this.currentMapId = this.worldMapManager.defaultMapId;
        this.buildingInPlotSorter = new BuildingInPlotSorter();
        this.buildingTilemapApplier = new BuildingTilemapApplier(this.tilemapManager);
        this.buildingInteractionManager = new BuildingInteractionManager();
        this.levelNumber = this.previousLevel;
        this.levelStats = {
            time: "",
            enemiesKilled: 0,
            currentMoney: 0,
            extraMoney: 0,
        };
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    async update(): Promise<void> {
        this.startMapWithInventorySnapshot(
            this.worldMapManager.defaultMapId,
            this.captureCurrentPlayerInventorySnapshot(),
        );
    }

    public startMapWithInventorySnapshot(
        mapId: string | null | undefined,
        inventorySnapshot: InventorySnapshot | null,
    ): void {
        this.currentMapId = this.worldMapManager.resolveMapId(mapId);
        this.previousLevel = this.levelNumber;
        this.levelNumber = this.worldMapManager.getMapIndex(this.currentMapId) + 1;
        this.nextPlayerInventorySnapshot = this.cloneInventorySnapshot(inventorySnapshot);
        this.rebuildLevel();
    }

    public startNextLevelWithInventorySnapshot(
        inventorySnapshot: InventorySnapshot | null,
    ): void {
        this.startMapWithInventorySnapshot(
            this.worldMapManager.getNextMapId(this.currentMapId),
            inventorySnapshot,
        );
    }

    public startNextLevelWithCurrentInventory(): void {
        this.startNextLevelWithInventorySnapshot(this.captureCurrentPlayerInventorySnapshot());
    }

    public requestGunsShopState(): boolean {
        if (!this.gameManager) {
            return false;
        }

        this.gameManager.requestGunsShopState();
        this.stateTransitionRequested = true;
        return true;
    }

    public requestShopHubState(): boolean {
        if (!this.gameManager) {
            return false;
        }

        this.gameManager.requestShopHubState();
        this.stateTransitionRequested = true;
        return true;
    }

    public retryCurrentLevel(): void {
        this.nextPlayerInventorySnapshot = this.cloneInventorySnapshot(this.currentLevelInitialInventorySnapshot);
        this.rebuildLevel();
    }

    public getCurrentLevelEndReason(): LevelEndReason | null {
        return this.currentLevelEndReason;
    }

    public onBeforeLevelRebuild(handler: () => void): void {
        this.beforeLevelRebuildHandlers.push(handler);
    }

    private rebuildLevel(): void {
        this.endCurrentLevel(LevelEndReason.Reset);
        this.notifyBeforeLevelRebuild();
        this.levelBuildId += 1;
        this.levelUpdatePending = false;
        this.tilemapManager.clearLevelGeometry();
        this.levelStats = {
            time: "",
            enemiesKilled: 0,
            currentMoney: 0,
            extraMoney: 0,
        };

        const worldMap = this.worldMapManager.getMap(this.currentMapId);
        const playerSpawn = this.worldMapManager.getRandomStreetSpawnTile(worldMap.id);

        this.tilemapManager.applyWorldMap(worldMap);
        const buildingPlacements = this.buildingInPlotSorter.generateBuildingsForMap(worldMap.id);
        this.buildingInteractionManager.rebuild(buildingPlacements);
        this.buildingTilemapApplier.apply(buildingPlacements);
        this.lootContainerManager?.create();
        this.spawnPlayerAtTile(playerSpawn.tileX, playerSpawn.tileY);
        this.finalizeLevelBuild();
        this.worldEdgeManager.setEdges();
        this.saveChunks();
    }

    private notifyBeforeLevelRebuild(): void {
        for (const handler of this.beforeLevelRebuildHandlers) {
            handler();
        }
    }

    public endCurrentLevel(reason: LevelEndReason): void {
        this.currentLevelEndReason = reason;
        //this.tilemapManager.clearLevelGeometry();

        switch (reason) {
            case LevelEndReason.PlayerDeath:
                // defeat logic
                break;

            case LevelEndReason.Victory:
                // victory logic
                break;
            case LevelEndReason.Reset:
                break;
        }
    }

    private finalizeLevelBuild(): void {
        this.currentLevelEndReason = null;
    }

    public bindGameManager(gameManager: GameManager): void {
        this.gameManager = gameManager;
    }

    public bindLootContainerManager(lootContainerManager: LootContainerManager): void {
        this.lootContainerManager = lootContainerManager;
    }

    public getBuildingInteractionManager(): BuildingInteractionManager {
        return this.buildingInteractionManager;
    }

    public updateStateTransitions(): boolean {
        const shouldCompleteLevel = this.wasKeyPressedThisFrame("Digit0");
        const shouldShortCircuitFrame = this.stateTransitionRequested;
        this.stateTransitionRequested = false;

        this.syncInputFrame();

        if (shouldCompleteLevel) {
            this.levelUpdatePending = true;
        }

        return shouldShortCircuitFrame;
    }

    private spawnPlayerAtTile(tileX: number, tileY: number): void {
        const { worldX, worldY } = this.tilemapManager.tileToWorld(tileX, tileY);
        const inventorySnapshot = this.nextPlayerInventorySnapshot;

        const [playerEntityId] = this.playerComponentStore.getAllEntities();
        const playerInitialHp = this.resolvePlayerInitialHp(inventorySnapshot?.medicalUpgrades);

        if (playerEntityId == null) {
            this.entityFactory.createPlayer(
                worldX,
                worldY,
                playerInitialHp,
                this.playerInitialProperties.velocity,
                WeaponType.PISTOL,
                inventorySnapshot ?? undefined,
            );
            this.entityFactory.createItemBox(worldX + 64, worldY + 64);
        } else {
            const position = this.positionComponentStore.get(playerEntityId);
            position.x = worldX;
            position.y = worldY;

            const movementIntent = this.movementIntentComponentStore.getOrNull(playerEntityId);
            if (movementIntent) {
                movementIntent.x = worldX;
                movementIntent.y = worldY;
            }

            if (inventorySnapshot) {
                const nextInventory = InventoryComponent.fromSnapshot(inventorySnapshot);
                const nextWeaponType = nextInventory.equippedWeaponType ?? WeaponType.PISTOL;
                const nextPlayerInitialHp = this.resolvePlayerInitialHp(nextInventory.medicalUpgrades);

                this.inventoryComponentStore.add(playerEntityId, nextInventory);

                if (this.healthComponentStore.has(playerEntityId)) {
                    const health = this.healthComponentStore.get(playerEntityId);
                    health.hp = nextPlayerInitialHp;
                    health.maxHp = nextPlayerInitialHp;
                }

                this.entityFactory.destroyPlayerWeapon(playerEntityId);
                this.entityFactory.createPlayerWeapon(
                    playerEntityId,
                    nextWeaponType,
                );
            }
        }

        this.currentLevelInitialInventorySnapshot = this.captureCurrentPlayerInventorySnapshot();
        this.nextPlayerInventorySnapshot = null;
        this.cameraManager.follow(worldX, worldY);
    }

    private resolvePlayerInitialHp(
        medicalUpgrades?: ReadonlyMap<MedicalShopUpgradeItemType, number>,
    ): number {
        const baseHp = this.playerInitialProperties.hp;
        const maxHealthLevel = normalizeStoredMedicalShopUpgradeLevel(
            medicalUpgrades?.get(MedicalShopUpgradeItemType.MAX_HEALTH) ?? 0,
        );

        if (maxHealthLevel <= 0) {
            return baseHp;
        }

        const maxHealthMultiplier = getMedicalShopUpgradeLevelConfig(
            MedicalShopUpgradeItemType.MAX_HEALTH,
            maxHealthLevel as MedicalShopUpgradeLevel,
        ).value;

        return baseHp * maxHealthMultiplier;
    }

    private captureCurrentPlayerInventorySnapshot(): InventorySnapshot | null {
        const playerEntityId = this.playerComponentStore.getAllEntities()[0];
        if (playerEntityId == null) {
            return null;
        }

        const inventory = this.inventoryComponentStore.getOrNull(playerEntityId);
        return inventory?.toSnapshot() ?? null;
    }

    private cloneInventorySnapshot(snapshot: InventorySnapshot | null): InventorySnapshot | null {
        if (!snapshot) {
            return null;
        }

        return InventoryComponent.fromSnapshot(snapshot).toSnapshot();
    }

    private wasKeyPressedThisFrame(code: string): boolean {
        return this.pressedKeys.has(code) && !this.previousPressedKeys.has(code);
    }

    private syncInputFrame(): void {
        this.previousPressedKeys = new Set(this.pressedKeys);
    }

    private onKeyDown = (event: KeyboardEvent): void => {
        this.pressedKeys.add(event.code);
    };

    private onKeyUp = (event: KeyboardEvent): void => {
        this.pressedKeys.delete(event.code);
    };
    private saveChunks() {
        this.worldEdgeChunkManager.generateChunks();
        this.worldImpassableChunkManager.generateChunks();
    }
}

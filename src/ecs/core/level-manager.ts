import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldLevelResult } from "../../game/world/types/world-level-result.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { HealthComponent } from "../components/health.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { PlayerInitialProperties } from "../components/types/player-properties.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemyLifecicleSystem } from "../systems/enemy-lifecicle.system.js";
import { ZoneFactory } from "../zones/zone-factory.js";
import { ComponentStore } from "./component-store.js";
import type { GameManager } from "./game-manager.js";
import { UIManager } from "./ui-manager.js";

export enum LevelEndReason {
    PlayerDeath = "player_death",
    Success = "success",
    Abort = "abort",
    Reset = "reset"
}

export class LevelManager {
    public previousLevel = 0;
    public levelNumber: number;
    public levelUpdatePending = false;
    private pressedKeys = new Set<string>();
    private previousPressedKeys = new Set<string>();
    private gameManager: GameManager | null = null;
    private nextPlayerInventorySnapshot: InventorySnapshot | null = null;

    constructor(
        private enemyLifecicleSystem: EnemyLifecicleSystem,
        private tilemapManager: WorldTilemapManager,
        private cameraManager: CameraManager,
        private zoneFactory: ZoneFactory,
        private entityFactory: EntityFactory,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private inventoryComponentStore: ComponentStore<InventoryComponent>,
        private healthComponentStore: ComponentStore<HealthComponent>,
        private playerInitialProperties: PlayerInitialProperties,
        private uiManager: UIManager,
    ) {
        this.levelNumber = this.previousLevel;
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    async update(): Promise<void> {
        this.advanceToNextLevel();
    }

    public startNextLevelWithInventorySnapshot(
        inventorySnapshot: InventorySnapshot | null,
    ): void {
        this.nextPlayerInventorySnapshot = inventorySnapshot;
        this.advanceToNextLevel();
    }

    private rebuildLevel(): void {
        this.endCurrentLevel(LevelEndReason.Reset);

        const levelResult = this.zoneFactory.generateLevel({
            levelNumber: this.levelNumber,
            zones: this.tilemapManager.zones,
        });

        this.applyLevelResult(levelResult);

        this.finalizeLevelBuild();
    }

    private applyLevelResult(levelResult: WorldLevelResult): void {
        this.tilemapManager.applyWorldLevelResult(levelResult);
        this.spawnPlayer(levelResult);
    }

    public endCurrentLevel(reason: LevelEndReason): void {
        this.tilemapManager.clearLevelGeometry();

        switch (reason) {
            case LevelEndReason.PlayerDeath:
                // defeat logic
                break;

            case LevelEndReason.Success:
                // victory logic
                break;
            case LevelEndReason.Reset:
                break;
        }
    }

    private finalizeLevelBuild(): void {
    }

    public bindGameManager(gameManager: GameManager): void {
        this.gameManager = gameManager;
    }

    public updateStateTransitions(): boolean {
        const shouldEnterShopState = this.wasKeyPressedThisFrame("Digit0");

        this.syncInputFrame();

        if (!shouldEnterShopState || !this.gameManager) {
            return false;
        }

        this.gameManager.requestShopState();
        return true;
    }

    private spawnPlayer(levelResult: WorldLevelResult): void {
        const spawn = levelResult.playerSpawns[0];
        const fallbackSpawn = { worldX: 400, worldY: 32 };
        const { worldX, worldY } = spawn
            ? this.tilemapManager.tileToWorld(spawn.x, spawn.y)
            : fallbackSpawn;
        const inventorySnapshot = this.nextPlayerInventorySnapshot;

        if (!spawn) {
            console.warn('No player spawn found in level result. Falling back to the default spawn position.');
        }

        const [playerEntityId] = this.playerComponentStore.getAllEntities();

        if (playerEntityId == null) {
            this.entityFactory.createPlayer(
                worldX,
                worldY,
                this.playerInitialProperties.hp,
                this.playerInitialProperties.velocity,
                WeaponConfig.smg,
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

                this.inventoryComponentStore.add(playerEntityId, nextInventory);

                if (this.healthComponentStore.has(playerEntityId)) {
                    const health = this.healthComponentStore.get(playerEntityId);
                    health.hp = this.playerInitialProperties.hp;
                    health.maxHp = this.playerInitialProperties.hp;
                }

                this.entityFactory.destroyPlayerWeapon(playerEntityId);
                this.entityFactory.createPlayerWeapon(
                    playerEntityId,
                    nextWeaponType,
                    WeaponConfig[nextWeaponType],
                );
            }
        }

        this.nextPlayerInventorySnapshot = null;
        this.cameraManager.follow(worldX, worldY);
    }

    private advanceToNextLevel(): void {
        this.previousLevel = this.levelNumber;
        this.levelNumber = this.previousLevel + 1;
        this.rebuildLevel();
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
}

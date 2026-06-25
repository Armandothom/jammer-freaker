import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world-map/camera-manager.js";
import { WorldMapManager } from "../../game/world-map/world-map-manager.js";
import { WorldEdgeChunkManager } from "../../game/world-map/world-edge-chunk-manager.js";
import { WorldEdgeManager } from "../../game/world-map/world-edge-manager.js";
import { WorldTilemapManager } from "../../game/world-map/world-tilemap-manager.js";
import { UIActionRouter } from "../../ui/input/ui-action-router.js";
import { UIInputSystem } from "../../ui/input/ui-input-system.js";
import { CampStoragePresenter } from "../../ui/presenters/camp-storage.presenter.js";
import { CombatShopPresenter } from "../../ui/presenters/combat-shop.presenter.js";
import { GunsShopPresenter } from "../../ui/presenters/guns-shop.presenter.js";
import { MedicalShopPresenter } from "../../ui/presenters/medical-shop.presenter.js";
import { QuestPresenter } from "../../ui/presenters/quest.presenter.js";
import { WareBuyerPresenter } from "../../ui/presenters/ware-buyer.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { CampStorageScreen } from "../../ui/screens/camp-storage.screen.js";
import { CombatShopScreen } from "../../ui/screens/combat-shop.screen.js";
import { GunsShopScreen } from "../../ui/screens/guns-shop.screen.js";
import { MissionSelectScreen } from "../../ui/screens/mission-select.screen.js";
import { MedicalShopScreen } from "../../ui/screens/medical-shop.screen.js";
import { QuestScreen } from "../../ui/screens/quest.screen.js";
import { ShopHubScreen } from "../../ui/screens/shop-hub.screen.js";
import { WareBuyerScreen } from "../../ui/screens/ware-buyer.screen.js";
import { AIComponent } from "../components/ai.component.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import type { QuestSnapshot } from "../components/snapshots/quest-snapshot.js";
import type { StorageSnapshot } from "../components/snapshots/storage-snapshot.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { GrenadeTravelComponent } from "../components/grenade-travel.component.js";
import { GunDealerComponent } from "../components/gun-dealer-component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { OffsetAppliedComponent } from "../components/offset-applied.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { SpriteClipComponent } from "../components/sprite-clip.component.js";
import { SpriteNineSliceComponent } from "../components/sprite-nine-slice.component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { TransformComponent } from "../components/transform-component.js";
import { GunsShopDialogIntentComponent } from "../components/guns-shop-dialog-intent.component.js";
import { CombatShopInventoryState } from "../components/states/combat-shop-inventory-state.js";
import { CombatShopTabState } from "../components/states/combat-shop-tab-state.js";
import { CampStorageState } from "../components/states/camp-storage-state.js";
import { GunsShopInventoryState } from "../components/states/guns-shop-inventory-state.js";
import { GunsShopTabState } from "../components/states/guns-shop-tab-state.js";
import { GunsShopUpgradeTabState } from "../components/states/guns-shop-upgrade-tab-state.js";
import { MedicalShopInventoryState } from "../components/states/medical-shop-inventory-state.js";
import { MedicalShopTabState } from "../components/states/medical-shop-tab-state.js";
import { QuestState } from "../components/states/quest-state.js";
import { WareBuyerState } from "../components/states/ware-buyer-state.js";
import type { QuestTrader } from "../components/types/quest-config.js";
import { UIRuntimeElementComponent } from "../components/ui-runtime-element.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { CampStorageActionController } from "./camp-storage-action-controller.js";
import { CombatShopActionController } from "./combat-shop-action-controller.js";
import { GUNS_SHOP_DIALOG_FALLBACK_MAX_WIDTH } from "./dialog-text-layout.js";
import { DialogManager } from "./dialog-manager.js";
import { GunsShopActionController } from "./guns-shop-action-controller.js";
import { MedicalShopActionController } from "./medical-shop-action-controller.js";
import { MissionSelectActionController } from "./mission-select-action-controller.js";
import { QuestActionController } from "./quest-action-controller.js";
import { ShopHubActionController } from "./shop-hub-action-controller.js";
import { WareBuyerActionController } from "./ware-buyer-action-controller.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import type { GameManager } from "./game-manager.js";
import { GameState } from "./types/game-state.enum.js";
import { AnimationSetterSystem } from "../systems/animation-setter-system.js";
import { AnimationSpriteSystem } from "../systems/animation-sprite-system.js";
import { CampStorageRuntimeSystem } from "../systems/camp-storage-runtime.system.js";
import { RenderSystem } from "../systems/render-system.js";
import { CombatShopRuntimeSystem } from "../systems/combat-shop-runtime.system.js";
import { GunsShopInteractionDialogSystem } from "../systems/guns-shop-interaction-dialog.system.js";
import { GunsShopRuntimeSystem } from "../systems/guns-shop-runtime.system.js";
import { MedicalShopRuntimeSystem } from "../systems/medical-shop-runtime.system.js";
import { QuestRuntimeSystem } from "../systems/quest-runtime.system.js";
import { UIRuntimeInputSystem } from "../systems/ui-runtime-input.system.js";
import { UIRuntimeSyncSystem } from "../systems/ui-runtime-sync.system.js";
import { WareBuyerRuntimeSystem } from "../systems/ware-buyer-runtime.system.js";
import { WeatherSystem } from "../systems/weather.system.js";
import { DialogEntityFactory } from "../entities/dialog-entity-factory.js";
import { UIRuntimeEntityFactory } from "../entities/ui-runtime-entity-factory.js";

type ActiveShopState =
    | GameState.ShopHubState
    | GameState.CampStorageState
    | GameState.WareBuyerState
    | GameState.MissionSelectState
    | GameState.GunsShopState
    | GameState.MedicalShopState
    | GameState.CombatShopState
    | GameState.QuestState;

export class ShopSystemRunner {
    private worldTilemapManager = new WorldTilemapManager();
    private cameraManager: CameraManager;
    private worldEdgeManager: WorldEdgeManager;
    private worldEdgeChunkManager: WorldEdgeChunkManager;
    private dialogManager: DialogManager;
    private visibilityManager: VisibilityManager;
    private movementIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
    private renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
    private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent> = new ComponentStore("ScreenPositionComponent");
    private spriteClipComponentStore: ComponentStore<SpriteClipComponent> = new ComponentStore("SpriteClipComponent");
    private spriteNineSliceComponentStore: ComponentStore<SpriteNineSliceComponent> = new ComponentStore("SpriteNineSliceComponent");
    private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
    private transformComponentStore: ComponentStore<TransformComponent> = new ComponentStore("TransformComponent");
    private directionAnimComponentStore: ComponentStore<DirectionAnimComponent> = new ComponentStore("DirectionAnimComponent");
    private animationComponentStore: ComponentStore<AnimationComponent> = new ComponentStore("AnimationComponent");
    private awaitingAnimationEndComponentStore: ComponentStore<AwaitingAnimationEndComponent> = new ComponentStore("AwaitingAnimationEndComponent");
    private aiComponentStore: ComponentStore<AIComponent> = new ComponentStore("AIComponent");
    private playerComponentStore: ComponentStore<PlayerComponent> = new ComponentStore("PlayerComponent");
    private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent> = new ComponentStore("AimRotationShootingComponent");
    private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent> = new ComponentStore("WeaponSpriteAttachmentComponent");
    private wallHitComponentStore: ComponentStore<WallHitComponent> = new ComponentStore("WallHitComponent");
    private projectileComponentStore: ComponentStore<ProjectileComponent> = new ComponentStore("ProjectileComponent");
    private offsetAppliedComponentStore: ComponentStore<OffsetAppliedComponent> = new ComponentStore("OffsetAppliedComponent");
    private grenadeComponentStore: ComponentStore<GrenadeComponent> = new ComponentStore("GrenadeComponent");
    private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent> = new ComponentStore("GrenadeExplosionComponent");
    private grenadeTravelComponentStore: ComponentStore<GrenadeTravelComponent> = new ComponentStore("GrenadeTravelComponent");
    private itemBoxComponentStore: ComponentStore<ItemBoxComponent> = new ComponentStore("ItemBoxComponent");
    private zLayerComponentStore: ComponentStore<ZLayerComponent> = new ComponentStore("ZLayerComponent");
    private dialogComponentStore: ComponentStore<DialogComponent> = new ComponentStore("DialogComponent");
    private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent> = new ComponentStore("DialogLifetimeComponent");
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent> = new ComponentStore("DialogBubbleSpriteComponent");
    private dialogAnimComponentStore: ComponentStore<DialogAnimComponent> = new ComponentStore("DialogAnimComponent");
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent> = new ComponentStore("BitmapTextComponent");
    private gunsShopDialogIntentComponentStore: ComponentStore<GunsShopDialogIntentComponent> = new ComponentStore("GunsShopDialogIntentComponent");
    private gunDealerComponentStore: ComponentStore<GunDealerComponent> = new ComponentStore("GunDealerComponent");
    private uiRuntimeElementComponentStore: ComponentStore<UIRuntimeElementComponent> = new ComponentStore("UIRuntimeElementComponent");
    private dialogEntityFactory: DialogEntityFactory;
    private renderSystem: RenderSystem;
    private animationSetterSystem: AnimationSetterSystem;
    private animationSpriteSystem: AnimationSpriteSystem;
    private gunsShopInteractionDialogSystem: GunsShopInteractionDialogSystem;
    private inventorySnapshot: InventorySnapshot | null = null;
    private storageSnapshot: StorageSnapshot | null = null;
    private questSnapshot: QuestSnapshot | null = null;
    private wareBuyerSaleSnapshot: StorageSnapshot | null = null;
    private gunsShopInventoryState: GunsShopInventoryState;
    private gunsShopTabState: GunsShopTabState;
    private gunsShopUpgradeTabState: GunsShopUpgradeTabState;
    private medicalShopInventoryState: MedicalShopInventoryState;
    private medicalShopTabState: MedicalShopTabState;
    private combatShopInventoryState: CombatShopInventoryState;
    private combatShopTabState: CombatShopTabState;
    private campStorageState: CampStorageState;
    private wareBuyerState: WareBuyerState;
    private questState: QuestState;
    private shopHubActionController: ShopHubActionController;
    private campStorageActionController: CampStorageActionController;
    private wareBuyerActionController: WareBuyerActionController;
    private missionSelectActionController: MissionSelectActionController;
    private gunsShopActionController: GunsShopActionController;
    private medicalShopActionController: MedicalShopActionController;
    private combatShopActionController: CombatShopActionController;
    private questActionController: QuestActionController;
    private campStorageRuntimeSystem: CampStorageRuntimeSystem;
    private wareBuyerRuntimeSystem: WareBuyerRuntimeSystem;
    private gunsShopRuntimeSystem: GunsShopRuntimeSystem;
    private medicalShopRuntimeSystem: MedicalShopRuntimeSystem;
    private combatShopRuntimeSystem: CombatShopRuntimeSystem;
    private questRuntimeSystem: QuestRuntimeSystem;
    private uiRuntime: UIRuntime;
    private uiRuntimeInputSystem: UIRuntimeInputSystem;
    private uiRuntimeSyncSystem: UIRuntimeSyncSystem;
    private weatherSystem: WeatherSystem;
    private gameManager: GameManager | null = null;
    private activeShopState: ActiveShopState | null = null;

    constructor(
        private spriteManager: SpriteManager,
        private textManager: TextManager,
        private rendererEngine: RendererEngine,
        private debugManager: DebugManager,
        private entityManager: EntityManager,
        private weatherManager: WeatherManager,
        private worldMapManager: WorldMapManager,
    ) {
        this.gunsShopInventoryState = new GunsShopInventoryState();
        this.gunsShopTabState = new GunsShopTabState();
        this.gunsShopUpgradeTabState = new GunsShopUpgradeTabState();
        this.medicalShopInventoryState = new MedicalShopInventoryState();
        this.medicalShopTabState = new MedicalShopTabState();
        this.combatShopInventoryState = new CombatShopInventoryState();
        this.combatShopTabState = new CombatShopTabState();
        this.campStorageState = new CampStorageState();
        this.wareBuyerState = new WareBuyerState();
        this.questState = new QuestState();
        this.cameraManager = new CameraManager(this.worldTilemapManager);
        this.worldEdgeManager = new WorldEdgeManager(this.worldTilemapManager);
        this.worldEdgeChunkManager = new WorldEdgeChunkManager(
            this.worldTilemapManager,
            this.cameraManager,
            this.worldEdgeManager,
        );
        this.dialogManager = new DialogManager();
        this.uiRuntime = new UIRuntime();
        this.uiRuntime.registerScreen(new ShopHubScreen());
        this.uiRuntime.registerScreen(new CampStorageScreen());
        this.uiRuntime.registerScreen(new WareBuyerScreen());
        this.uiRuntime.registerScreen(new MissionSelectScreen(this.worldMapManager.getMapSummaries()));
        this.uiRuntime.registerScreen(new GunsShopScreen());
        this.uiRuntime.registerScreen(new MedicalShopScreen());
        this.uiRuntime.registerScreen(new CombatShopScreen());
        this.uiRuntime.registerScreen(new QuestScreen());
        this.worldEdgeManager.setEdges();
        this.worldEdgeChunkManager.generateChunks();
        this.visibilityManager = new VisibilityManager(
            this.worldEdgeChunkManager,
            this.worldTilemapManager,
            this.cameraManager,
            this.debugManager,
        );
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2);

        const uiRuntimeEntityFactory = new UIRuntimeEntityFactory(
            this.entityManager,
            this.renderableComponentStore,
            this.screenPositionComponentStore,
            this.spriteComponentStore,
            this.bitmapTextComponentStore,
            this.zLayerComponentStore,
            this.uiRuntimeElementComponentStore,
            this.spriteClipComponentStore,
            this.spriteNineSliceComponentStore,
            this.transformComponentStore,
        );

        this.dialogEntityFactory = new DialogEntityFactory(
            this.entityManager,
            this.renderableComponentStore,
            this.screenPositionComponentStore,
            this.spriteComponentStore,
            this.animationComponentStore,
            this.dialogComponentStore,
            this.dialogLifetimeComponentStore,
            this.dialogBubbleSpriteComponentStore,
            this.bitmapTextComponentStore,
            this.dialogAnimComponentStore,
            this.zLayerComponentStore,
            GUNS_SHOP_DIALOG_FALLBACK_MAX_WIDTH,
        );

        this.renderSystem = new RenderSystem(
            this.renderableComponentStore,
            this.positionComponentStore,
            this.screenPositionComponentStore,
            this.spriteComponentStore,
            this.spriteClipComponentStore,
            this.spriteNineSliceComponentStore,
            this.uiRuntimeElementComponentStore,
            this.cameraManager,
            this.worldTilemapManager,
            this.rendererEngine,
            this.spriteManager,
            this.directionAnimComponentStore,
            this.aimShootingComponentStore,
            this.transformComponentStore,
            this.zLayerComponentStore,
            this.visibilityManager,
            this.debugManager,
            this.dialogBubbleSpriteComponentStore,
            this.bitmapTextComponentStore,
            this.textManager,
            this.grenadeComponentStore,
            this.grenadeExplosionComponentStore,
            this.grenadeTravelComponentStore,
        );
        this.animationSetterSystem = new AnimationSetterSystem(
            this.spriteManager,
            this.movementIntentComponentStore,
            this.positionComponentStore,
            this.directionAnimComponentStore,
            this.animationComponentStore,
            this.aiComponentStore,
            this.playerComponentStore,
            this.aimShootingComponentStore,
            this.weaponSpriteAttachmentComponentStore,
            this.wallHitComponentStore,
            this.projectileComponentStore,
            this.spriteComponentStore,
            this.offsetAppliedComponentStore,
            this.grenadeComponentStore,
            this.grenadeExplosionComponentStore,
            this.itemBoxComponentStore,
            this.awaitingAnimationEndComponentStore,
        );
        this.animationSpriteSystem = new AnimationSpriteSystem(
            this.animationComponentStore,
            this.spriteComponentStore,
            this.awaitingAnimationEndComponentStore,
        );
        this.shopHubActionController = new ShopHubActionController(
            () => this.gameManager?.requestCampStorageState(),
            () => this.gameManager?.requestWareBuyerState(),
            () => this.gameManager?.requestMissionSelectState(),
            () => this.gameManager?.requestGunsShopState(),
            () => this.gameManager?.requestMedicalShopState(),
            () => this.gameManager?.requestCombatShopState(),
        );
        this.campStorageActionController = new CampStorageActionController(
            this.campStorageState,
            () => this.gameManager?.requestShopHubState(),
        );
        this.wareBuyerActionController = new WareBuyerActionController(
            this.wareBuyerState,
            () => this.gameManager?.requestShopHubState(),
        );
        this.missionSelectActionController = new MissionSelectActionController(
            (mapId) => this.gameManager?.requestGameplayState(mapId),
            () => this.gameManager?.requestShopHubState(),
        );
        this.gunsShopActionController = new GunsShopActionController(
            this.entityManager,
            this.gunsShopInventoryState,
            this.gunsShopTabState,
            this.gunsShopUpgradeTabState,
            this.gunsShopDialogIntentComponentStore,
            this.gunDealerComponentStore,
            () => this.gameManager?.requestShopHubState(),
        );
        this.medicalShopActionController = new MedicalShopActionController(
            this.medicalShopInventoryState,
            this.medicalShopTabState,
            () => this.gameManager?.requestShopHubState(),
        );
        this.combatShopActionController = new CombatShopActionController(
            this.combatShopInventoryState,
            this.combatShopTabState,
            () => this.gameManager?.requestShopHubState(),
        );
        this.questActionController = new QuestActionController(
            this.questState,
            (trader) => this.gameManager?.requestQuestState(trader),
            () => this.gameManager?.requestReturnFromQuestState(),
        );
        this.gunsShopInteractionDialogSystem = new GunsShopInteractionDialogSystem(
            this.dialogEntityFactory,
            this.dialogManager,
            this.gunsShopDialogIntentComponentStore,
            this.dialogComponentStore,
            this.dialogLifetimeComponentStore,
        );
        this.gunsShopRuntimeSystem = new GunsShopRuntimeSystem(
            this.uiRuntime,
            new GunsShopPresenter(
                this.gunsShopInventoryState,
                this.gunsShopTabState,
                this.gunsShopUpgradeTabState,
            ),
        );
        this.campStorageRuntimeSystem = new CampStorageRuntimeSystem(
            this.uiRuntime,
            new CampStoragePresenter(this.campStorageState),
        );
        this.wareBuyerRuntimeSystem = new WareBuyerRuntimeSystem(
            this.uiRuntime,
            new WareBuyerPresenter(this.wareBuyerState),
        );
        this.medicalShopRuntimeSystem = new MedicalShopRuntimeSystem(
            this.uiRuntime,
            new MedicalShopPresenter(
                this.medicalShopInventoryState,
                this.medicalShopTabState,
            ),
        );
        this.combatShopRuntimeSystem = new CombatShopRuntimeSystem(
            this.uiRuntime,
            new CombatShopPresenter(
                this.combatShopInventoryState,
                this.combatShopTabState,
            ),
        );
        this.questRuntimeSystem = new QuestRuntimeSystem(
            this.uiRuntime,
            new QuestPresenter(this.questState),
        );
        this.uiRuntimeInputSystem = new UIRuntimeInputSystem(
            new UIInputSystem(this.uiRuntime),
            new UIActionRouter([
                this.shopHubActionController,
                this.campStorageActionController,
                this.wareBuyerActionController,
                this.missionSelectActionController,
                this.gunsShopActionController,
                this.medicalShopActionController,
                this.combatShopActionController,
                this.questActionController,
            ]),
        );
        this.uiRuntimeSyncSystem = new UIRuntimeSyncSystem(this.uiRuntime, uiRuntimeEntityFactory);
        this.weatherSystem = new WeatherSystem(this.weatherManager, this.spriteManager, this.rendererEngine);
    }

    initialize(): void {
        this.rendererEngine.setCanvasCursor("default");
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2);
        this.activeShopState = null;
    }

    update(): void {
        this.rendererEngine.setCanvasCursor("default");
        const currentState = this.gameManager?.getCurrentState();
        if (!currentState || !this.isShopState(currentState)) {
            return;
        }

        this.applyActiveShopState(currentState);
        this.uiRuntimeInputSystem.update(CoreManager.timeSinceLastRender);

        const stateAfterInput = this.gameManager?.getCurrentState();
        if (!stateAfterInput || !this.isShopState(stateAfterInput)) {
            return;
        }

        this.applyActiveShopState(stateAfterInput);
        this.updateActiveShopRuntime(stateAfterInput);
        this.animationSetterSystem.update(CoreManager.timeSinceLastRender);
        this.animationSpriteSystem.update(CoreManager.timeSinceLastRender);
        const viewportSize = this.cameraManager.getViewportSize();
        this.uiRuntime.updateViewport(viewportSize.width, viewportSize.height);
        this.uiRuntimeSyncSystem.update(CoreManager.timeSinceLastRender);
        this.weatherSystem.update(CoreManager.timeSinceLastRender);
        this.renderSystem.update(CoreManager.timeSinceLastRender);
    }

    setInventorySnapshot(inventorySnapshot: InventorySnapshot | null): void {
        this.inventorySnapshot = inventorySnapshot;
        this.gunsShopInventoryState.initializeFromSnapshot(inventorySnapshot);
        this.medicalShopInventoryState.initializeFromSnapshot(inventorySnapshot);
        this.combatShopInventoryState.initializeFromSnapshot(inventorySnapshot);
        this.campStorageState.applyInventorySnapshot(inventorySnapshot);
        this.wareBuyerState.applyInventorySnapshot(inventorySnapshot);
        this.questState.applyInventorySnapshot(inventorySnapshot);
    }

    syncInventorySnapshot(inventorySnapshot: InventorySnapshot | null): void {
        this.inventorySnapshot = inventorySnapshot;
        this.gunsShopInventoryState.applyInventorySnapshot(inventorySnapshot);
        this.medicalShopInventoryState.applyInventorySnapshot(inventorySnapshot);
        this.combatShopInventoryState.applyInventorySnapshot(inventorySnapshot);
        this.campStorageState.applyInventorySnapshot(inventorySnapshot);
        this.wareBuyerState.applyInventorySnapshot(inventorySnapshot);
        this.questState.applyInventorySnapshot(inventorySnapshot);
    }

    setStorageSnapshot(storageSnapshot: StorageSnapshot | null): void {
        this.storageSnapshot = storageSnapshot;
        this.campStorageState.applyStorageSnapshot(storageSnapshot);
        this.wareBuyerState.applyStorageSnapshot(storageSnapshot);
        this.questState.applyStorageSnapshot(storageSnapshot);
    }

    syncStorageSnapshot(storageSnapshot: StorageSnapshot | null): void {
        this.storageSnapshot = storageSnapshot;
        this.campStorageState.applyStorageSnapshot(storageSnapshot);
        this.wareBuyerState.applyStorageSnapshot(storageSnapshot);
        this.questState.applyStorageSnapshot(storageSnapshot);
    }

    setQuestSnapshot(questSnapshot: QuestSnapshot | null): void {
        this.questSnapshot = questSnapshot;
        this.questState.applyQuestSnapshot(questSnapshot);
    }

    syncQuestSnapshot(questSnapshot: QuestSnapshot | null): void {
        this.questSnapshot = questSnapshot;
        this.questState.applyQuestSnapshot(questSnapshot);
    }

    setWareBuyerSaleSnapshot(saleSnapshot: StorageSnapshot | null): void {
        this.wareBuyerSaleSnapshot = saleSnapshot;
        this.wareBuyerState.applySaleSnapshot(saleSnapshot);
    }

    syncWareBuyerSaleSnapshot(saleSnapshot: StorageSnapshot | null): void {
        this.wareBuyerSaleSnapshot = saleSnapshot;
        this.wareBuyerState.applySaleSnapshot(saleSnapshot);
    }

    captureInventorySnapshot(): InventorySnapshot | null {
        const activeState = this.gameManager?.getCurrentState();

        if (activeState === GameState.GunsShopState) {
            this.inventorySnapshot = this.gunsShopInventoryState.createSnapshot();
        } else if (activeState === GameState.MedicalShopState) {
            this.inventorySnapshot = this.medicalShopInventoryState.createSnapshot();
        } else if (activeState === GameState.CombatShopState) {
            this.inventorySnapshot = this.combatShopInventoryState.createSnapshot();
        } else if (activeState === GameState.CampStorageState) {
            this.inventorySnapshot = this.campStorageState.createInventorySnapshot();
        } else if (activeState === GameState.WareBuyerState) {
            this.inventorySnapshot = this.wareBuyerState.createInventorySnapshot();
        } else if (activeState === GameState.QuestState) {
            this.inventorySnapshot = this.questState.createInventorySnapshot();
        }

        return this.inventorySnapshot;
    }

    captureStorageSnapshot(): StorageSnapshot | null {
        const activeState = this.gameManager?.getCurrentState();

        if (activeState === GameState.CampStorageState) {
            this.storageSnapshot = this.campStorageState.createStorageSnapshot();
        } else if (activeState === GameState.WareBuyerState) {
            this.storageSnapshot = this.wareBuyerState.createStorageSnapshot();
        } else if (activeState === GameState.QuestState) {
            this.storageSnapshot = this.questState.createStorageSnapshot();
        }

        return this.storageSnapshot;
    }

    captureQuestSnapshot(): QuestSnapshot {
        this.questSnapshot = this.questState.createQuestSnapshot();

        return this.questSnapshot;
    }

    captureWareBuyerSaleSnapshot(): StorageSnapshot | null {
        const activeState = this.gameManager?.getCurrentState();

        if (activeState === GameState.WareBuyerState) {
            this.wareBuyerSaleSnapshot = this.wareBuyerState.createSaleSnapshot();
        }

        return this.wareBuyerSaleSnapshot;
    }

    bindGameManager(gameManager: GameManager): void {
        this.gameManager = gameManager;
    }

    openQuestForTrader(trader: QuestTrader): void {
        this.questState.openForTrader(trader);
    }

    private applyActiveShopState(state: ActiveShopState): void {
        if (this.activeShopState === state) {
            return;
        }

        this.clearSceneState();
        this.uiRuntimeInputSystem.reset();
        this.uiRuntime.setBaseScreen(this.resolveBaseScreenId(state));
        this.activeShopState = state;

        if (state === GameState.GunsShopState) {
            this.gunsShopActionController.initialize();
        }
    }

    private updateActiveShopRuntime(state: ActiveShopState): void {
        switch (state) {
            case GameState.CampStorageState:
                this.campStorageRuntimeSystem.update(CoreManager.timeSinceLastRender);
                return;

            case GameState.WareBuyerState:
                this.wareBuyerRuntimeSystem.update(CoreManager.timeSinceLastRender);
                return;

            case GameState.GunsShopState:
                this.gunsShopRuntimeSystem.update(CoreManager.timeSinceLastRender);
                this.gunsShopInteractionDialogSystem.update(CoreManager.timeSinceLastRender);
                return;

            case GameState.MedicalShopState:
                this.medicalShopRuntimeSystem.update(CoreManager.timeSinceLastRender);
                return;

            case GameState.CombatShopState:
                this.combatShopRuntimeSystem.update(CoreManager.timeSinceLastRender);
                return;

            case GameState.QuestState:
                this.questRuntimeSystem.update(CoreManager.timeSinceLastRender);
                return;

            case GameState.ShopHubState:
            case GameState.MissionSelectState:
                this.uiRuntime.relayout();
                return;
        }
    }

    private resolveBaseScreenId(state: ActiveShopState): string {
        switch (state) {
            case GameState.GunsShopState:
                return "guns-shop";

            case GameState.MedicalShopState:
                return "medical-shop";

            case GameState.CombatShopState:
                return "combat-shop";

            case GameState.ShopHubState:
                return "shop-hub";

            case GameState.CampStorageState:
                return "camp-storage";

            case GameState.WareBuyerState:
                return "ware-buyer";

            case GameState.MissionSelectState:
                return "mission-select";

            case GameState.QuestState:
                return "quest-screen";
        }
    }

    private isShopState(state: GameState): state is ActiveShopState {
        return state === GameState.ShopHubState
            || state === GameState.CampStorageState
            || state === GameState.WareBuyerState
            || state === GameState.MissionSelectState
            || state === GameState.GunsShopState
            || state === GameState.MedicalShopState
            || state === GameState.CombatShopState
            || state === GameState.QuestState;
    }

    private clearSceneState(): void {
        this.movementIntentComponentStore.clear();
        this.renderableComponentStore.clear();
        this.positionComponentStore.clear();
        this.screenPositionComponentStore.clear();
        this.spriteClipComponentStore.clear();
        this.spriteNineSliceComponentStore.clear();
        this.spriteComponentStore.clear();
        this.transformComponentStore.clear();
        this.directionAnimComponentStore.clear();
        this.animationComponentStore.clear();
        this.awaitingAnimationEndComponentStore.clear();
        this.aiComponentStore.clear();
        this.playerComponentStore.clear();
        this.aimShootingComponentStore.clear();
        this.weaponSpriteAttachmentComponentStore.clear();
        this.wallHitComponentStore.clear();
        this.projectileComponentStore.clear();
        this.offsetAppliedComponentStore.clear();
        this.grenadeComponentStore.clear();
        this.grenadeExplosionComponentStore.clear();
        this.grenadeTravelComponentStore.clear();
        this.itemBoxComponentStore.clear();
        this.zLayerComponentStore.clear();
        this.dialogComponentStore.clear();
        this.dialogLifetimeComponentStore.clear();
        this.dialogBubbleSpriteComponentStore.clear();
        this.dialogAnimComponentStore.clear();
        this.bitmapTextComponentStore.clear();
        this.gunsShopDialogIntentComponentStore.clear();
        this.uiRuntimeElementComponentStore.clear();
        this.gunDealerComponentStore.clear();
        this.gunsShopActionController.reset();
        this.uiRuntimeSyncSystem.reset();
    }

    reset(): void {
        this.clearSceneState();
        this.inventorySnapshot = null;
        this.storageSnapshot = null;
        this.questSnapshot = null;
        this.wareBuyerSaleSnapshot = null;
        this.gunsShopInventoryState.reset();
        this.gunsShopTabState.reset();
        this.gunsShopUpgradeTabState.reset();
        this.medicalShopInventoryState.reset();
        this.medicalShopTabState.reset();
        this.combatShopInventoryState.reset();
        this.combatShopTabState.reset();
        this.campStorageState.reset();
        this.wareBuyerState.reset();
        this.questState.reset();
        this.uiRuntimeInputSystem.reset();
        this.uiRuntime.reset();
        this.activeShopState = null;
    }
}

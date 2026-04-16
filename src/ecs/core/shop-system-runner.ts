import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { UIActionRouter } from "../../ui/input/ui-action-router.js";
import { UIInputSystem } from "../../ui/input/ui-input-system.js";
import { ShopPresenter } from "../../ui/presenters/shop.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { ShopScreen } from "../../ui/screens/shop.screen.js";
import { AIComponent } from "../components/ai.component.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
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
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ShopDialogIntentComponent } from "../components/shop-dialog-intent.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../components/states/shop-upgrade-tab-state.js";
import { UIRuntimeElementComponent } from "../components/ui-runtime-element.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { SHOP_DIALOG_FALLBACK_MAX_WIDTH } from "./dialog-text-layout.js";
import { DialogManager } from "./dialog-manager.js";
import { ShopActionController } from "./shop-action-controller.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import type { GameManager } from "./game-manager.js";
import { GameState } from "./types/game-state.enum.js";
import { AnimationSetterSystem } from "../systems/animation-setter-system.js";
import { AnimationSpriteSystem } from "../systems/animation-sprite-system.js";
import { RenderSystem } from "../systems/render-system.js";
import { ShopInteractionDialogSystem } from "../systems/shop-interaction-dialog.system.js";
import { ShopRuntimeSystem } from "../systems/shop-runtime.system.js";
import { UIRuntimeInputSystem } from "../systems/ui-runtime-input.system.js";
import { UIRuntimeSyncSystem } from "../systems/ui-runtime-sync.system.js";
import { WeatherSystem } from "../systems/weather.system.js";
import { DialogEntityFactory } from "../entities/dialog-entity-factory.js";
import { UIRuntimeEntityFactory } from "../entities/ui-runtime-entity-factory.js";

export class ShopSystemRunner {
    private worldTilemapManager = new WorldTilemapManager();
    private cameraManager: CameraManager;
    private dialogManager: DialogManager;
    private visibilityManager: VisibilityManager;
    private movementIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
    private renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
    private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent> = new ComponentStore("ScreenPositionComponent");
    private spriteClipComponentStore: ComponentStore<SpriteClipComponent> = new ComponentStore("SpriteClipComponent");
    private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
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
    private shopDialogIntentComponentStore: ComponentStore<ShopDialogIntentComponent> = new ComponentStore("ShopDialogIntentComponent");
    private gunDealerComponentStore: ComponentStore<GunDealerComponent> = new ComponentStore("GunDealerComponent");
    private uiRuntimeElementComponentStore: ComponentStore<UIRuntimeElementComponent> = new ComponentStore("UIRuntimeElementComponent");
    private dialogEntityFactory: DialogEntityFactory;
    private renderSystem: RenderSystem;
    private animationSetterSystem: AnimationSetterSystem;
    private animationSpriteSystem: AnimationSpriteSystem;
    private shopInteractionDialogSystem: ShopInteractionDialogSystem;
    private inventorySnapshot: InventorySnapshot | null = null;
    private shopInventoryState: ShopInventoryState;
    private shopTabState: ShopTabState;
    private shopUpgradeTabState: ShopUpgradeTabState;
    private shopActionController: ShopActionController;
    private shopRuntimeSystem: ShopRuntimeSystem;
    private uiRuntime: UIRuntime;
    private uiRuntimeInputSystem: UIRuntimeInputSystem;
    private uiRuntimeSyncSystem: UIRuntimeSyncSystem;
    private weatherSystem: WeatherSystem;
    private gameManager: GameManager | null = null;

    constructor(
        private spriteManager: SpriteManager,
        private textManager: TextManager,
        private rendererEngine: RendererEngine,
        private debugManager: DebugManager,
        private entityManager: EntityManager,
        private weatherManager: WeatherManager,
    ) {
        this.shopInventoryState = new ShopInventoryState();
        this.shopTabState = new ShopTabState();
        this.shopUpgradeTabState = new ShopUpgradeTabState();
        this.cameraManager = new CameraManager(this.worldTilemapManager);
        this.dialogManager = new DialogManager();
        this.uiRuntime = new UIRuntime();
        this.uiRuntime.registerScreen(new ShopScreen());
        this.uiRuntime.setBaseScreen("shop");
        this.visibilityManager = new VisibilityManager();
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
            SHOP_DIALOG_FALLBACK_MAX_WIDTH,
        );

        this.renderSystem = new RenderSystem(
            this.renderableComponentStore,
            this.positionComponentStore,
            this.screenPositionComponentStore,
            this.spriteComponentStore,
            this.spriteClipComponentStore,
            this.uiRuntimeElementComponentStore,
            this.cameraManager,
            this.worldTilemapManager,
            this.rendererEngine,
            this.spriteManager,
            this.directionAnimComponentStore,
            this.aimShootingComponentStore,
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
        this.shopActionController = new ShopActionController(
            this.entityManager,
            this.shopInventoryState,
            this.shopTabState,
            this.shopUpgradeTabState,
            this.shopDialogIntentComponentStore,
            this.gunDealerComponentStore,
            () => this.gameManager?.requestGameplayState(),
        );
        this.shopInteractionDialogSystem = new ShopInteractionDialogSystem(
            this.dialogEntityFactory,
            this.dialogManager,
            this.shopDialogIntentComponentStore,
            this.dialogComponentStore,
            this.dialogLifetimeComponentStore,
        );
        this.shopRuntimeSystem = new ShopRuntimeSystem(
            this.uiRuntime,
            new ShopPresenter(
                this.shopInventoryState,
                this.shopTabState,
                this.shopUpgradeTabState,
            ),
        );
        this.uiRuntimeInputSystem = new UIRuntimeInputSystem(
            new UIInputSystem(this.uiRuntime),
            new UIActionRouter([this.shopActionController]),
        );
        this.uiRuntimeSyncSystem = new UIRuntimeSyncSystem(this.uiRuntime, uiRuntimeEntityFactory);
        this.weatherSystem = new WeatherSystem(this.weatherManager, this.spriteManager, this.rendererEngine);
    }

    initialize(): void {
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2);
        this.shopActionController.initialize();
    }

    update(): void {
        this.uiRuntimeInputSystem.update(CoreManager.timeSinceLastRender);

        if (this.gameManager?.getCurrentState() !== GameState.ShopState) {
            return;
        }

        this.shopRuntimeSystem.update(CoreManager.timeSinceLastRender);
        this.shopInteractionDialogSystem.update(CoreManager.timeSinceLastRender);
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
        this.shopInventoryState.initializeFromSnapshot(inventorySnapshot);
    }

    captureInventorySnapshot(): InventorySnapshot | null {
        return this.shopInventoryState.createSnapshot();
    }

    bindGameManager(gameManager: GameManager): void {
        this.gameManager = gameManager;
    }

    reset(): void {
        this.movementIntentComponentStore.clear();
        this.renderableComponentStore.clear();
        this.positionComponentStore.clear();
        this.screenPositionComponentStore.clear();
        this.spriteClipComponentStore.clear();
        this.spriteComponentStore.clear();
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
        this.shopDialogIntentComponentStore.clear();
        this.uiRuntimeElementComponentStore.clear();
        this.gunDealerComponentStore.clear();
        this.inventorySnapshot = null;
        this.shopInventoryState.reset();
        this.shopTabState.reset();
        this.shopUpgradeTabState.reset();
        this.shopActionController.reset();
        this.uiRuntimeInputSystem.reset();
        this.uiRuntime.clearOverlays();
        this.uiRuntimeSyncSystem.reset();
    }
}

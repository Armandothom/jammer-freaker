import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { ButtonClickIntentComponent } from "../components/button-click-intent.component.js";
import { ClickableRegionComponent } from "../components/clickable-region-component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { PositionComponent } from "../components/position.component.js";
import { ResourceShopItemComponent } from "../components/resource-shop-item.component.js";
import { RegionClickedComponent } from "../components/region-clicked-component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { ShopButtonComponent } from "../components/shop-button-component.js";
import { ShopTabButtonComponent } from "../components/shop-tab-button.component.js";
import { ShopUIAnchorComponent } from "../components/shop-ui-anchor.component.js";
import { ShopUIComponent } from "../components/shop-ui-component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { WeaponShopItemComponent } from "../components/weapon-shop-item.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ShopEntityFactory } from "../entities/shop-entity-factory.js";
import { ButtonClickProcessingSystem } from "../systems/button-click-processing.system.js";
import { ClickableRegionDetectionSystem } from "../systems/clickable-region-detection.system.js";
import { RenderSystem } from "../systems/render-system.js";
import { ShopUIUpdateSystem } from "../systems/shop-ui-update-system.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import type { GameManager } from "./game-manager.js";
import { ShopManager } from "./shop-manager.js";
import { GameState } from "./types/game-state.enum.js";
import { UIManager } from "./ui-manager.js";

export class ShopSystemRunner {
    private worldTilemapManager = new WorldTilemapManager();
    private cameraManager: CameraManager;
    private visibilityManager: VisibilityManager;
    private uiManager: UIManager;
    private renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
    private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent> = new ComponentStore("ScreenPositionComponent");
    private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
    private directionAnimComponentStore: ComponentStore<DirectionAnimComponent> = new ComponentStore("DirectionAnimComponent");
    private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent> = new ComponentStore("AimRotationShootingComponent");
    private zLayerComponentStore: ComponentStore<ZLayerComponent> = new ComponentStore("ZLayerComponent");
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent> = new ComponentStore("DialogBubbleSpriteComponent");
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent> = new ComponentStore("BitmapTextComponent");
    private shopUIComponentStore: ComponentStore<ShopUIComponent> = new ComponentStore("ShopUIComponent");
    private shopUIAnchorComponentStore: ComponentStore<ShopUIAnchorComponent> = new ComponentStore("ShopUIAnchorComponent");
    private clickableRegionComponentStore: ComponentStore<ClickableRegionComponent> = new ComponentStore("ClickableRegionComponent");
    private regionClickedComponentStore: ComponentStore<RegionClickedComponent> = new ComponentStore("RegionClickedComponent");
    private weaponShopItemComponentStore: ComponentStore<WeaponShopItemComponent> = new ComponentStore("WeaponShopItemComponent");
    private resourceShopItemComponentStore: ComponentStore<ResourceShopItemComponent> = new ComponentStore("ResourceShopItemComponent");
    private shopButtonComponentStore: ComponentStore<ShopButtonComponent> = new ComponentStore("ShopButtonComponent");
    private buttonClickIntentComponentStore: ComponentStore<ButtonClickIntentComponent> = new ComponentStore("ButtonClickIntentComponent");
    private shopTabButtonComponentStore: ComponentStore<ShopTabButtonComponent> = new ComponentStore("ShopTabButtonComponent");
    private parentEntityComponentStore: ComponentStore<ParentEntityComponent> = new ComponentStore("ParentEntityComponent");
    private shopEntityFactory: ShopEntityFactory;
    private renderSystem: RenderSystem;
    private shopUIUpdateSystem: ShopUIUpdateSystem;
    private clickableRegionDetectionSystem: ClickableRegionDetectionSystem;
    private buttonClickProcessingSystem: ButtonClickProcessingSystem;
    private inventorySnapshot: InventorySnapshot | null = null;
    private shopInventoryState: ShopInventoryState;
    private shopTabState: ShopTabState;
    private shopManager: ShopManager;
    private gameManager: GameManager | null = null;

    constructor(
        private spriteManager: SpriteManager,
        private textManager: TextManager,
        private rendererEngine: RendererEngine,
        private debugManager: DebugManager,
        private entityManager: EntityManager,
    ) {
        this.shopInventoryState = new ShopInventoryState();
        this.shopTabState = new ShopTabState();
        this.cameraManager = new CameraManager(this.worldTilemapManager);
        this.uiManager = new UIManager(this.cameraManager);
        this.visibilityManager = new VisibilityManager();
        this.shopEntityFactory = new ShopEntityFactory(this.entityManager, this.uiManager, this.renderableComponentStore, this.spriteComponentStore, this.zLayerComponentStore, this.screenPositionComponentStore, this.shopUIComponentStore, this.shopUIAnchorComponentStore, this.clickableRegionComponentStore, this.regionClickedComponentStore, this.bitmapTextComponentStore, this.weaponShopItemComponentStore, this.resourceShopItemComponentStore, this.shopButtonComponentStore, this.shopTabButtonComponentStore, this.parentEntityComponentStore);
        this.shopManager = new ShopManager(this.shopEntityFactory, this.shopInventoryState, this.shopTabState, this.uiManager);
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2,);
        this.renderSystem = new RenderSystem(this.renderableComponentStore, this.positionComponentStore, this.screenPositionComponentStore, this.spriteComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager, this.directionAnimComponentStore, this.aimShootingComponentStore, this.zLayerComponentStore, this.visibilityManager, this.debugManager, this.dialogBubbleSpriteComponentStore, this.bitmapTextComponentStore, this.textManager);
        this.shopUIUpdateSystem = new ShopUIUpdateSystem(this.shopManager);
        this.clickableRegionDetectionSystem = new ClickableRegionDetectionSystem(this.clickableRegionComponentStore, this.spriteComponentStore, this.buttonClickIntentComponentStore);
        this.buttonClickProcessingSystem = new ButtonClickProcessingSystem(
            this.shopManager,
            this.shopEntityFactory,
            this.shopInventoryState,
            this.shopTabState,
            this.buttonClickIntentComponentStore,
            this.shopUIComponentStore,
            this.spriteComponentStore,
            this.shopButtonComponentStore,
            this.weaponShopItemComponentStore,
            this.resourceShopItemComponentStore,
            this.shopTabButtonComponentStore,
            this.parentEntityComponentStore,
            () => this.gameManager?.requestGameplayState(),
        );
    }

    initialize(): void {
        this.cameraManager.follow(
            this.worldTilemapManager.worldWidth / 2,
            this.worldTilemapManager.worldHeight / 2,
        );
    }

    update(): void {
        this.shopUIUpdateSystem.update(CoreManager.timeSinceLastRender);
        this.clickableRegionDetectionSystem.update(CoreManager.timeSinceLastRender);
        this.buttonClickProcessingSystem.update(CoreManager.timeSinceLastRender);

        if (this.gameManager?.getCurrentState() !== GameState.ShopState) {
            return;
        }

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
        this.renderableComponentStore.clear();
        this.positionComponentStore.clear();
        this.screenPositionComponentStore.clear();
        this.spriteComponentStore.clear();
        this.directionAnimComponentStore.clear();
        this.aimShootingComponentStore.clear();
        this.zLayerComponentStore.clear();
        this.dialogBubbleSpriteComponentStore.clear();
        this.bitmapTextComponentStore.clear();
        this.shopUIComponentStore.clear();
        this.shopUIAnchorComponentStore.clear();
        this.clickableRegionComponentStore.clear();
        this.regionClickedComponentStore.clear();
        this.weaponShopItemComponentStore.clear();
        this.resourceShopItemComponentStore.clear();
        this.shopButtonComponentStore.clear();
        this.buttonClickIntentComponentStore.clear();
        this.shopTabButtonComponentStore.clear();
        this.parentEntityComponentStore.clear();
        this.inventorySnapshot = null;
        this.shopInventoryState.reset();
        this.shopTabState.reset();
        this.shopManager.reset();
        this.shopUIUpdateSystem.reset();
    }
}

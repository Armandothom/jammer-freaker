import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AIComponent } from "../components/ai.component.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { ButtonClickIntentComponent } from "../components/button-click-intent.component.js";
import { ClickableRegionComponent } from "../components/clickable-region-component.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { GunDealerComponent } from "../components/gun-dealer-component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { OffsetAppliedComponent } from "../components/offset-applied.component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { RegionClickedComponent } from "../components/region-clicked-component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ResourceShopItemComponent } from "../components/resource-shop-item.component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { ShopButtonComponent } from "../components/shop-button-component.js";
import { ShopDialogIntentComponent } from "../components/shop-dialog-intent.component.js";
import { ShopTabButtonComponent } from "../components/shop-tab-button.component.js";
import { ShopUIAnchorComponent } from "../components/shop-ui-anchor.component.js";
import { ShopUIComponent } from "../components/shop-ui-component.js";
import { ShopUpgradeTabButtonComponent } from "../components/shop-upgrade-tab-button-component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ShopInventoryState } from "../components/states/shop-inventory-state.js";
import { ShopTabState } from "../components/states/shop-tab-state.js";
import { ShopUpgradeTabState } from "../components/states/shop-upgrade-tab-state.js";
import { UpgradeShopItemComponent } from "../components/upgrade-shop-item-component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponShopItemComponent } from "../components/weapon-shop-item.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { DialogManager } from "../core/dialog-manager.js";
import { ShopEntityFactory } from "../entities/shop-entity-factory.js";
import { AnimationSetterSystem } from "../systems/animation-setter-system.js";
import { AnimationSpriteSystem } from "../systems/animation-sprite-system.js";
import { ButtonClickProcessingSystem } from "../systems/button-click-processing.system.js";
import { ClickableRegionDetectionSystem } from "../systems/clickable-region-detection.system.js";
import { RenderSystem } from "../systems/render-system.js";
import { ShopInteractionDialogSystem } from "../systems/shop-interaction-dialog.system.js";
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
    private dialogManager: DialogManager;
    private visibilityManager: VisibilityManager;
    private uiManager: UIManager;
    private movementIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
    private renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
    private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
    private screenPositionComponentStore: ComponentStore<ScreenPositionComponent> = new ComponentStore("ScreenPositionComponent");
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
    private itemBoxComponentStore: ComponentStore<ItemBoxComponent> = new ComponentStore("ItemBoxComponent");
    private zLayerComponentStore: ComponentStore<ZLayerComponent> = new ComponentStore("ZLayerComponent");
    private dialogComponentStore: ComponentStore<DialogComponent> = new ComponentStore("DialogComponent");
    private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent> = new ComponentStore("DialogLifetimeComponent");
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent> = new ComponentStore("DialogBubbleSpriteComponent");
    private dialogAnimComponentStore: ComponentStore<DialogAnimComponent> = new ComponentStore("DialogAnimComponent");
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent> = new ComponentStore("BitmapTextComponent");
    private shopDialogIntentComponentStore: ComponentStore<ShopDialogIntentComponent> = new ComponentStore("ShopDialogIntentComponent");
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
    private gunDealerComponentStore: ComponentStore<GunDealerComponent> = new ComponentStore("GunDealerComponent");
    private shopUpgradeTabButtonComponentStore: ComponentStore<ShopUpgradeTabButtonComponent> = new ComponentStore("ShopUpgradeTabButtonComponent");
    private upgradeShopItemComponent: ComponentStore<UpgradeShopItemComponent> = new ComponentStore("UpgradeShopItemComponent");
    private shopEntityFactory: ShopEntityFactory;
    private renderSystem: RenderSystem;
    private shopUIUpdateSystem: ShopUIUpdateSystem;
    private clickableRegionDetectionSystem: ClickableRegionDetectionSystem;
    private buttonClickProcessingSystem: ButtonClickProcessingSystem;
    private animationSetterSystem: AnimationSetterSystem;
    private animationSpriteSystem: AnimationSpriteSystem;
    private shopInteractionDialogSystem: ShopInteractionDialogSystem;
    private inventorySnapshot: InventorySnapshot | null = null;
    private shopInventoryState: ShopInventoryState;
    private shopTabState: ShopTabState;
    private shopUpgradeTabState: ShopUpgradeTabState;
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
        this.shopUpgradeTabState = new ShopUpgradeTabState();
        this.cameraManager = new CameraManager(this.worldTilemapManager);
        this.dialogManager = new DialogManager();
        this.uiManager = new UIManager(this.cameraManager);
        this.visibilityManager = new VisibilityManager();
        this.shopEntityFactory = new ShopEntityFactory(this.entityManager, this.uiManager, this.renderableComponentStore, this.spriteComponentStore, this.zLayerComponentStore, this.screenPositionComponentStore, this.shopUIComponentStore, this.shopUIAnchorComponentStore, this.clickableRegionComponentStore, this.regionClickedComponentStore, this.bitmapTextComponentStore, this.weaponShopItemComponentStore, this.resourceShopItemComponentStore, this.shopButtonComponentStore, this.shopTabButtonComponentStore, this.parentEntityComponentStore, this.dialogComponentStore, this.dialogLifetimeComponentStore, this.dialogBubbleSpriteComponentStore, this.dialogAnimComponentStore, this.animationComponentStore, this.shopDialogIntentComponentStore, this.gunDealerComponentStore, this.shopUpgradeTabButtonComponentStore, this.upgradeShopItemComponent);
        this.shopManager = new ShopManager(this.shopEntityFactory, this.shopInventoryState, this.shopTabState, this.shopUpgradeTabState, this.uiManager, this.bitmapTextComponentStore);
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2);
        this.renderSystem = new RenderSystem(this.renderableComponentStore, this.positionComponentStore, this.screenPositionComponentStore, this.spriteComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager, this.directionAnimComponentStore, this.aimShootingComponentStore, this.zLayerComponentStore, this.visibilityManager, this.debugManager, this.dialogBubbleSpriteComponentStore, this.bitmapTextComponentStore, this.textManager);
        this.shopUIUpdateSystem = new ShopUIUpdateSystem(this.shopManager);
        this.animationSetterSystem = new AnimationSetterSystem(this.spriteManager, this.movementIntentComponentStore, this.positionComponentStore, this.directionAnimComponentStore, this.animationComponentStore, this.aiComponentStore, this.playerComponentStore, this.aimShootingComponentStore, this.weaponSpriteAttachmentComponentStore, this.wallHitComponentStore, this.projectileComponentStore, this.spriteComponentStore, this.offsetAppliedComponentStore, this.grenadeComponentStore, this.grenadeExplosionComponentStore, this.itemBoxComponentStore, this.awaitingAnimationEndComponentStore);
        this.animationSpriteSystem = new AnimationSpriteSystem(this.animationComponentStore, this.spriteComponentStore, this.awaitingAnimationEndComponentStore);
        this.clickableRegionDetectionSystem = new ClickableRegionDetectionSystem(this.clickableRegionComponentStore, this.spriteComponentStore, this.buttonClickIntentComponentStore);
        this.buttonClickProcessingSystem = new ButtonClickProcessingSystem(this.shopManager, this.shopEntityFactory, this.shopInventoryState, this.shopTabState, this.shopUpgradeTabState, this.buttonClickIntentComponentStore, this.shopUIComponentStore, this.spriteComponentStore, this.shopButtonComponentStore, this.weaponShopItemComponentStore, this.resourceShopItemComponentStore, this.shopTabButtonComponentStore, this.parentEntityComponentStore, this.gunDealerComponentStore, this.shopDialogIntentComponentStore, this.upgradeShopItemComponent, this.shopUpgradeTabButtonComponentStore, () => this.gameManager?.requestGameplayState());
        this.shopInteractionDialogSystem = new ShopInteractionDialogSystem(this.shopEntityFactory, this.dialogManager, this.shopDialogIntentComponentStore, this.dialogComponentStore, this.dialogLifetimeComponentStore);
    }

    initialize(): void {
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2);
    }

    update(): void {
        this.shopUIUpdateSystem.update(CoreManager.timeSinceLastRender);
        this.clickableRegionDetectionSystem.update(CoreManager.timeSinceLastRender);
        this.buttonClickProcessingSystem.update(CoreManager.timeSinceLastRender);

        if (this.gameManager?.getCurrentState() !== GameState.ShopState) {
            return;
        }

        this.shopInteractionDialogSystem.update(CoreManager.timeSinceLastRender);
        this.animationSetterSystem.update(CoreManager.timeSinceLastRender);
        this.animationSpriteSystem.update(CoreManager.timeSinceLastRender);
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
        this.itemBoxComponentStore.clear();
        this.zLayerComponentStore.clear();
        this.dialogComponentStore.clear();
        this.dialogLifetimeComponentStore.clear();
        this.dialogBubbleSpriteComponentStore.clear();
        this.dialogAnimComponentStore.clear();
        this.bitmapTextComponentStore.clear();
        this.shopDialogIntentComponentStore.clear();
        this.shopUIComponentStore.clear();
        this.shopUIAnchorComponentStore.clear();
        this.clickableRegionComponentStore.clear();
        this.regionClickedComponentStore.clear();
        this.weaponShopItemComponentStore.clear();
        this.resourceShopItemComponentStore.clear();
        this.shopButtonComponentStore.clear();
        this.buttonClickIntentComponentStore.clear();
        this.shopTabButtonComponentStore.clear();
        this.shopUpgradeTabButtonComponentStore.clear();
        this.upgradeShopItemComponent.clear();
        this.parentEntityComponentStore.clear();
        this.gunDealerComponentStore.clear();
        this.inventorySnapshot = null;
        this.shopInventoryState.reset();
        this.shopTabState.reset();
        this.shopUpgradeTabState.reset();
        this.shopManager.reset();
        this.shopUIUpdateSystem.reset();
    }
}

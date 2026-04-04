import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { PositionComponent } from "../components/position.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { RenderSystem } from "../systems/render-system.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { DebugManager } from "./debug-manager.js";

export class ShopSystemRunner {
    private readonly worldTilemapManager = new WorldTilemapManager();
    private readonly cameraManager: CameraManager;
    private readonly visibilityManager: VisibilityManager;
    private readonly renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
    private readonly positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
    private readonly screenPositionComponentStore: ComponentStore<ScreenPositionComponent> = new ComponentStore("ScreenPositionComponent");
    private readonly spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
    private readonly directionAnimComponentStore: ComponentStore<DirectionAnimComponent> = new ComponentStore("DirectionAnimComponent");
    private readonly aimShootingComponentStore: ComponentStore<AimRotationShootingComponent> = new ComponentStore("AimRotationShootingComponent");
    private readonly zLayerComponentStore: ComponentStore<ZLayerComponent> = new ComponentStore("ZLayerComponent");
    private readonly dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent> = new ComponentStore("DialogBubbleSpriteComponent");
    private readonly bitmapTextComponentStore: ComponentStore<BitmapTextComponent> = new ComponentStore("BitmapTextComponent");
    private readonly renderSystem: RenderSystem;
    private inventorySnapshot: InventorySnapshot | null = null;

    constructor(
        private spriteManager: SpriteManager,
        private textManager: TextManager,
        private rendererEngine: RendererEngine,
        private debugManager: DebugManager,
    ) {
        this.cameraManager = new CameraManager(this.worldTilemapManager);
        this.visibilityManager = new VisibilityManager();
        this.cameraManager.follow(this.worldTilemapManager.worldWidth / 2, this.worldTilemapManager.worldHeight / 2,);
        this.renderSystem = new RenderSystem(this.renderableComponentStore, this.positionComponentStore, this.screenPositionComponentStore, this.spriteComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager, this.directionAnimComponentStore, this.aimShootingComponentStore, this.zLayerComponentStore, this.visibilityManager, this.debugManager, this.dialogBubbleSpriteComponentStore, this.bitmapTextComponentStore, this.textManager,);
    }

    initialize(): void {
        this.cameraManager.follow(
            this.worldTilemapManager.worldWidth / 2,
            this.worldTilemapManager.worldHeight / 2,
        ); // sets camera do the center of the world
    }

    update(): void {
        this.renderSystem.update(CoreManager.timeSinceLastRender);
    }

    setInventorySnapshot(inventorySnapshot: InventorySnapshot | null): void {
        this.inventorySnapshot = inventorySnapshot;
    }
}

import { AssetManager } from "../../game/asset-manager/asset-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { CollisionComponent } from "../components/collision-component.js";
import { EntityNameComponent } from "../components/entity-name.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { CollisionSystem } from "../systems/collision-system.js";
import { InputClickSystem } from "../systems/input-click.system.js";
import { InputMovementSystem } from "../systems/input-movement.system.js";
import { MovementSystem } from "../systems/movement-system.js";
import { ProjectileSpawnSystem } from "../systems/projectile-spawn.system.js";
import { RenderSystem } from "../systems/render-system.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { EntityManager } from "./entity-manager.js";

export class SystemRunner {
  private renderSystem: RenderSystem;
  private cameraManager: CameraManager;
  private entityNameComponentStore: ComponentStore<EntityNameComponent> = new ComponentStore();
  private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore();
  private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore();
  private collisionComponentStore: ComponentStore<CollisionComponent> = new ComponentStore();
  private movimentIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore();
  private playerComponentStore: ComponentStore<PlayerComponent> = new ComponentStore();
  private inputMovementSystem: InputMovementSystem;
  private inputClickSystem: InputClickSystem;
  private projectileSpawnSystem: ProjectileSpawnSystem;
  private collisionSystem: CollisionSystem;
  private movementSystem: MovementSystem;
  private entityFactory : EntityFactory;


  constructor(
    private worldTilemapManager: WorldTilemapManager,
    private spriteManager: SpriteManager,
    private entityManager: EntityManager,
    private rendererEngine: RendererEngine
  ) {
    this.cameraManager = new CameraManager(this.worldTilemapManager)
    this.renderSystem = new RenderSystem(this.positionComponentStore, this.spriteComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager);
    this.inputMovementSystem = new InputMovementSystem(this.positionComponentStore, this.movimentIntentComponentStore)
    this.inputClickSystem = new InputClickSystem();
    this.projectileSpawnSystem = new ProjectileSpawnSystem(this.inputClickSystem, this.spriteManager, this.entityNameComponentStore, this.positionComponentStore, this.movimentIntentComponentStore, this.entityManager)
    this.collisionSystem = new CollisionSystem(this.spriteComponentStore, this.positionComponentStore, this.collisionComponentStore, this.movimentIntentComponentStore, this.spriteManager);
    this.movementSystem = new MovementSystem(this.positionComponentStore, this.movimentIntentComponentStore);
    this.entityFactory = new EntityFactory(entityManager, this.playerComponentStore, this.positionComponentStore, this.spriteComponentStore);
  }

  update() {
    this.inputMovementSystem.update(CoreManager.timeSinceLastRender);
    this.inputClickSystem.update(CoreManager.timeSinceLastRender); // might be used for shooting? not sure if we can merge in inputMovementSystem
    this.projectileSpawnSystem.update(CoreManager.timeSinceLastRender);
    this.collisionSystem.update(CoreManager.timeSinceLastRender);
    this.movementSystem.update(CoreManager.timeSinceLastRender)
    this.renderSystem.update(CoreManager.timeSinceLastRender);
  }

  initialize() {
    this.entityFactory.createPlayer(30, 30);
  }
}
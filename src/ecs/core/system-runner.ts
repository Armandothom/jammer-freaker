import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { AnimationComponent } from "../components/animation.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SoldierComponent } from "../components/soldier.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { AnimationSetterSystem } from "../systems/animation-setter-system.js";
import { AnimationSpriteSystem } from "../systems/animation-sprite-system.js";
import { CollisionSystem } from "../systems/collision-system.js";
import { ShootingSystem } from "../systems/shooting-system.js";
import { InputMovementSystem } from "../systems/input-movement.system.js";
import { MovementSystem } from "../systems/movement-system.js";
import { ProjectileSpawnSystem } from "../systems/projectile-spawn.system.js";
import { ProjectileUpdateSystem } from "../systems/projectile-update.system.js";
import { RenderSystem } from "../systems/render-system.js";
import { TerminatorSystem } from "../systems/terminator-system.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { EntityManager } from "./entity-manager.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { IntentShootingComponent } from "../components/intentShootingComponentStore.js";

export class SystemRunner {
  private renderSystem: RenderSystem;
  private cameraManager: CameraManager;
  private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
  private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
  private collisionComponentStore: ComponentStore<CollisionComponent> = new ComponentStore("CollisionComponent");
  private movimentIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
  private playerComponentStore: ComponentStore<PlayerComponent> = new ComponentStore("PlayerComponent");
  private projectileComponentStore: ComponentStore<ProjectileComponent> = new ComponentStore("ProjectileComponent");
  private projectileShooterComponentStore: ComponentStore<ProjectileShooterIntentComponent> = new ComponentStore("ProjectileShooterIntentComponent");
  private velocityComponentStore: ComponentStore<VelocityComponent> = new ComponentStore("VelocityComponent");
  private intentClickComponentStore: ComponentStore<IntentClickComponent> = new ComponentStore("IntentClickComponent");
  private directionAnimComponentStore: ComponentStore<DirectionAnimComponent> = new ComponentStore("DirectionAnimComponent");
  private soldierComponentStore: ComponentStore<SoldierComponent> = new ComponentStore("SoldierComponent");
  private animationComponentStore: ComponentStore<AnimationComponent> = new ComponentStore("AnimationComponent");
  private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent> = new ComponentStore("ShootingCooldownComponent");
  private enemyComponentStore: ComponentStore<EnemyComponent> = new ComponentStore("EnemyComponent");
  private intentShootingComponentStore: ComponentStore<IntentShootingComponent> = new ComponentStore("IntentShootingComponent");
  private shooterComponentStore: ComponentStore<ShooterComponent> = new ComponentStore("ShooterComponent");
  private animationSpriteSystem: AnimationSpriteSystem;
  private inputMovementSystem: InputMovementSystem;
  private shootingSystem: ShootingSystem;
  private projectileSpawnSystem: ProjectileSpawnSystem;
  private collisionSystem: CollisionSystem;
  private movementSystem: MovementSystem;
  private animationSetterSystem: AnimationSetterSystem;
  private terminatorSystem: TerminatorSystem;
  private projectileUpdateSystem: ProjectileUpdateSystem;
  private entityFactory: EntityFactory;

  constructor(
    private worldTilemapManager: WorldTilemapManager,
    private spriteManager: SpriteManager,
    private entityManager: EntityManager,
    private soundManager: SoundManager,
    private rendererEngine: RendererEngine,
  ) {
    this.cameraManager = new CameraManager(this.worldTilemapManager, this.spriteManager)
    this.entityFactory = new EntityFactory(entityManager, this.playerComponentStore, this.enemyComponentStore, this.positionComponentStore, this.spriteComponentStore, this.projectileComponentStore, this.projectileShooterComponentStore, this.velocityComponentStore, this.movimentIntentComponentStore, this.soldierComponentStore, this.animationComponentStore, this.directionAnimComponentStore, this.collisionComponentStore);
    this.renderSystem = new RenderSystem(this.positionComponentStore, this.spriteComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager, this.directionAnimComponentStore);
    this.inputMovementSystem = new InputMovementSystem(this.positionComponentStore, this.movimentIntentComponentStore, this.playerComponentStore)
    this.shootingSystem = new ShootingSystem(this.playerComponentStore, this.enemyComponentStore, this.intentClickComponentStore, this.intentShootingComponentStore, this.positionComponentStore);
    this.projectileSpawnSystem = new ProjectileSpawnSystem(this.spriteManager, this.soundManager, this.positionComponentStore, this.playerComponentStore, this.projectileComponentStore, this.entityFactory, this.projectileShooterComponentStore, this.spriteComponentStore, this.directionAnimComponentStore, this.intentClickComponentStore, this.shootingCooldownComponentStore)
    this.projectileUpdateSystem = new ProjectileUpdateSystem(this.positionComponentStore, this.projectileComponentStore, this.velocityComponentStore, this.movimentIntentComponentStore);
    this.collisionSystem = new CollisionSystem(this.spriteComponentStore, this.positionComponentStore, this.collisionComponentStore, this.movimentIntentComponentStore, this.projectileComponentStore, this.spriteManager, this.entityFactory);
    this.movementSystem = new MovementSystem(this.positionComponentStore, this.movimentIntentComponentStore, this.playerComponentStore, this.shooterComponentStore);
    this.animationSetterSystem = new AnimationSetterSystem(this.movimentIntentComponentStore, this.positionComponentStore, this.directionAnimComponentStore, this.animationComponentStore, this.projectileShooterComponentStore, this.soldierComponentStore);
    this.terminatorSystem = new TerminatorSystem(this.intentClickComponentStore, this.movimentIntentComponentStore, this.projectileShooterComponentStore, this.shootingCooldownComponentStore);
    this.animationSpriteSystem = new AnimationSpriteSystem(this.animationComponentStore, this.spriteComponentStore)
  }

  update() {
    this.inputMovementSystem.update(CoreManager.timeSinceLastRender);
    this.shootingSystem.update(CoreManager.timeSinceLastRender); // might be used for shooting? not sure if we can merge in inputMovementSystem
    this.projectileSpawnSystem.update(CoreManager.timeSinceLastRender);
    this.projectileUpdateSystem.update(CoreManager.timeSinceLastRender);
    this.animationSetterSystem.update(CoreManager.timeSinceLastRender);
    this.animationSpriteSystem.update(CoreManager.timeSinceLastRender);
    this.collisionSystem.update(CoreManager.timeSinceLastRender);
    this.movementSystem.update(CoreManager.timeSinceLastRender);
    this.renderSystem.update(CoreManager.timeSinceLastRender);
    this.terminatorSystem.update(CoreManager.timeSinceLastRender);
  }

  initialize() {
    this.entityFactory.createPlayer(30, 30);
    this.entityFactory.createEnemy(90, 90);
  }
}
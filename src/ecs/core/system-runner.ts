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
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { AIComponent } from "../components/ai.component.js";
import { AiMovementBehaviorSystem } from "../systems/ai-movement-behavior-system.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { HealthComponent } from "../components/health.component.js";
import { AiAttackBehaviorSystem } from "../systems/ai-attack-behavior-system.js";
import { AIAttackOrderComponent } from "../components/ai-attack-order.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { LevelManager } from "./level-manager.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { LevelProgressionSystem } from "../systems/level-progression.system.js";
import { EnemyLifecicleSystem } from "../systems/enemy-lifecicle.system.js";
import { DamageComponent } from "../components/damage.component.js";
import { AiAttackRangeComponent } from "../components/ai-attack-range.component.js";
import { AiMovementRadiusComponent } from "../components/ai-movement-radius.component.js";
import { PlayerInitialProperties } from "../components/types/player-properties.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { WeaponSpriteAttachmenPositiontSystem } from "../systems/weapon-attachment-position-system.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { SpriteLevelScalerSystem } from "../systems/zoom-level-scaler-system.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { FreezeManager } from "./freeze-manager.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { OffsetAppliedComponent } from "../components/offset-applied.component.js";
import { LevelUpdateSystem } from "../systems/level-update.system.js";
import { DynamicAttributeSystem } from "../systems/dynamic-attribute.system.js";
import { DirectionComponent } from "../components/direction-component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ReloadSystem } from "../systems/reload-system.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { DamageTakenComponent } from "../components/damage-taken.component.js";
import { BulletFiredComponent } from "../components/bullet-fired.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeCooldownComponent } from "../components/grenade-cooldown.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { GrenadeBeltComponent } from "../components/grenade-belt.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { TravelTimeComponent } from "../components/travel-time.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { ExplosionSystem } from "../systems/explosion-system.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { DelayedDestructionComponent } from "../components/delayed-destruction.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { DisableAttachmentComponent } from "../components/disable-attachment.component.js";
import { AttackSpeedComponent } from "../components/attack-speed.component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { MeleeAttackSystem } from "../systems/melee-attack.system.js";
import { MeleeIntentProcessedComponent } from "../components/melee-intent-processed.component.js";
import { InitialAimAngleComponent } from "../components/initial-aim-angle.component.js";
import { ShapeDimensionComponent } from "../components/shape-dimension.component.js";
import { ShapePositionComponent } from "../components/shape-position.component.js";
import { AnimTimerComponent } from "../components/anim-timer.component.js";
import { ShapeComponent } from "../components/shape-component.js";
import { ShapeDirectionComponent } from "../components/shape-direction.component.js";
import { ShapeAngleComponent } from "../components/shape-angle.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ShapeHitMemoryComponent } from "../components/shape-hitmemory-component.js";
import { WeaponAttackOriginComponent } from "../components/weapon-attack-origin.component.js";
import { DustParticlesComponent } from "../components/dust-particles.component.js";
import { BloodParticlesComponent } from "../components/blood-particles.component.js";
import { SparkParticlesComponent } from "../components/spark-particles.component.js";
import { ParticleEmitterSystem } from "../systems/particle-emitter.system.js";

export class SystemRunner {
  private renderSystem: RenderSystem;
  private cameraManager: CameraManager;
  private pathFindingManager: PathFindingManager = new PathFindingManager();
  private renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
  private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
  private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
  private collisionComponentStore: ComponentStore<CollisionComponent> = new ComponentStore("CollisionComponent");
  private movimentIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
  private playerComponentStore: ComponentStore<PlayerComponent> = new ComponentStore("PlayerComponent");
  private projectileComponentStore: ComponentStore<ProjectileComponent> = new ComponentStore("ProjectileComponent");
  private velocityComponentStore: ComponentStore<VelocityComponent> = new ComponentStore("VelocityComponent");
  private intentClickComponentStore: ComponentStore<IntentClickComponent> = new ComponentStore("IntentClickComponent");
  private directionAnimComponentStore: ComponentStore<DirectionAnimComponent> = new ComponentStore("DirectionAnimComponent");
  private soldierComponentStore: ComponentStore<SoldierComponent> = new ComponentStore("SoldierComponent");
  private animationComponentStore: ComponentStore<AnimationComponent> = new ComponentStore("AnimationComponent");
  private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent> = new ComponentStore("ShootingCooldownComponent");
  private enemyComponentStore: ComponentStore<EnemyComponent> = new ComponentStore("EnemyComponent");
  private intentShotComponentStore: ComponentStore<IntentShotComponent> = new ComponentStore("IntentShotComponent");
  private shooterComponentStore: ComponentStore<ShooterComponent> = new ComponentStore("ShooterComponent");
  private aiComponentStore: ComponentStore<AIComponent> = new ComponentStore("AIComponent");
  private aiMovementOrderComponentStore: ComponentStore<AIMovementOrderComponent> = new ComponentStore("AIMovementOrderComponent");
  private movementIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
  private healthComponentStore: ComponentStore<HealthComponent> = new ComponentStore("HealthComponent");
  private aiAttackOrderComponentStore: ComponentStore<AIAttackOrderComponent> = new ComponentStore("AIAttackOrderComponent");
  private shotOriginComponentStore: ComponentStore<ShotOriginComponent> = new ComponentStore("ShotOriginComponent")
  private aimShootingComponent: ComponentStore<AimShootingComponent> = new ComponentStore("AimShootingComponent");
  private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent> = new ComponentStore("EnemiesKilledComponent");
  private damageComponentStore: ComponentStore<DamageComponent> = new ComponentStore("DamageComponent");
  private aiAttackRangeComponentStore: ComponentStore<AiAttackRangeComponent> = new ComponentStore("AiAttackRangeComponent");
  private aiMovementRadiusComponentStore: ComponentStore<AiMovementRadiusComponent> = new ComponentStore("AiMovementRadiusComponent");
  private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent> = new ComponentStore("EnemyDeadComponent");
  private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent> = new ComponentStore("WeaponSpriteAttachmentComponent");
  private zLayerComponentStore: ComponentStore<ZLayerComponent> = new ComponentStore("ZLayerComponent");
  private wallHitComponentStore: ComponentStore<WallHitComponent> = new ComponentStore("WallHitComponent");
  private offsetAppliedComponentStore: ComponentStore<OffsetAppliedComponent> = new ComponentStore("OffsetAppliedComponent");
  private directionComponentStore: ComponentStore<DirectionComponent> = new ComponentStore("Direction Component");
  private weaponComponentStore: ComponentStore<WeaponComponent> = new ComponentStore("WeaponComponent");
  private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent> = new ComponentStore("ReloadIntentComponent");
  private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent> = new ComponentStore("WeaponMagazineComponent");
  private damageTakenComponentStore: ComponentStore<DamageTakenComponent> = new ComponentStore("DamageTakenComponent");
  private bulletFiredComponentStore: ComponentStore<BulletFiredComponent> = new ComponentStore("BulletFiredComponent");
  private grenadeComponentStore: ComponentStore<GrenadeComponent> = new ComponentStore("GrenadeComponent");
  private grenadeCooldownComponentStore: ComponentStore<GrenadeCooldownComponent> = new ComponentStore("GrenadeCooldownComponent");
  private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent> = new ComponentStore("GrenadeFiredComponent");
  private grenadeBeltComponentStore: ComponentStore<GrenadeBeltComponent> = new ComponentStore("GrenadeBeltComponent");
  private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent> = new ComponentStore("IntentGrenadeComponent");
  private travelTimeComponentStore: ComponentStore<TravelTimeComponent> = new ComponentStore("TravelTimeComponent");
  private fuseTimerComponentStore: ComponentStore<FuseTimerComponent> = new ComponentStore("FuseTimerComponent");
  private grenadeExplosionComponentStore: ComponentStore<GrenadeExplosionComponent> = new ComponentStore("GrenadeExplosionComponent");
  private delayedDestructionComponentStore: ComponentStore<DelayedDestructionComponent> = new ComponentStore("DelayedDestructionComponent");
  private intentMeleeComponentStore: ComponentStore<IntentMeleeComponent> = new ComponentStore("IntentMeleeComponent");
  private disableAttachmentComponentStore: ComponentStore<DisableAttachmentComponent> = new ComponentStore("DisableAttachmentComponent");
  private attackSpeedComponentStore: ComponentStore<AttackSpeedComponent> = new ComponentStore("AttackSpeedComponent");
  private disableAimComponentStore: ComponentStore<DisableAimComponent> = new ComponentStore("DisableAimComponent");
  private meleeIntentProcessedComponentStore: ComponentStore<MeleeIntentProcessedComponent> = new ComponentStore("MeleeIntentProcessedComponent")
  private initialAimAngleComponentStore: ComponentStore<InitialAimAngleComponent> = new ComponentStore("InitialAimAngleComponent");
  private shapeDimensionComponentStore: ComponentStore<ShapeDimensionComponent> = new ComponentStore("ShapeDimensionComponent");
  private shapePositionComponentStore: ComponentStore<ShapePositionComponent> = new ComponentStore("ShapePositionComponent");
  private animTimerComponentStore: ComponentStore<AnimTimerComponent> = new ComponentStore("AnimTimerComponent");
  private shapeComponentStore: ComponentStore<ShapeComponent> = new ComponentStore("ShapeComponent");
  private shapeDirectionComponentStore: ComponentStore<ShapeDirectionComponent> = new ComponentStore("ShapeDirectionComponent");
  private shapeAngleComponentStore: ComponentStore<ShapeAngleComponent> = new ComponentStore("ShapeAngleComponent");
  private shapeHitMemoryComponentStore: ComponentStore<ShapeHitMemoryComponent> = new ComponentStore("ShapeHitMemoryComponent");
  private weaponAttackOriginComponentStore: ComponentStore<WeaponAttackOriginComponent> = new ComponentStore("WeaponAttackOriginComponent");
  private dustParticlesComponentStore: ComponentStore<DustParticlesComponent> = new ComponentStore("DustParticlesComponent");
  private bloodParticlesComponentStore: ComponentStore<BloodParticlesComponent> = new ComponentStore("BloodParticlesComponent");
  private sparkParticlesComponentStore: ComponentStore<SparkParticlesComponent> = new ComponentStore("SparkParticlesComponent");
  private animationSpriteSystem: AnimationSpriteSystem;
  private inputMovementSystem: InputMovementSystem;
  private shootingSystem: ShootingSystem;
  private projectileSpawnSystem: ProjectileSpawnSystem;
  private collisionSystem: CollisionSystem;
  private movementSystem: MovementSystem;
  private animationSetterSystem: AnimationSetterSystem;
  private terminatorSystem: TerminatorSystem;
  private projectileUpdateSystem: ProjectileUpdateSystem;
  private aiMovementBehaviorSystem: AiMovementBehaviorSystem;
  private aiAttackBehaviorSystem: AiAttackBehaviorSystem;
  private levelProgressionSystem: LevelProgressionSystem;
  private enemyLifecicleSystem: EnemyLifecicleSystem;
  private weaponSpriteAttachmentSystem: WeaponSpriteAttachmenPositiontSystem;
  private entityFactory: EntityFactory;
  private playerInitialProperties: PlayerInitialProperties;
  private spriteLevelScaler: SpriteLevelScalerSystem;
  private levelUpdateSystem: LevelUpdateSystem;
  private dynamicAttributeSystem: DynamicAttributeSystem;
  private reloadSystem: ReloadSystem;
  private explosionSystem: ExplosionSystem;
  private meleeAttackSystem: MeleeAttackSystem;
  private particleEmitterSystem: ParticleEmitterSystem;

  constructor(
    private worldTilemapManager: WorldTilemapManager,
    private spriteManager: SpriteManager,
    private entityManager: EntityManager,
    private soundManager: SoundManager,
    private rendererEngine: RendererEngine,
    private levelManager: LevelManager,
    private freezeManager: FreezeManager,
  ) {
    this.cameraManager = new CameraManager(this.worldTilemapManager, this.spriteManager);
    this.freezeManager = new FreezeManager();
    this.playerInitialProperties = new PlayerInitialProperties();
    this.entityFactory = new EntityFactory(entityManager, this.renderableComponentStore, this.playerComponentStore, this.enemyComponentStore, this.positionComponentStore, this.spriteComponentStore, this.projectileComponentStore, this.shooterComponentStore, this.velocityComponentStore, this.movementIntentComponentStore, this.animationComponentStore, this.directionAnimComponentStore, this.collisionComponentStore, this.aiComponentStore, this.healthComponentStore, this.shotOriginComponentStore, this.damageComponentStore, this.shootingCooldownComponentStore, this.aiAttackRangeComponentStore, this.aiMovementRadiusComponentStore, this.enemyDeadComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.zLayerComponentStore, this.directionComponentStore, this.weaponComponentStore, this.weaponMagazineComponentStore, this.grenadeComponentStore, this.grenadeBeltComponentStore, this.travelTimeComponentStore, this.fuseTimerComponentStore, this.shapeDimensionComponentStore, this.shapePositionComponentStore, this.shapeComponentStore, this.shapeDirectionComponentStore, this.shapeAngleComponentStore, this.shapeHitMemoryComponentStore);
    this.enemyLifecicleSystem = new EnemyLifecicleSystem(this.positionComponentStore, this.playerComponentStore, this.enemyComponentStore, this.enemyDeadComponentStore, this.entityFactory, this.worldTilemapManager, this.spriteManager, this.soundManager, this.freezeManager, this.spriteComponentStore, this.worldTilemapManager);
    this.levelManager = new LevelManager(this.enemyLifecicleSystem, this.worldTilemapManager, this.cameraManager);
    this.dynamicAttributeSystem = new DynamicAttributeSystem(this.levelManager, this.entityFactory, this.velocityComponentStore, this.projectileComponentStore, this.playerComponentStore, this.enemyComponentStore, this.damageTakenComponentStore, this.healthComponentStore, this.damageComponentStore, this.enemiesKilledComponentStore, this.weaponMagazineComponentStore, this.reloadIntentComponentStore, this.bulletFiredComponentStore, this.grenadeBeltComponentStore, this.grenadeFiredComponentStore, this.enemyDeadComponentStore);
    this.levelUpdateSystem = new LevelUpdateSystem(this.levelManager);
    this.renderSystem = new RenderSystem(this.renderableComponentStore, this.positionComponentStore, this.spriteComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager, this.directionAnimComponentStore, this.aimShootingComponent, this.zLayerComponentStore, this.levelManager);
    this.inputMovementSystem = new InputMovementSystem(this.positionComponentStore, this.movimentIntentComponentStore, this.playerComponentStore, this.velocityComponentStore)
    this.shootingSystem = new ShootingSystem(this.playerComponentStore, this.enemyComponentStore, this.intentShotComponentStore, this.positionComponentStore, this.shooterComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.spriteComponentStore, this.weaponMagazineComponentStore, this.grenadeBeltComponentStore, this.intentGrenadeComponentStore, this.weaponComponentStore, this.intentMeleeComponentStore, this.disableAimComponentStore);
    this.projectileSpawnSystem = new ProjectileSpawnSystem(this.spriteManager, this.soundManager, this.positionComponentStore, this.weaponSpriteAttachmentComponentStore, this.projectileComponentStore, this.entityFactory, this.spriteComponentStore, this.directionAnimComponentStore, this.intentShotComponentStore, this.shootingCooldownComponentStore, this.shooterComponentStore, this.playerComponentStore, this.bulletFiredComponentStore, this.grenadeCooldownComponentStore, this.grenadeFiredComponentStore, this.intentGrenadeComponentStore)
    this.projectileUpdateSystem = new ProjectileUpdateSystem(this.positionComponentStore, this.projectileComponentStore, this.velocityComponentStore, this.movimentIntentComponentStore, this.directionComponentStore, this.grenadeComponentStore, this.travelTimeComponentStore);
    this.collisionSystem = new CollisionSystem(this.spriteComponentStore, this.positionComponentStore, this.collisionComponentStore, this.movimentIntentComponentStore, this.projectileComponentStore, this.shooterComponentStore, this.healthComponentStore, this.enemyComponentStore, this.spriteManager, this.entityFactory, this.playerComponentStore, this.shotOriginComponentStore, this.enemiesKilledComponentStore, this.wallHitComponentStore, this.worldTilemapManager, this.levelManager, this.animationComponentStore, this.velocityComponentStore, this.damageTakenComponentStore, this.animTimerComponentStore, this.shapeComponentStore, this.shapePositionComponentStore, this.shapeDimensionComponentStore, this.grenadeComponentStore, this.shapeHitMemoryComponentStore, this.dustParticlesComponentStore, this.bloodParticlesComponentStore, this.sparkParticlesComponentStore, this.directionComponentStore);
    this.movementSystem = new MovementSystem(this.positionComponentStore, this.movimentIntentComponentStore, this.playerComponentStore, this.shooterComponentStore);
    this.animationSetterSystem = new AnimationSetterSystem(this.spriteManager, this.movimentIntentComponentStore, this.positionComponentStore, this.directionAnimComponentStore, this.animationComponentStore, this.aiComponentStore, this.playerComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.wallHitComponentStore, this.projectileComponentStore, this.spriteComponentStore, this.offsetAppliedComponentStore, this.grenadeComponentStore, this.grenadeExplosionComponentStore);
    this.terminatorSystem = new TerminatorSystem(this.entityFactory, this.intentClickComponentStore, this.movimentIntentComponentStore, this.shootingCooldownComponentStore, this.intentShotComponentStore, this.wallHitComponentStore, this.grenadeCooldownComponentStore, this.intentGrenadeComponentStore, this.intentMeleeComponentStore, this.meleeIntentProcessedComponentStore, this.enemyDeadComponentStore, this.shapeComponentStore);
    this.animationSpriteSystem = new AnimationSpriteSystem(this.animationComponentStore, this.spriteComponentStore);
    this.aiMovementBehaviorSystem = new AiMovementBehaviorSystem(this.positionComponentStore, this.velocityComponentStore, this.movimentIntentComponentStore, this.aiComponentStore, this.aiMovementOrderComponentStore, this.playerComponentStore, this.pathFindingManager);
    this.aiAttackBehaviorSystem = new AiAttackBehaviorSystem(this.positionComponentStore, this.intentShotComponentStore, this.aiComponentStore, this.aiAttackOrderComponentStore, this.playerComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.spriteComponentStore, this.enemyComponentStore, this.intentGrenadeComponentStore, this.intentMeleeComponentStore, this.disableAimComponentStore);
    this.spriteLevelScaler = new SpriteLevelScalerSystem(this.spriteComponentStore, this.spriteManager, this.levelManager, this.worldTilemapManager);
    this.weaponSpriteAttachmentSystem = new WeaponSpriteAttachmenPositiontSystem(this.positionComponentStore, this.weaponSpriteAttachmentComponentStore, this.zLayerComponentStore, this.spriteComponentStore, this.aimShootingComponent, this.disableAttachmentComponentStore);
    this.levelProgressionSystem = new LevelProgressionSystem(this.enemiesKilledComponentStore, this.levelManager);
    this.reloadSystem = new ReloadSystem(this.soundManager, this.reloadIntentComponentStore, this.playerComponentStore, this.weaponMagazineComponentStore)
    this.explosionSystem = new ExplosionSystem(this.entityFactory, this.grenadeComponentStore, this.fuseTimerComponentStore, this.playerComponentStore, this.enemyComponentStore, this.positionComponentStore, this.shooterComponentStore, this.damageTakenComponentStore, this.grenadeExplosionComponentStore, this.delayedDestructionComponentStore, this.animationComponentStore, this.enemyDeadComponentStore);
    this.meleeAttackSystem = new MeleeAttackSystem(this.intentMeleeComponentStore, this.weaponSpriteAttachmentComponentStore, this.weaponComponentStore, this.positionComponentStore, this.aimShootingComponent, this.shooterComponentStore, this.playerComponentStore, this.enemyComponentStore, this.attackSpeedComponentStore, this.spriteComponentStore, this.disableAimComponentStore, this.meleeIntentProcessedComponentStore, this.initialAimAngleComponentStore, this.entityFactory, this.shapeComponentStore, this.disableAttachmentComponentStore, this.weaponAttackOriginComponentStore);
    this.particleEmitterSystem = new ParticleEmitterSystem(this.rendererEngine, this.bloodParticlesComponentStore, this.dustParticlesComponentStore, this.sparkParticlesComponentStore);
  }

  update() {
    if (!this.freezeManager.gameFrozen) {
      this.levelProgressionSystem.update(CoreManager.timeSinceLastRender);
      this.spriteLevelScaler.update(CoreManager.timeSinceLastRender);
      this.enemyLifecicleSystem.update(CoreManager.timeSinceLastRender);
      this.dynamicAttributeSystem.update(CoreManager.timeSinceLastRender);
      this.reloadSystem.update(CoreManager.timeSinceLastRender);
      this.inputMovementSystem.update(CoreManager.timeSinceLastRender);
      this.aiMovementBehaviorSystem.update(CoreManager.timeSinceLastRender);
      this.aiAttackBehaviorSystem.update(CoreManager.timeSinceLastRender)
      this.shootingSystem.update(CoreManager.timeSinceLastRender);
      this.meleeAttackSystem.update(CoreManager.timeSinceLastRender);
      this.projectileSpawnSystem.update(CoreManager.timeSinceLastRender);
      this.projectileUpdateSystem.update(CoreManager.timeSinceLastRender);
      this.animationSetterSystem.update(CoreManager.timeSinceLastRender);
      this.animationSpriteSystem.update(CoreManager.timeSinceLastRender);
      this.explosionSystem.update(CoreManager.timeSinceLastRender);
      this.collisionSystem.update(CoreManager.timeSinceLastRender);
      this.movementSystem.update(CoreManager.timeSinceLastRender);
      this.spriteLevelScaler.update(CoreManager.timeSinceLastRender);
      this.weaponSpriteAttachmentSystem.update(CoreManager.timeSinceLastRender);
      this.particleEmitterSystem.update(CoreManager.timeSinceLastRender);
      this.renderSystem.update(CoreManager.timeSinceLastRender);
      this.terminatorSystem.update(CoreManager.timeSinceLastRender);
      this.levelUpdateSystem.update();
    }
    // systems that should remain unfrozen


  }

  initialize() {
    this.entityFactory.createPlayer(30, 320, this.playerInitialProperties.hp, this.playerInitialProperties.damage, this.playerInitialProperties.velocity);
    this.levelManager.update();
  }
}
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { RendererEngine } from "../../game/renderer/renderer-engine.js";
import { TextManager } from "../../game/text/text-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { WeatherManager } from "../../game/weather/weather-manager.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { PathFindingManager } from "../../game/world/pathfinding-manager.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { UIActionRouter } from "../../ui/input/ui-action-router.js";
import { UIInputSystem } from "../../ui/input/ui-input-system.js";
import { CrosshairPresenter } from "../../ui/presenters/crosshair.presenter.js";
import { DeathPresenter } from "../../ui/presenters/death.presenter.js";
import { AIAttackOrderComponent } from "../components/ai-attack-order.component.js";
import { AiAttackRangeComponent } from "../components/ai-attack-range.component.js";
import { AIMovementOrderComponent } from "../components/ai-movement-order.component.js";
import { AIComponent } from "../components/ai.component.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimTimerComponent } from "../components/anim-timer.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { AttackSpeedComponent } from "../components/attack-speed.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { BleedDamageComponent } from "../components/bleed-damage.component.js";
import { BleedIntentComponent } from "../components/bleed-intent.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { BulletFiredComponent } from "../components/bullet-fired.component.js";
import { CameraComponent } from "../components/camera-component.js";
import { CombatStimActiveComponent } from "../components/combat-stim-active-component.js";
import { CollisionBoxComponent } from "../components/collision-box-component.js";
import { CorpseComponent } from "../components/corpse.component.js";
import { DamageDealtComponent } from "../components/damage-dealt.component.js";
import { DamageTakenIntentComponent } from "../components/damage-taken-intent.component.js";
import { DeathIntentComponent } from "../components/death-intent.component.js";
import { DelayedDestructionComponent } from "../components/delayed-destruction.component.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DialogIntentComponent } from "../components/dialog-intent.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { DirectionComponent } from "../components/direction-component.js";
import { DisableAimComponent } from "../components/disable-aim.component.js";
import { DisableAttachmentComponent } from "../components/disable-attachment.component.js";
import { EnemiesKilledComponent } from "../components/enemies-killed.component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { EpipenActiveComponent } from "../components/epipen-active-component.js";
import { FocusFireIntentComponent } from "../components/focus-fire-intent.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { GameUIAnchorComponent } from "../components/game-ui-anchor.component.js";
import { GameUIComponent } from "../components/game-ui-component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeCooldownComponent } from "../components/grenade-cooldown.component.js";
import { GrenadeExplosionHitBoxComponent } from "../components/grenade-explosion-hitbox.component.js";
import { GrenadeExplosionComponent } from "../components/grenade-explosion.component.js";
import { GrenadeFiredComponent } from "../components/grenade-fired.component.js";
import { HealthComponent } from "../components/health.component.js";
import { HitBoxComponent } from "../components/hit-box-component.js";
import { HealBleedIntentComponent } from "../components/heal-bleed-intent.component.js";
import { InitialAimAngleComponent } from "../components/initial-aim-angle.component.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { IntentGrenadeComponent } from "../components/intent-grenade.component.js";
import { IntentMeleeComponent } from "../components/intent-melee.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { MedicalItemUseComponent } from "../components/medical-item-use.component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { ItemDropIntentComponent } from "../components/item-drop-intent.component.js";
import { ItemDroppedComponent } from "../components/item-dropped.component.js";
import { MeleeIntentProcessedComponent } from "../components/melee-intent-processed.component.js";
import { MovementImprecisionIntentComponent } from "../components/movement-imprecision-intent.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { OffsetAppliedComponent } from "../components/offset-applied.component.js";
import { ParticlesComponent } from "../components/particles.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ReloadIntentComponent } from "../components/reload-intent.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ScreenPositionComponent } from "../components/screen-position.component.js";
import { ShapeAngleComponent } from "../components/shape-angle.component.js";
import { ShapeComponent } from "../components/shape-component.js";
import { ShapeDimensionComponent } from "../components/shape-dimension.component.js";
import { ShapeDirectionComponent } from "../components/shape-direction.component.js";
import { ShapeHitMemoryComponent } from "../components/shape-hitmemory-component.js";
import { ShapePositionComponent } from "../components/shape-position.component.js";
import { ShooterCooldownComponent } from "../components/shooter-cooldown-component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { ShootingRecoilIntentComponent } from "../components/shooting-recoil-intent.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { SoldierComponent } from "../components/soldier.component.js";
import { SpreadRadiusComponent } from "../components/spread-radius.component.js";
import { StaggerComponent } from "../components/stagger-component.js";
import { SpriteClipComponent } from "../components/sprite-clip.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { TransformComponent } from "../components/transform-component.js";
import { PlayerInitialProperties } from "../components/types/player-properties.js";
import { UIRuntimeElementComponent } from "../components/ui-runtime-element.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { VisualRecoilComponent } from "../components/visual-recoil.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponAttackOriginComponent } from "../components/weapon-attack-origin.component.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { WeaponStatsComponent } from "../components/weapon-stats.component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { UIRuntimeEntityFactory } from "../entities/ui-runtime-entity-factory.js";
import { AiAttackBehaviorSystem } from "../systems/ai-attack-behavior-system.js";
import { AiIntentProcessorSystem } from "../systems/ai-intent-processor.system.js";
import { AiMovementBehaviorSystem } from "../systems/ai-movement-behavior-system.js";
import { AnimationSetterSystem } from "../systems/animation-setter-system.js";
import { AnimationSpriteSystem } from "../systems/animation-sprite-system.js";
import { BleedingSystem } from "../systems/bleeding-system.js";
import { CameraFollowSystem } from "../systems/camera-follow-system.js";
import { CollisionSystem } from "../systems/collision-system.js";
import { CoreographerSystem } from "../systems/coreographer-system.js";
import { DamageProcessingSystem } from "../systems/damage-processing-system.js";
import { DeathProcessingSystem } from "../systems/death-processing-system.js";
import { DeathRuntimeSystem } from "../systems/death-runtime-system.js";
import { DebugProcessorSystem } from "../systems/debug-processor.system.js";
// import { DynamicAttributeSystem } from "../systems/dynamic-attribute.system.js";
import { SoundEventBus } from "../../game/audio/sound-event-bus.js";
import { HudPresenter } from "../../ui/presenters/hud.presenter.js";
import { VictoryPresenter } from "../../ui/presenters/victory.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { CrosshairScreenOverlay } from "../../ui/screens/crosshair-screen-overlay.js";
import { DeathScreenOverlay } from "../../ui/screens/death-screen-overlay.js";
import { HudScreen } from "../../ui/screens/hud.screen.js";
import { VictoryScreenOverlay } from "../../ui/screens/victory-screen-overlay.js";
import { DeathParticleBurstComponent } from "../components/death-particle-burst-component.js";
import { DeathParticlesIntentComponent } from "../components/death-particles-intent.component.js";
import { GrenadeTravelComponent } from "../components/grenade-travel.component.js";
import { ParentEntityComponent } from "../components/parent-entity-component.js";
import { ShadowComponent } from "../components/shadow-component.js";
import type { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { AudioSystem } from "../systems/audio-system.js";
import { CrosshairRuntimeSystem } from "../systems/crosshair-runtime.system.js";
import { DialogSystem } from "../systems/dialog-system.js";
import { EnemyLifecicleSystem } from "../systems/enemy-lifecicle.system.js";
import { FootstepAudioSystem } from "../systems/footstep-audio.system.js";
import { GrenadeSpawnSystem } from "../systems/grenade-spawn-system.js";
import { GrenadeUpdateSystem } from "../systems/grenade-update-system.js";
import { HitDetectionSystem } from "../systems/hit-detection-system.js";
import { HudRuntimeSystem } from "../systems/hud-runtime.system.js";
import { InputDebugSystem } from "../systems/input-debug.system.js";
import { InputMovementSystem } from "../systems/input-movement.system.js";
import { InventoryDebugSystem } from "../systems/inventory-debug-system.js";
import { InventorySystem } from "../systems/inventory-system.js";
import { ItemDropSpawnSystem } from "../systems/item-drop-spawn.system.js";
import { ItemDropUpdateSystem } from "../systems/item-drop-update.system.js";
import { LevelProgressionSystem } from "../systems/level-progression.system.js";
import { LevelUpdateSystem } from "../systems/level-update.system.js";
import { MedicalItemsSystem } from "../systems/medical-items-system.js";
import { MeleeAttackSystem } from "../systems/melee-attack.system.js";
import { MovementSystem } from "../systems/movement-system.js";
import { ParticleEmitterSystem } from "../systems/particle-emitter.system.js";
import { ProjectileSpawnSystem } from "../systems/projectile-spawn.system.js";
import { ProjectileUpdateSystem } from "../systems/projectile-update.system.js";
import { ReloadSystem } from "../systems/reload-system.js";
import { RenderSystem } from "../systems/render-system.js";
import { ShadowPositionUpdateSystem } from "../systems/shadow-position-update-system.js";
import { ShootingSystem } from "../systems/shooting-system.js";
import { StaggerSystem } from "../systems/stagger-system.js";
import { TerminatorSystem } from "../systems/terminator-system.js";
import { UIRuntimeInputSystem } from "../systems/ui-runtime-input.system.js";
import { UIRuntimeSyncSystem } from "../systems/ui-runtime-sync.system.js";
import { VFXComponent } from "../systems/vfx-component.js";
import { VictoryRuntimeSystem } from "../systems/victory-runtime-system.js";
import { VisibilitySystem } from "../systems/visibility-system.js";
import { VisualEffectsSystem } from "../systems/visual-effects.system.js";
import { WeaponSpriteAttachmenPositiontSystem } from "../systems/weapon-attachment-position-system.js";
import { WeaponImprecisionSystem } from "../systems/weapon-imprecision-system.js";
import { WeaponSwitchSystem } from "../systems/weapon-switch-system.js";
import { WeatherSystem } from "../systems/weather.system.js";
import { SpriteLevelScalerSystem } from "../systems/zoom-level-scaler-system.js";
import { StructureBaker } from "../zones/structure-baker.js";
import { ZoneFactory } from "../zones/zone-factory.js";
import { ComponentStore } from "./component-store.js";
import { CoreManager } from "./core-manager.js";
import { DeathActionController } from "./death-action-controller.js";
import { DebugManager } from "./debug-manager.js";
import { EntityManager } from "./entity-manager.js";
import { FreezeManager } from "./freeze-manager.js";
import type { GameManager } from "./game-manager.js";
import { InventoryManager } from "./inventory-manager.js";
import { LevelEndReason, LevelManager } from "./level-manager.js";
import { UIManager } from "./ui-manager.js";
import { VictoryActionController } from "./victory-action-controller.js";

export class GameplaySystemRunner {
  private static hasLoggedDebugKeybinds = false;
  private renderSystem: RenderSystem;
  private visibilityManager: VisibilityManager;
  private cameraManager: CameraManager;
  private pathFindingManager: PathFindingManager;
  private inventoryManager: InventoryManager;
  private levelManager: LevelManager;
  private freezeManager: FreezeManager;
  private uiManager: UIManager;
  private soundEventBus: SoundEventBus;
  private renderableComponentStore: ComponentStore<RenderableComponent> = new ComponentStore("RenderableComponent");
  private spriteComponentStore: ComponentStore<SpriteComponent> = new ComponentStore("SpriteComponent");
  private positionComponentStore: ComponentStore<PositionComponent> = new ComponentStore("PositionComponent");
  private collisionBoxComponentStore: ComponentStore<CollisionBoxComponent> = new ComponentStore("CollisionBoxComponent");
  private playerComponentStore: ComponentStore<PlayerComponent> = new ComponentStore("PlayerComponent");
  private projectileComponentStore: ComponentStore<ProjectileComponent> = new ComponentStore("ProjectileComponent");
  private velocityComponentStore: ComponentStore<VelocityComponent> = new ComponentStore("VelocityComponent");
  private intentClickComponentStore: ComponentStore<IntentClickComponent> = new ComponentStore("IntentClickComponent");
  private directionAnimComponentStore: ComponentStore<DirectionAnimComponent> = new ComponentStore("DirectionAnimComponent");
  private soldierComponentStore: ComponentStore<SoldierComponent> = new ComponentStore("SoldierComponent");
  private animationComponentStore: ComponentStore<AnimationComponent> = new ComponentStore("AnimationComponent");
  private bitmapTextComponentStore: ComponentStore<BitmapTextComponent> = new ComponentStore("BitmapTextComponent");
  private dialogComponentStore: ComponentStore<DialogComponent> = new ComponentStore("DialogComponent");
  private dialogIntentComponentStore: ComponentStore<DialogIntentComponent> = new ComponentStore("DialogIntentComponent");
  private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent> = new ComponentStore("DialogLifetimeComponent");
  private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent> = new ComponentStore("DialogBubbleSpriteComponent");
  private dialogAnimComponentStore: ComponentStore<DialogAnimComponent> = new ComponentStore("DialogAnimComponent");
  private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent> = new ComponentStore("ShootingCooldownComponent");
  private enemyComponentStore: ComponentStore<EnemyComponent> = new ComponentStore("EnemyComponent");
  private intentShotComponentStore: ComponentStore<IntentShotComponent> = new ComponentStore("IntentShotComponent");
  private shooterCooldownComponentStore: ComponentStore<ShooterCooldownComponent> = new ComponentStore("ShooterCooldownComponent");
  private aiComponentStore: ComponentStore<AIComponent> = new ComponentStore("AIComponent");
  private aiMovementOrderComponentStore: ComponentStore<AIMovementOrderComponent> = new ComponentStore("AIMovementOrderComponent");
  private movementIntentComponentStore: ComponentStore<MovementIntentComponent> = new ComponentStore("MovementIntentComponent");
  private healthComponentStore: ComponentStore<HealthComponent> = new ComponentStore("HealthComponent");
  private aiAttackOrderComponentStore: ComponentStore<AIAttackOrderComponent> = new ComponentStore("AIAttackOrderComponent");
  private shotOriginComponentStore: ComponentStore<ShotOriginComponent> = new ComponentStore("ShotOriginComponent")
  private aimShootingComponent: ComponentStore<AimRotationShootingComponent> = new ComponentStore("AimRotationShootingComponent");
  private enemiesKilledComponentStore: ComponentStore<EnemiesKilledComponent> = new ComponentStore("EnemiesKilledComponent");
  private damageDealtComponentStore: ComponentStore<DamageDealtComponent> = new ComponentStore("DamageDealtComponent");
  private bleedIntentComponentStore: ComponentStore<BleedIntentComponent> = new ComponentStore("BleedIntentComponent");
  private bleedDamageComponentStore: ComponentStore<BleedDamageComponent> = new ComponentStore("BleedDamageComponent");
  private healBleedIntentComponentStore: ComponentStore<HealBleedIntentComponent> = new ComponentStore("HealBleedIntentComponent");
  private aiAttackRangeComponentStore: ComponentStore<AiAttackRangeComponent> = new ComponentStore("AiAttackRangeComponent");
  private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent> = new ComponentStore("EnemyDeadComponent");
  private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent> = new ComponentStore("WeaponSpriteAttachmentComponent");
  private zLayerComponentStore: ComponentStore<ZLayerComponent> = new ComponentStore("ZLayerComponent");
  private wallHitComponentStore: ComponentStore<WallHitComponent> = new ComponentStore("WallHitComponent");
  private offsetAppliedComponentStore: ComponentStore<OffsetAppliedComponent> = new ComponentStore("OffsetAppliedComponent");
  private directionComponentStore: ComponentStore<DirectionComponent> = new ComponentStore("Direction Component");
  private weaponComponentStore: ComponentStore<WeaponComponent> = new ComponentStore("WeaponComponent");
  private reloadIntentComponentStore: ComponentStore<ReloadIntentComponent> = new ComponentStore("ReloadIntentComponent");
  private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent> = new ComponentStore("WeaponMagazineComponent");
  private weaponStatsComponentStore: ComponentStore<WeaponStatsComponent> = new ComponentStore("WeaponStatsComponent");
  private damageTakenIntentComponentStore: ComponentStore<DamageTakenIntentComponent> = new ComponentStore("DamageTakenIntentComponent");
  private bulletFiredComponentStore: ComponentStore<BulletFiredComponent> = new ComponentStore("BulletFiredComponent");
  private grenadeComponentStore: ComponentStore<GrenadeComponent> = new ComponentStore("GrenadeComponent");
  private grenadeCooldownComponentStore: ComponentStore<GrenadeCooldownComponent> = new ComponentStore("GrenadeCooldownComponent");
  private grenadeFiredComponentStore: ComponentStore<GrenadeFiredComponent> = new ComponentStore("GrenadeFiredComponent");
  private intentGrenadeComponentStore: ComponentStore<IntentGrenadeComponent> = new ComponentStore("IntentGrenadeComponent");
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
  private particlesComponentStore: ComponentStore<ParticlesComponent> = new ComponentStore("ParticlesComponent");
  private cameraComponentStore: ComponentStore<CameraComponent> = new ComponentStore("CameraComponent");
  private hitBoxComponentStore: ComponentStore<HitBoxComponent> = new ComponentStore("HitBoxComponent");
  private deathIntentComponentStore: ComponentStore<DeathIntentComponent> = new ComponentStore("DeathIntentComponent");
  private inventoryComponentStore: ComponentStore<InventoryComponent> = new ComponentStore("InventoryComponent");
  private medicalItemUseComponentStore: ComponentStore<MedicalItemUseComponent> = new ComponentStore("MedicalItemUseComponent");
  private combatStimActiveComponentStore: ComponentStore<CombatStimActiveComponent> = new ComponentStore("CombatStimActiveComponent");
  private epipenActiveComponentStore: ComponentStore<EpipenActiveComponent> = new ComponentStore("EpipenActiveComponent");
  private spreadRadiusComponentStore: ComponentStore<SpreadRadiusComponent> = new ComponentStore("SpreadRadiusComponent");
  private movementImprecisionIntentComponentStore: ComponentStore<MovementImprecisionIntentComponent> = new ComponentStore("MovementImprecisionIntentComponent");
  private shootingRecoilIntentComponentStore: ComponentStore<ShootingRecoilIntentComponent> = new ComponentStore("ShootingRecoilIntentComponent");
  private staggerComponentStore: ComponentStore<StaggerComponent> = new ComponentStore("StaggerComponent");
  private focusFireIntentComponentStore: ComponentStore<FocusFireIntentComponent> = new ComponentStore("FocusFireIntentComponent");
  private itemBoxComponentStore: ComponentStore<ItemBoxComponent> = new ComponentStore("ItemBoxComponent");
  private corpseComponentStore: ComponentStore<CorpseComponent> = new ComponentStore("CorpseComponent");
  private awaitingAnimationEndComponentStore: ComponentStore<AwaitingAnimationEndComponent> = new ComponentStore("AwaitingAnimationEndComponent");
  private itemDropIntentComponentStore: ComponentStore<ItemDropIntentComponent> = new ComponentStore("ItemDropIntentComponent");
  private itemDroppedComponentStore: ComponentStore<ItemDroppedComponent> = new ComponentStore("ItemDroppedComponent");
  private screenPositionComponentStore: ComponentStore<ScreenPositionComponent> = new ComponentStore("ScreenPositionComponent");
  private spriteClipComponentStore: ComponentStore<SpriteClipComponent> = new ComponentStore("SpriteClipComponent");
  private transformComponentStore: ComponentStore<TransformComponent> = new ComponentStore("TransformComponent");
  private gameUiAnchorComponentStore: ComponentStore<GameUIAnchorComponent> = new ComponentStore("GameUIAnchorComponent");
  private gameUiComponentStore: ComponentStore<GameUIComponent> = new ComponentStore("GameUIComponent");
  private shadowComponentStore: ComponentStore<ShadowComponent> = new ComponentStore("ShadowComponent");
  private parentEntityComponentStore: ComponentStore<ParentEntityComponent> = new ComponentStore("ParentEntityComponent");
  private grenadeTravelComponentStore: ComponentStore<GrenadeTravelComponent> = new ComponentStore("GrenadeTravelComponent");
  private grenadeExplosionHitBoxComponentStore: ComponentStore<GrenadeExplosionHitBoxComponent> = new ComponentStore("GrenadeExplosionHitBoxComponent");
  private uiRuntimeElementComponentStore: ComponentStore<UIRuntimeElementComponent> = new ComponentStore("UIRuntimeElementComponent");
  private vfxComponentStore: ComponentStore<VFXComponent> = new ComponentStore("VFXComponent");
  private visualRecoilComponentStore: ComponentStore<VisualRecoilComponent> = new ComponentStore("VisualRecoilComponent");
  private deathParticlesIntentComponentStore: ComponentStore<DeathParticlesIntentComponent> = new ComponentStore("DeathParticlesIntentComponent");
  private deathParticleBurstComponentStore: ComponentStore<DeathParticleBurstComponent> = new ComponentStore("DeathParticleBurstComponent");
  private animationSpriteSystem: AnimationSpriteSystem;
  private inputDebugSystem: InputDebugSystem;
  private inputMovementSystem: InputMovementSystem;
  private shootingSystem: ShootingSystem;
  private staggerSystem: StaggerSystem;
  private projectileSpawnSystem: ProjectileSpawnSystem;
  private grenadeSpawnSystem: GrenadeSpawnSystem;
  private aiIntentProcessorSystem: AiIntentProcessorSystem;
  private collisionSystem: CollisionSystem;
  private movementSystem: MovementSystem;
  private animationSetterSystem: AnimationSetterSystem;
  private terminatorSystem: TerminatorSystem;
  private projectileUpdateSystem: ProjectileUpdateSystem;
  private grenadeUpdateSystem: GrenadeUpdateSystem;
  private aiMovementBehaviorSystem: AiMovementBehaviorSystem;
  private aiAttackBehaviorSystem: AiAttackBehaviorSystem;
  private levelProgressionSystem: LevelProgressionSystem;
  private enemyLifecicleSystem: EnemyLifecicleSystem;
  private weaponSpriteAttachmentSystem: WeaponSpriteAttachmenPositiontSystem;
  private entityFactory: EntityFactory;
  private playerInitialProperties: PlayerInitialProperties;
  private spriteLevelScaler: SpriteLevelScalerSystem;
  private levelUpdateSystem: LevelUpdateSystem;
  // private dynamicAttributeSystem: DynamicAttributeSystem;
  private reloadSystem: ReloadSystem;
  private meleeAttackSystem: MeleeAttackSystem;
  private medicalItemsSystem: MedicalItemsSystem;
  private particleEmitterSystem: ParticleEmitterSystem;
  private cameraFollowSystem: CameraFollowSystem;
  private visibilitySystem: VisibilitySystem;
  private zoneFactory: ZoneFactory;
  private structureBaker: StructureBaker;
  private dialogSystem: DialogSystem;
  private hitDetectionSystem: HitDetectionSystem;
  private damageProcessingSystem: DamageProcessingSystem;
  private bleedingSystem: BleedingSystem;
  private deathProcessingSystem: DeathProcessingSystem;
  private debugProcessor: DebugProcessorSystem;
  private inventorySystem: InventorySystem;
  private inventoryDebugSystem: InventoryDebugSystem;
  private weaponImprecisionSystem: WeaponImprecisionSystem;
  private hudRuntimeSystem: HudRuntimeSystem;
  private crosshairRuntimeSystem: CrosshairRuntimeSystem;
  private deathRuntimeSystem: DeathRuntimeSystem;
  private itemDropSpawnSystem: ItemDropSpawnSystem;
  private itemDropUpdateSystem: ItemDropUpdateSystem;
  private uiRuntime: UIRuntime;
  private uiRuntimeInputSystem: UIRuntimeInputSystem;
  private uiRuntimeSyncSystem: UIRuntimeSyncSystem;
  private weaponSwitchSystem: WeaponSwitchSystem;
  private shadowPositionUpdateSystem: ShadowPositionUpdateSystem;
  private victoryRuntimeSystem: VictoryRuntimeSystem;
  private audioSystem: AudioSystem;
  private footstepAudioSystem: FootstepAudioSystem;
  private visualEffectsSystem: VisualEffectsSystem;
  private coreographerSystem: CoreographerSystem;
  private weatherSystem: WeatherSystem;
  private readonly crosshairScreenId = "crosshair";

  constructor(
    private worldTilemapManager: WorldTilemapManager,
    private spriteManager: SpriteManager,
    private textManager: TextManager,
    private entityManager: EntityManager,
    private soundManager: SoundManager,
    private rendererEngine: RendererEngine,
    private debugManager: DebugManager,
    private weatherManager: WeatherManager,
  ) {
    this.pathFindingManager = new PathFindingManager(this.worldTilemapManager);
    this.cameraManager = new CameraManager(this.worldTilemapManager);
    this.debugManager.bindEnemyComponentStore(this.enemyComponentStore);
    this.visibilityManager = new VisibilityManager();
    this.freezeManager = new FreezeManager();
    this.inventoryManager = new InventoryManager();
    this.playerInitialProperties = new PlayerInitialProperties();
    this.structureBaker = new StructureBaker();
    this.zoneFactory = new ZoneFactory(this.structureBaker);
    this.inputDebugSystem = new InputDebugSystem(this.debugManager, this.cameraManager);
    this.uiManager = new UIManager(this.cameraManager);
    this.uiRuntime = new UIRuntime();
    this.uiRuntime.registerScreen(new HudScreen());
    this.uiRuntime.registerScreen(new CrosshairScreenOverlay());
    this.uiRuntime.registerScreen(new DeathScreenOverlay());
    this.uiRuntime.registerScreen(new VictoryScreenOverlay());
    this.uiRuntime.setBaseScreen("hud");
    this.uiRuntime.pushOverlay(this.crosshairScreenId);
    this.soundEventBus = new SoundEventBus();
    this.entityFactory = new EntityFactory(entityManager, this.inventoryManager, this.uiManager, this.renderableComponentStore, this.playerComponentStore, this.enemyComponentStore, this.positionComponentStore, this.spriteComponentStore, this.projectileComponentStore, this.shooterCooldownComponentStore, this.velocityComponentStore, this.movementIntentComponentStore, this.animationComponentStore, this.directionAnimComponentStore, this.collisionBoxComponentStore, this.aiComponentStore, this.healthComponentStore, this.shotOriginComponentStore, this.damageDealtComponentStore, this.shootingCooldownComponentStore, this.aiAttackRangeComponentStore, this.enemyDeadComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.zLayerComponentStore, this.directionComponentStore, this.weaponComponentStore, this.weaponMagazineComponentStore, this.weaponStatsComponentStore, this.grenadeComponentStore, this.fuseTimerComponentStore, this.shapeDimensionComponentStore, this.shapePositionComponentStore, this.shapeComponentStore, this.shapeDirectionComponentStore, this.shapeAngleComponentStore, this.shapeHitMemoryComponentStore, this.cameraComponentStore, this.hitBoxComponentStore, this.awaitingAnimationEndComponentStore, this.corpseComponentStore, this.grenadeExplosionHitBoxComponentStore, this.dialogComponentStore, this.dialogLifetimeComponentStore, this.dialogBubbleSpriteComponentStore, this.bitmapTextComponentStore, this.dialogAnimComponentStore, this.inventoryComponentStore, this.itemBoxComponentStore, this.itemDroppedComponentStore, this.screenPositionComponentStore, this.gameUiAnchorComponentStore, this.gameUiComponentStore, this.meleeIntentProcessedComponentStore, this.shadowComponentStore, this.parentEntityComponentStore, this.grenadeTravelComponentStore, this.vfxComponentStore);
    const uiRuntimeEntityFactory = new UIRuntimeEntityFactory(this.entityManager, this.renderableComponentStore, this.screenPositionComponentStore, this.spriteComponentStore, this.bitmapTextComponentStore, this.zLayerComponentStore, this.uiRuntimeElementComponentStore, this.spriteClipComponentStore, this.transformComponentStore);
    this.enemyLifecicleSystem = new EnemyLifecicleSystem(this.positionComponentStore, this.playerComponentStore, this.enemyComponentStore, this.enemyDeadComponentStore, this.entityFactory, this.worldTilemapManager, this.spriteManager, this.soundManager, this.freezeManager, this.spriteComponentStore, this.worldTilemapManager);
    this.levelManager = new LevelManager(this.enemyLifecicleSystem, this.worldTilemapManager, this.cameraManager, this.zoneFactory, this.entityFactory, this.playerComponentStore, this.positionComponentStore, this.movementIntentComponentStore, this.inventoryComponentStore, this.healthComponentStore, this.playerInitialProperties, this.uiManager);
    this.levelUpdateSystem = new LevelUpdateSystem(this.levelManager, this.inventoryManager, this.playerComponentStore, this.enemyDeadComponentStore, this.inventoryComponentStore);
    this.inventoryDebugSystem = new InventoryDebugSystem(this.inventoryManager, this.inventoryComponentStore, this.playerComponentStore, this.healthComponentStore, this.damageTakenIntentComponentStore, this.bleedIntentComponentStore, this.weatherManager);
    this.inputMovementSystem = new InputMovementSystem(this.positionComponentStore, this.movementIntentComponentStore, this.playerComponentStore, this.velocityComponentStore);
    this.shootingSystem = new ShootingSystem(this.playerComponentStore, this.intentShotComponentStore, this.positionComponentStore, this.spriteComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.intentGrenadeComponentStore, this.weaponComponentStore, this.intentMeleeComponentStore, this.disableAimComponentStore, this.inventoryComponentStore, this.reloadIntentComponentStore, this.shootingCooldownComponentStore, this.weaponStatsComponentStore, this.shootingRecoilIntentComponentStore, this.spreadRadiusComponentStore, this.movementIntentComponentStore, this.combatStimActiveComponentStore, this.cameraManager, this.debugManager, this.inventoryManager);
    this.projectileSpawnSystem = new ProjectileSpawnSystem(this.spriteManager, this.soundEventBus, this.positionComponentStore, this.movementIntentComponentStore, this.spriteComponentStore, this.weaponSpriteAttachmentComponentStore, this.entityFactory, this.intentShotComponentStore, this.shootingCooldownComponentStore, this.bulletFiredComponentStore, this.damageDealtComponentStore, this.weaponStatsComponentStore, this.playerComponentStore, this.enemyComponentStore, this.visualRecoilComponentStore, this.inventoryComponentStore, this.inventoryManager);
    this.projectileUpdateSystem = new ProjectileUpdateSystem(this.positionComponentStore, this.projectileComponentStore, this.velocityComponentStore, this.movementIntentComponentStore, this.directionComponentStore);
    this.collisionSystem = new CollisionSystem(this.spriteComponentStore, this.positionComponentStore, this.collisionBoxComponentStore, this.movementIntentComponentStore, this.projectileComponentStore, this.grenadeComponentStore, this.velocityComponentStore, this.shotOriginComponentStore, this.playerComponentStore, this.enemyComponentStore, this.particlesComponentStore, this.spriteManager, this.worldTilemapManager, this.entityFactory);
    this.renderSystem = new RenderSystem(this.renderableComponentStore, this.positionComponentStore, this.screenPositionComponentStore, this.spriteComponentStore, this.spriteClipComponentStore, this.uiRuntimeElementComponentStore, this.cameraManager, this.worldTilemapManager, this.rendererEngine, this.spriteManager, this.directionAnimComponentStore, this.aimShootingComponent, this.transformComponentStore, this.zLayerComponentStore, this.visibilityManager, this.debugManager, this.dialogBubbleSpriteComponentStore, this.bitmapTextComponentStore, this.textManager, this.grenadeComponentStore, this.grenadeExplosionComponentStore, this.grenadeTravelComponentStore);
    this.grenadeSpawnSystem = new GrenadeSpawnSystem(this.positionComponentStore, this.spriteComponentStore, this.weaponSpriteAttachmentComponentStore, this.entityFactory, this.shooterCooldownComponentStore, this.playerComponentStore, this.grenadeCooldownComponentStore, this.grenadeFiredComponentStore, this.intentGrenadeComponentStore, this.soundEventBus);
    this.grenadeUpdateSystem = new GrenadeUpdateSystem(this.entityFactory, this.positionComponentStore, this.grenadeComponentStore, this.velocityComponentStore, this.movementIntentComponentStore, this.fuseTimerComponentStore, this.shotOriginComponentStore, this.grenadeExplosionHitBoxComponentStore, this.awaitingAnimationEndComponentStore, this.grenadeTravelComponentStore, this.spriteComponentStore, this.soundEventBus);
    this.hitDetectionSystem = new HitDetectionSystem(this.spriteManager, this.entityFactory, this.hitBoxComponentStore, this.movementIntentComponentStore, this.positionComponentStore, this.spriteComponentStore, this.aimShootingComponent, this.projectileComponentStore, this.grenadeComponentStore, this.shotOriginComponentStore, this.damageDealtComponentStore, this.playerComponentStore, this.enemyComponentStore, this.damageTakenIntentComponentStore, this.itemBoxComponentStore, this.corpseComponentStore, this.grenadeExplosionHitBoxComponentStore, this.shapeHitMemoryComponentStore, this.particlesComponentStore, this.staggerComponentStore);
    this.damageProcessingSystem = new DamageProcessingSystem(
      this.damageTakenIntentComponentStore,
      this.healthComponentStore,
      this.deathIntentComponentStore,
      this.enemyComponentStore,
      this.bleedIntentComponentStore,
      this.bleedDamageComponentStore,
    );
    this.bleedingSystem = new BleedingSystem(
      this.bleedIntentComponentStore,
      this.bleedDamageComponentStore,
      this.healBleedIntentComponentStore,
    );
    this.terminatorSystem = new TerminatorSystem(this.entityFactory, this.intentClickComponentStore, this.movementIntentComponentStore, this.shootingCooldownComponentStore, this.intentShotComponentStore, this.wallHitComponentStore, this.grenadeCooldownComponentStore, this.intentGrenadeComponentStore, this.intentMeleeComponentStore, this.enemyDeadComponentStore, this.shapeComponentStore, this.projectileComponentStore);
    this.aiMovementBehaviorSystem = new AiMovementBehaviorSystem(this.positionComponentStore, this.velocityComponentStore, this.aiMovementOrderComponentStore, this.movementIntentComponentStore, this.debugManager);
    this.aiIntentProcessorSystem = new AiIntentProcessorSystem(this.positionComponentStore, this.aiMovementOrderComponentStore, this.pathFindingManager);
    this.deathProcessingSystem = new DeathProcessingSystem(this.levelManager, this.entityFactory, this.deathIntentComponentStore, this.playerComponentStore, this.healthComponentStore, this.enemyComponentStore, this.enemyDeadComponentStore, this.itemBoxComponentStore, this.corpseComponentStore, this.awaitingAnimationEndComponentStore, this.itemDropIntentComponentStore, this.positionComponentStore, this.spriteComponentStore, this.deathParticlesIntentComponentStore, this.epipenActiveComponentStore, this.soundEventBus);
    this.movementSystem = new MovementSystem(this.positionComponentStore, this.movementIntentComponentStore, this.playerComponentStore, this.movementImprecisionIntentComponentStore, this.inventoryComponentStore);
    this.animationSetterSystem = new AnimationSetterSystem(this.spriteManager, this.movementIntentComponentStore, this.positionComponentStore, this.directionAnimComponentStore, this.animationComponentStore, this.aiComponentStore, this.playerComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.wallHitComponentStore, this.projectileComponentStore, this.spriteComponentStore, this.offsetAppliedComponentStore, this.grenadeComponentStore, this.grenadeExplosionComponentStore, this.itemBoxComponentStore, this.awaitingAnimationEndComponentStore);
    this.animationSpriteSystem = new AnimationSpriteSystem(this.animationComponentStore, this.spriteComponentStore, this.awaitingAnimationEndComponentStore);
    this.footstepAudioSystem = new FootstepAudioSystem(this.soundEventBus, this.playerComponentStore, this.movementIntentComponentStore, this.animationComponentStore, this.spriteComponentStore);
    this.aiAttackBehaviorSystem = new AiAttackBehaviorSystem(this.positionComponentStore, this.intentShotComponentStore, this.aiComponentStore, this.aiAttackOrderComponentStore, this.playerComponentStore, this.aimShootingComponent, this.weaponSpriteAttachmentComponentStore, this.spriteComponentStore, this.enemyComponentStore, this.intentGrenadeComponentStore, this.intentMeleeComponentStore, this.disableAimComponentStore, this.weaponComponentStore);
    this.staggerSystem = new StaggerSystem(this.movementIntentComponentStore, this.staggerComponentStore, this.epipenActiveComponentStore);
    this.spriteLevelScaler = new SpriteLevelScalerSystem(this.spriteComponentStore, this.spriteManager, this.levelManager, this.worldTilemapManager, this.renderableComponentStore);
    this.weaponSpriteAttachmentSystem = new WeaponSpriteAttachmenPositiontSystem(this.positionComponentStore, this.weaponSpriteAttachmentComponentStore, this.zLayerComponentStore, this.spriteComponentStore, this.aimShootingComponent, this.disableAttachmentComponentStore);
    this.coreographerSystem = new CoreographerSystem(this.positionComponentStore, this.spriteComponentStore, this.visualRecoilComponentStore, this.weaponSpriteAttachmentComponentStore, this.aimShootingComponent, this.disableAttachmentComponentStore, this.transformComponentStore);
    this.levelProgressionSystem = new LevelProgressionSystem(this.enemiesKilledComponentStore, this.levelManager);
    this.reloadSystem = new ReloadSystem(this.soundEventBus, this.inventoryManager, this.reloadIntentComponentStore, this.playerComponentStore, this.inventoryComponentStore, this.weaponStatsComponentStore);
    this.medicalItemsSystem = new MedicalItemsSystem(
      this.inventoryManager,
      this.inventoryComponentStore,
      this.velocityComponentStore,
      this.playerComponentStore,
      this.healthComponentStore,
      this.intentShotComponentStore,
      this.medicalItemUseComponentStore,
      this.healBleedIntentComponentStore,
      this.combatStimActiveComponentStore,
      this.epipenActiveComponentStore,
      this.deathIntentComponentStore,
    );
    this.meleeAttackSystem = new MeleeAttackSystem(this.entityFactory, this.playerComponentStore, this.intentMeleeComponentStore, this.movementIntentComponentStore, this.positionComponentStore, this.aimShootingComponent, this.directionAnimComponentStore, this.renderableComponentStore, this.spriteComponentStore, this.weaponSpriteAttachmentComponentStore, this.zLayerComponentStore, this.shootingCooldownComponentStore, this.awaitingAnimationEndComponentStore, this.meleeIntentProcessedComponentStore);
    this.particleEmitterSystem = new ParticleEmitterSystem(this.rendererEngine, this.particlesComponentStore, this.deathParticlesIntentComponentStore, this.deathParticleBurstComponentStore);
    this.cameraFollowSystem = new CameraFollowSystem(this.cameraComponentStore, this.positionComponentStore, this.movementIntentComponentStore, this.cameraManager);
    this.dialogSystem = new DialogSystem(this.entityFactory, this.dialogIntentComponentStore, this.dialogComponentStore, this.dialogLifetimeComponentStore, this.dialogAnimComponentStore, this.bitmapTextComponentStore, this.animationComponentStore, this.playerComponentStore, this.positionComponentStore, this.spriteComponentStore);
    this.visibilitySystem = new VisibilitySystem(this.playerComponentStore, this.positionComponentStore, this.worldTilemapManager, this.visibilityManager);
    this.debugProcessor = new DebugProcessorSystem(this.debugManager, this.cameraManager, this.spriteComponentStore, this.positionComponentStore);
    this.inventorySystem = new InventorySystem(this.inventoryManager, this.inventoryComponentStore, this.playerComponentStore, this.bulletFiredComponentStore, this.grenadeFiredComponentStore);
    this.itemDropSpawnSystem = new ItemDropSpawnSystem(this.entityFactory, this.itemDropIntentComponentStore);
    this.itemDropUpdateSystem = new ItemDropUpdateSystem(this.entityFactory, this.spriteManager, this.inventoryManager, this.itemDroppedComponentStore, this.positionComponentStore, this.playerComponentStore, this.spriteComponentStore, this.inventoryComponentStore, this.soundEventBus);
    this.weaponImprecisionSystem = new WeaponImprecisionSystem(this.inventoryManager, this.playerComponentStore, this.positionComponentStore, this.spreadRadiusComponentStore, this.movementImprecisionIntentComponentStore, this.shootingRecoilIntentComponentStore, this.focusFireIntentComponentStore, this.inventoryComponentStore, this.combatStimActiveComponentStore);
    this.hudRuntimeSystem = new HudRuntimeSystem(this.uiRuntime, new HudPresenter(this.inventoryManager, this.playerInitialProperties, this.inventoryComponentStore, this.playerComponentStore, this.healthComponentStore, this.bleedDamageComponentStore, this.medicalItemUseComponentStore, this.positionComponentStore, this.spriteComponentStore, this.cameraManager));
    this.crosshairRuntimeSystem = new CrosshairRuntimeSystem(this.uiRuntime, new CrosshairPresenter(this.inventoryComponentStore, this.playerComponentStore, this.spreadRadiusComponentStore));
    this.deathRuntimeSystem = new DeathRuntimeSystem(this.uiRuntime, new DeathPresenter(this.levelManager));
    this.victoryRuntimeSystem = new VictoryRuntimeSystem(this.uiRuntime, new VictoryPresenter(this.levelManager));
    this.uiRuntimeInputSystem = new UIRuntimeInputSystem(new UIInputSystem(this.uiRuntime), new UIActionRouter([new DeathActionController(this.levelManager), new VictoryActionController(this.levelManager)]));
    this.uiRuntimeSyncSystem = new UIRuntimeSyncSystem(this.uiRuntime, uiRuntimeEntityFactory);
    this.weaponSwitchSystem = new WeaponSwitchSystem(this.inventoryManager, this.entityFactory, this.inventoryComponentStore, this.playerComponentStore);
    this.shadowPositionUpdateSystem = new ShadowPositionUpdateSystem(this.shadowComponentStore, this.parentEntityComponentStore, this.positionComponentStore, this.spriteComponentStore);
    this.visualEffectsSystem = new VisualEffectsSystem(this.entityFactory, this.intentShotComponentStore, this.animationComponentStore, this.weaponSpriteAttachmentComponentStore, this.parentEntityComponentStore, this.playerComponentStore, this.positionComponentStore, this.aimShootingComponent, this.spriteComponentStore, this.awaitingAnimationEndComponentStore, this.vfxComponentStore)
    this.weatherSystem = new WeatherSystem(this.weatherManager, this.spriteManager, this.rendererEngine, this.soundManager);
    this.audioSystem = new AudioSystem(this.soundManager, this.soundEventBus);
    this.levelManager.onBeforeLevelRebuild(() => this.clearTransientLevelState());
    this.logDebugKeybinds();
  }

  update() {
    this.uiRuntimeInputSystem.update(CoreManager.timeSinceLastRender);

    if (this.levelManager.updateStateTransitions()) {
      return;
    }

    this.syncGameplayCrosshairAndCursor();

    if (this.freezeManager.gameFrozen) {
      return;
    }

    this.inputDebugSystem.update(CoreManager.timeSinceLastRender);
    this.debugProcessor.update(CoreManager.timeSinceLastRender);
    this.inventoryDebugSystem.update(CoreManager.timeSinceLastRender);
    this.levelProgressionSystem.update(CoreManager.timeSinceLastRender);
    this.enemyLifecicleSystem.update(CoreManager.timeSinceLastRender);
    this.aiIntentProcessorSystem.update(CoreManager.timeSinceLastRender);
    this.reloadSystem.update(CoreManager.timeSinceLastRender);
    this.medicalItemsSystem.update(CoreManager.timeSinceLastRender);
    this.inputMovementSystem.update(CoreManager.timeSinceLastRender);
    this.weaponSwitchSystem.update(CoreManager.timeSinceLastRender);
    this.aiMovementBehaviorSystem.update(CoreManager.timeSinceLastRender);
    this.staggerSystem.update(CoreManager.timeSinceLastRender);
    this.collisionSystem.update(CoreManager.timeSinceLastRender);
    this.cameraFollowSystem.update();
    //this.aiAttackBehaviorSystem.update(CoreManager.timeSinceLastRender);
    this.shootingSystem.update(CoreManager.timeSinceLastRender);
    this.meleeAttackSystem.update(CoreManager.timeSinceLastRender);
    this.projectileSpawnSystem.update(CoreManager.timeSinceLastRender);
    this.grenadeSpawnSystem.update(CoreManager.timeSinceLastRender);
    this.projectileUpdateSystem.update(CoreManager.timeSinceLastRender);
    this.itemDropSpawnSystem.update(CoreManager.timeSinceLastRender);
    this.itemDropUpdateSystem.update(CoreManager.timeSinceLastRender);
    this.grenadeUpdateSystem.update(CoreManager.timeSinceLastRender);
    this.animationSetterSystem.update(CoreManager.timeSinceLastRender);
    this.animationSpriteSystem.update(CoreManager.timeSinceLastRender);
    this.collisionSystem.update(CoreManager.timeSinceLastRender);
    this.hitDetectionSystem.update(CoreManager.timeSinceLastRender);
    this.damageProcessingSystem.update(CoreManager.timeSinceLastRender);
    this.bleedingSystem.update(CoreManager.timeSinceLastRender);
    this.deathProcessingSystem.update(CoreManager.timeSinceLastRender);
    this.syncGameplayCrosshairAndCursor();
    this.footstepAudioSystem.update(CoreManager.timeSinceLastRender);
    this.movementSystem.update(CoreManager.timeSinceLastRender);
    this.weaponImprecisionSystem.update(CoreManager.timeSinceLastRender);
    this.shadowPositionUpdateSystem.update(CoreManager.timeSinceLastRender);
    // Visual attachment pass: first resolve the base pose, then let the coreographer override it when needed.
    this.weaponSpriteAttachmentSystem.update(CoreManager.timeSinceLastRender);
    this.coreographerSystem.update(CoreManager.timeSinceLastRender);
    this.visualEffectsSystem.update(CoreManager.timeSinceLastRender);
    this.dialogSystem.update(CoreManager.timeSinceLastRender);
    this.visibilitySystem.update(CoreManager.timeSinceLastRender);
    this.inventorySystem.update(CoreManager.timeSinceLastRender);
    this.particleEmitterSystem.update(CoreManager.timeSinceLastRender);
    this.audioSystem.update(CoreManager.timeSinceLastRender);
    this.hudRuntimeSystem.update(CoreManager.timeSinceLastRender);
    this.crosshairRuntimeSystem.update(CoreManager.timeSinceLastRender);
    this.deathRuntimeSystem.update(CoreManager.timeSinceLastRender);
    this.victoryRuntimeSystem.update(CoreManager.timeSinceLastRender);
    const viewportSize = this.cameraManager.getViewportSize();
    this.uiRuntime.updateViewport(viewportSize.width, viewportSize.height);
    this.uiRuntimeSyncSystem.update(CoreManager.timeSinceLastRender);
    this.spriteLevelScaler.update(CoreManager.timeSinceLastRender);
    this.weatherSystem.update(CoreManager.timeSinceLastRender);
    this.renderSystem.update(CoreManager.timeSinceLastRender);
    this.terminatorSystem.update(CoreManager.timeSinceLastRender);
    this.levelUpdateSystem.update(CoreManager.timeSinceLastRender);
  }

  initialize() {
    this.levelManager.update();
    this.syncGameplayCrosshairAndCursor();
  }

  bindGameManager(gameManager: GameManager): void {
    this.levelManager.bindGameManager(gameManager);
  }

  startNextLevelWithInventorySnapshot(inventorySnapshot: InventorySnapshot | null): void {
    this.levelManager.startNextLevelWithInventorySnapshot(inventorySnapshot);
    this.syncGameplayCrosshairAndCursor();
  }

  capturePlayerInventorySnapshot(): InventorySnapshot | null {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];

    if (playerEntity == null) {
      return null;
    }

    const inventory = this.inventoryComponentStore.getOrNull(playerEntity);

    if (!inventory) {
      return null;
    }

    return this.inventoryManager.createSnapshot(inventory);
  }

  private logDebugKeybinds(): void {
    if (GameplaySystemRunner.hasLoggedDebugKeybinds) {
      return;
    }

    GameplaySystemRunner.hasLoggedDebugKeybinds = true;

    const debugKeybinds = [
      '[DEBUG][KEYBINDS] Available shortcuts:',
      'Debug:',
      'Press O to toggle the debug panel.',
      'Press O to trigger the debug dialog ("Follow\\nme!").',
      'Press N to print the player inventory.',
      'Press Numpad+ or + to add 1000 money.',
      'Press Numpad* to add the debug weapon (SMG).',
      'Press Numpad0 to add +99 of all resources and +99999 money.',
      'Press Numpad1 to cycle rain: low rain -> medium rain -> high rain -> disabled.',
      'Press Numpad2 to toggle screen tint: no_screen_tint <-> screen_tint.',
      'Press K to damage the player by 20 HP.',
      'Press L to queue a bleed intent on the player.',
      'Press 0 to end the level and open the shop hub.',
      'Use the debug panel to toggle sprite bounds, debug paint, and AI path.',
      'Medical items:',
      'Press T to use a healpack.',
      'Press V to use a bandage.',
      'Press C to use an epipen.',
      'Press X to use combat stim.',
    ];

    for (const line of debugKeybinds) {
      console.log(line);
    }
  }

  private syncGameplayCrosshairAndCursor(): void {
    const levelEndReason = this.levelManager.getCurrentLevelEndReason();
    const gameplayActive = levelEndReason == null || levelEndReason === LevelEndReason.Reset;

    if (gameplayActive) {
      this.uiRuntime.pushOverlay(this.crosshairScreenId);
      this.rendererEngine.setCanvasCursor("none");
      return;
    }

    this.uiRuntime.popOverlay(this.crosshairScreenId);
    this.rendererEngine.setCanvasCursor("default");
  }

  private clearTransientLevelState(): void {
    this.intentClickComponentStore.clear();
    this.intentShotComponentStore.clear();
    this.intentGrenadeComponentStore.clear();
    this.intentMeleeComponentStore.clear();
    this.reloadIntentComponentStore.clear();
    this.damageTakenIntentComponentStore.clear();
    this.deathIntentComponentStore.clear();
    this.bleedIntentComponentStore.clear();
    this.bleedDamageComponentStore.clear();
    this.healBleedIntentComponentStore.clear();
    this.medicalItemUseComponentStore.clear();
    this.combatStimActiveComponentStore.clear();
    this.epipenActiveComponentStore.clear();
    this.shootingCooldownComponentStore.clear();
    this.shooterCooldownComponentStore.clear();
    this.grenadeCooldownComponentStore.clear();
    this.bulletFiredComponentStore.clear();
    this.grenadeFiredComponentStore.clear();
    this.focusFireIntentComponentStore.clear();
    this.movementImprecisionIntentComponentStore.clear();
    this.shootingRecoilIntentComponentStore.clear();
    this.spreadRadiusComponentStore.clear();
    this.staggerComponentStore.clear();
    this.visualRecoilComponentStore.clear();
  }
}

import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { AiAttackRangeComponent } from "../components/ai-attack-range.component.js";
import { AiMovementRadiusComponent } from "../components/ai-movement-radius.component.js";
import { AIComponent } from "../components/ai.component.js";
import { AimRotationShootingComponent } from "../components/aim-rotation-shooting.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { BitmapTextComponent } from "../components/bitmap-text.component.js";
import { CameraComponent } from "../components/camera-component.js";
import { CollisionBoxComponent } from "../components/collision-box-component.js";
import { DamageDealtComponent } from "../components/damage-dealt.component.js";
import { DialogAnimComponent } from "../components/dialog-anim.component.js";
import { DialogBubbleSpriteComponent } from "../components/dialog-bubble-sprite.component.js";
import { DialogLifetimeComponent } from "../components/dialog-lifetime.component.js";
import { DialogComponent } from "../components/dialog.component.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { DirectionComponent } from "../components/direction-component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { HealthComponent } from "../components/health.component.js";
import { HitBoxComponent } from "../components/hit-box-component.js";
import { InventoryComponent } from "../components/inventory-component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { ItemDroppedComponent } from "../components/item-dropped.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ShapeAngleComponent } from "../components/shape-angle.component.js";
import { ShapeComponent } from "../components/shape-component.js";
import { ShapeDimensionComponent } from "../components/shape-dimension.component.js";
import { ShapeDirectionComponent } from "../components/shape-direction.component.js";
import { ShapeHitMemoryComponent } from "../components/shape-hitmemory-component.js";
import { ShapePositionComponent } from "../components/shape-position.component.js";
import { ShooterCooldownComponent } from "../components/shooter-cooldown-component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { InventorySnapshot } from "../components/snapshots/inventory-snapshot.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { TravelTimeComponent } from "../components/travel-time.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { EnemyConfig, EnemyType } from "../components/types/enemy-type.js";
import { InventoryResourceType } from "../components/types/inventory-resource-type.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import { InventoryManager } from "../core/inventory-manager.js";

const GRENADE_SPRITE_WIDTH = 14;
const GRENADE_SPRITE_HEIGHT = 16;
const DEFAULT_DIALOG_FONT_ID = "04b_03";
const DEFAULT_DIALOG_TEXT_SCALE = 2;
const DEFAULT_DIALOG_TEXT_MAX_WIDTH = 96;
const DEFAULT_DIALOG_PADDING_X = 8;
const DEFAULT_DIALOG_PADDING_Y = 6;
const DEFAULT_DIALOG_TEXT_OFFSET_X = 8;
const DEFAULT_DIALOG_TEXT_OFFSET_Y = 6;
const DEFAULT_DIALOG_MIN_WIDTH = 48;
const DEFAULT_DIALOG_MIN_HEIGHT = 28;

export class EntityFactory {
  constructor(
    private entityManager: EntityManager,
    private inventoryManager: InventoryManager,
    private renderableComponentStore: ComponentStore<RenderableComponent>,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private enemyComponentStore: ComponentStore<EnemyComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private projectileComponentStore: ComponentStore<ProjectileComponent>,
    private shooterCooldownComponentStore: ComponentStore<ShooterCooldownComponent>,
    private velocityComponentStore: ComponentStore<VelocityComponent>,
    private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
    private animationComponentStore: ComponentStore<AnimationComponent>,
    private directionAnimationComponentStore: ComponentStore<DirectionAnimComponent>,
    private collisionBoxComponentStore: ComponentStore<CollisionBoxComponent>,
    private aiComponentStore: ComponentStore<AIComponent>,
    private healthComponentStore: ComponentStore<HealthComponent>,
    private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
    private damageDealtComponentStore: ComponentStore<DamageDealtComponent>,
    private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
    private aiAttackRangeComponentStore: ComponentStore<AiAttackRangeComponent>,
    private aiMovementRadiusComponentStore: ComponentStore<AiMovementRadiusComponent>,
    private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    private aimShootingComponentStore: ComponentStore<AimRotationShootingComponent>,
    private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private directionComponentStore: ComponentStore<DirectionComponent>,
    private weaponComponentStore: ComponentStore<WeaponComponent>,
    private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent>,
    private grenadeComponentStore: ComponentStore<GrenadeComponent>,
    private travelTimeComponentStore: ComponentStore<TravelTimeComponent>,

    private fuseTimerComponentStore: ComponentStore<FuseTimerComponent>,
    private shapeDimensionComponentStore: ComponentStore<ShapeDimensionComponent>,
    private shapePositionComponentStore: ComponentStore<ShapePositionComponent>,
    private shapeComponentStore: ComponentStore<ShapeComponent>,
    private shapeDirectionComponentStore: ComponentStore<ShapeDirectionComponent>,
    private shapeAngleComponentStore: ComponentStore<ShapeAngleComponent>,
    private shapeHitMemoryComponentStore: ComponentStore<ShapeHitMemoryComponent>,
    private cameraComponentStore: ComponentStore<CameraComponent>,
    private hitboxComponentStore: ComponentStore<HitBoxComponent>,
    private dialogComponentStore: ComponentStore<DialogComponent>,
    private dialogLifetimeComponentStore: ComponentStore<DialogLifetimeComponent>,
    private dialogBubbleSpriteComponentStore: ComponentStore<DialogBubbleSpriteComponent>,
    private bitmapTextComponentStore: ComponentStore<BitmapTextComponent>,
    private dialogAnimComponentStore: ComponentStore<DialogAnimComponent>,
    private inventoryComponentStore: ComponentStore<InventoryComponent>,
    private itemBoxComponentStore: ComponentStore<ItemBoxComponent>,
    private itemDroppedComponentStore: ComponentStore<ItemDroppedComponent>,
  ) {
  }

  createPlayer(startX: number, startY: number, hp: number, velocity: number, weaponConfig: WeaponConfig, initialWeaponType: WeaponType, inventorySnapshot?: InventorySnapshot) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.PLAYER_STILL, SpriteSheetName.PLAYER));
    this.cameraComponentStore.add(entityId, new CameraComponent(800, 600));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.PLAYER_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity))
    this.playerComponentStore.add(entityId, new PlayerComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    const inventoryComponent = inventorySnapshot
      ? InventoryComponent.fromSnapshot(inventorySnapshot)
      : this.inventoryManager.createDefaultInventory(initialWeaponType);

    this.inventoryComponentStore.add(entityId, inventoryComponent);
    const equippedWeapon = inventoryComponent.equippedWeaponType!
    this.createPlayerWeapon(entityId, equippedWeapon, WeaponConfig[equippedWeapon]);
    return entityId;
  }

  createProjectile(
    startX: number,
    startY: number,
    entityShooterId: number,
    damage: number,
    firedByPlayer: boolean,
    dirX: number, dirY: number,
    velocity: number,
    projectileSprite: SpriteName,
    projectileSpriteSheet: SpriteSheetName,
    projectileAnimation: AnimationName,
  ) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(projectileSprite, projectileSpriteSheet));
    this.animationComponentStore.add(entityId, new AnimationComponent(projectileAnimation));
    this.projectileComponentStore.add(entityId, new ProjectileComponent(damage, firedByPlayer));
    this.directionComponentStore.add(entityId, new DirectionComponent(dirX, dirY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.shotOriginComponentStore.add(entityId, new ShotOriginComponent(entityShooterId))
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent({ widthFactor: 1, heightFactor: 1, offsetX: 0, offsetY: 0 }));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    return entityId;
  }

  createGrenade(
    originX: number,
    originY: number,
    entityShooterId: number,
    dirX: number,
    dirY: number,
    velocity: number,
    travelDistance: { x: number, y: number },
  ) {
    const firedByPlayer = this.playerComponentStore.has(entityShooterId);
    const enemyType = this.enemyComponentStore.getOrNull(entityShooterId)?.enemyType;
    const grenadeDamage = firedByPlayer
      ? WeaponConfig[WeaponType.GRENADE].damage
      : enemyType === EnemyType.BOMBER
        ? EnemyConfig[EnemyType.BOMBER].damage
        : WeaponConfig[WeaponType.GRENADE].damage;
    const grenadeExplosionRadius = firedByPlayer
      ? WeaponConfig[WeaponType.GRENADE].explosionRadius
      : enemyType === EnemyType.BOMBER
        ? EnemyConfig[EnemyType.BOMBER].attackExplosionRadius
        : WeaponConfig[WeaponType.GRENADE].explosionRadius;

    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(
      originX - GRENADE_SPRITE_WIDTH / 2,
      originY - GRENADE_SPRITE_HEIGHT / 2,
    ));
    this.spriteComponentStore.add(entityId, new SpriteComponent(
      SpriteName.GRENADE_1,
      SpriteSheetName.PROJECTILE,
      GRENADE_SPRITE_WIDTH,
      GRENADE_SPRITE_HEIGHT,
    ));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.GRENADE_FIRED));
    this.directionComponentStore.add(entityId, new DirectionComponent(dirX, dirY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.shotOriginComponentStore.add(entityId, new ShotOriginComponent(entityShooterId))
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent({ widthFactor: 1, heightFactor: 1, offsetX: 0, offsetY: 0 }));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    this.travelTimeComponentStore.add(entityId, new TravelTimeComponent(Math.hypot(travelDistance.x, travelDistance.y) / velocity));
    this.fuseTimerComponentStore.add(entityId, new FuseTimerComponent(WeaponConfig[WeaponType.GRENADE].fuseTimer));
    this.grenadeComponentStore.add(entityId, new GrenadeComponent(
      grenadeDamage,
      firedByPlayer,
      grenadeExplosionRadius,
    ));
    return entityId;
  }

  createSoldier(enemyType: EnemyType, startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent(enemyType));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent());
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId, WeaponConfig.smg);
    return entityId;
  }

  createJuggernaut(enemyType: EnemyType, startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent(enemyType));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent());
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId, WeaponConfig.smg);
    return entityId;
  }

  createSniper(enemyType: EnemyType, startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent(enemyType));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent());
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId, WeaponConfig.smg);
    return entityId;
  }

  createKamikaze(enemyType: EnemyType, startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent(enemyType));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent());
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId, WeaponConfig.smg);
    return entityId;
  }

  createBomber(enemyType: EnemyType, startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent(enemyType));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent());
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId, WeaponConfig.smg);
    return entityId;
  }

  createHitBox(parentEntityId: number, startX: number, startY: number, shapeWidth: number, shapeHeight: number) {
    const entityId = this.entityManager.registerEntity();
    this.shapeComponentStore.add(entityId, new ShapeComponent(parentEntityId));
    //this.renderableComponentStore.add(entityId, new RenderableComponent());
    //this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    //this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.BLANK, SpriteSheetName.BLANK, shapeWidth, shapeHeight));
    this.shapePositionComponentStore.add(entityId, new ShapePositionComponent(startX, startY));
    this.shapeDimensionComponentStore.add(entityId, new ShapeDimensionComponent(shapeWidth, shapeHeight));
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.shapeHitMemoryComponentStore.add(entityId, new ShapeHitMemoryComponent());
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    return entityId;
  }

  createDialog(
    sourceEntityId: number,
    text: string,
    remainingTime: number,
    dialogType: string = "speech",
    followSource: boolean = true,
    destroyOnExpire: boolean = true,
  ) {
    const entityId = this.entityManager.registerEntity();
    const dialogAnimation = new DialogAnimComponent(AnimationName.DIALOG_BALLOON_IDLE);
    const animationComponent = new AnimationComponent(
      dialogAnimation.animationName,
      dialogAnimation.loop,
    );
    animationComponent.startAnimationTime = dialogAnimation.startAnimationTime;

    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(0, 0));
    this.dialogComponentStore.add(entityId, new DialogComponent(
      sourceEntityId,
      dialogType,
      text,
      followSource,
      destroyOnExpire,
    ));
    this.dialogLifetimeComponentStore.add(entityId, new DialogLifetimeComponent(remainingTime));
    this.dialogBubbleSpriteComponentStore.add(entityId, new DialogBubbleSpriteComponent(
      SpriteName.DIALOG_BALLOON_1,
      SpriteSheetName.DIALOG_BALLOON,
      DEFAULT_DIALOG_PADDING_X,
      DEFAULT_DIALOG_PADDING_Y,
      DEFAULT_DIALOG_TEXT_OFFSET_X,
      DEFAULT_DIALOG_TEXT_OFFSET_Y,
      DEFAULT_DIALOG_MIN_WIDTH,
      DEFAULT_DIALOG_MIN_HEIGHT,
    ));
    this.bitmapTextComponentStore.add(entityId, new BitmapTextComponent(
      text,
      DEFAULT_DIALOG_FONT_ID,
      DEFAULT_DIALOG_TEXT_SCALE,
      DEFAULT_DIALOG_TEXT_MAX_WIDTH,
      true,
      "center",
    ));
    this.dialogAnimComponentStore.add(entityId, dialogAnimation);
    this.animationComponentStore.add(entityId, animationComponent);
    this.spriteComponentStore.add(entityId, new SpriteComponent(
      SpriteName.DIALOG_BALLOON_1,
      SpriteSheetName.DIALOG_BALLOON,
      DEFAULT_DIALOG_MIN_WIDTH,
      DEFAULT_DIALOG_MIN_HEIGHT,
    ));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    return entityId;
  }

  destroyProjectile(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.animationComponentStore.remove(entityId);
    this.projectileComponentStore.remove(entityId);
    this.directionComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.hitboxComponentStore.remove(entityId);
    this.shotOriginComponentStore.remove(entityId);
    this.collisionBoxComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
    if (this.movementIntentComponentStore.has(entityId)) {
      this.movementIntentComponentStore.remove(entityId);
    }
  }

  destroyGrenade(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.animationComponentStore.remove(entityId);
    this.directionComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.shotOriginComponentStore.remove(entityId);
    this.collisionBoxComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
    this.travelTimeComponentStore.remove(entityId);
    this.fuseTimerComponentStore.remove(entityId);
    this.grenadeComponentStore.remove(entityId);
    if (this.movementIntentComponentStore.has(entityId)) {
      this.movementIntentComponentStore.remove(entityId);
    }
  }

  destroyEnemy(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.enemyDeadComponentStore.add(entityId, new EnemyDeadComponent());
    this.collisionBoxComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.aiComponentStore.remove(entityId);
    if (this.movementIntentComponentStore.has(entityId)) {
      this.movementIntentComponentStore.remove(entityId);
    }
    this.destroyWeapon(entityId);
  }

  destroyDialog(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.animationComponentStore.remove(entityId);
    this.dialogComponentStore.remove(entityId);
    this.dialogLifetimeComponentStore.remove(entityId);
    this.dialogBubbleSpriteComponentStore.remove(entityId);
    this.bitmapTextComponentStore.remove(entityId);
    this.dialogAnimComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
  }

  createPlayerWeapon(parentEntityId: number, weaponType: WeaponType, weaponConfig: WeaponConfig) {
    const entityId = this.entityManager.registerEntity();
    const weaponComponentResult = this.weaponComponentStore.add(parentEntityId, new WeaponComponent(weaponConfig.spriteName, SpriteSheetName.WEAPON, weaponConfig.animation, weaponConfig.pivotPointSprite));
    const wieldingEntityWeapon = weaponComponentResult.get(parentEntityId)!;
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(0, 0));
    if (wieldingEntityWeapon.spriteName != SpriteName.SHIELD) {
      this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 18));
    } else {
      this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 9));
    }
    this.aimShootingComponentStore.add(entityId, new AimRotationShootingComponent(0, wieldingEntityWeapon.configuredPivotRotation));
    this.animationComponentStore.add(entityId, new AnimationComponent(wieldingEntityWeapon.animationName));
    this.spriteComponentStore.add(entityId, new SpriteComponent(
      wieldingEntityWeapon.spriteName,
      wieldingEntityWeapon.spriteSheetName,
      wieldingEntityWeapon.weaponWidth,
      wieldingEntityWeapon.weaponHeight
    ));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    this.damageDealtComponentStore.add(parentEntityId, new DamageDealtComponent(weaponConfig.damage));
  }

  createWeapon(parentEntityId: number, weaponConfig: WeaponConfig) {
    const entityId = this.entityManager.registerEntity();
    const weaponComponentResult = this.weaponComponentStore.add(parentEntityId, new WeaponComponent(weaponConfig.spriteName, SpriteSheetName.WEAPON, weaponConfig.animation, weaponConfig.pivotPointSprite));
    const wieldingEntityWeapon = weaponComponentResult.get(parentEntityId)!;
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(0, 0));
    if (wieldingEntityWeapon.spriteName != SpriteName.SHIELD) {
      this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 18));
    } else {
      this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 9));
    }
    this.aimShootingComponentStore.add(entityId, new AimRotationShootingComponent(0, wieldingEntityWeapon.configuredPivotRotation));
    this.animationComponentStore.add(entityId, new AnimationComponent(wieldingEntityWeapon.animationName));
    this.spriteComponentStore.add(entityId, new SpriteComponent(
      wieldingEntityWeapon.spriteName,
      wieldingEntityWeapon.spriteSheetName,
      wieldingEntityWeapon.weaponWidth,
      wieldingEntityWeapon.weaponHeight
    ));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    this.damageDealtComponentStore.add(parentEntityId, new DamageDealtComponent(weaponConfig.damage));
  }

  createItemBox(startX: number, startY: number) {
    const entityId = this.entityManager.registerEntity();
    const boxHp = 1;
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY))
    this.healthComponentStore.add(entityId, new HealthComponent(boxHp));
    this.collisionBoxComponentStore.add(entityId, new CollisionBoxComponent())
    this.hitboxComponentStore.add(entityId, new HitBoxComponent());
    this.itemBoxComponentStore.add(entityId, new ItemBoxComponent());
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.WOODEN_BOX_1, SpriteSheetName.WOODEN_BOX));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.WOODEN_BOX, false));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
  }

  createItemDrop(startX: number, startY: number, resourceType: InventoryResourceType, amount: number, spriteName: SpriteName, spriteSheetName: SpriteSheetName, animationName: AnimationName) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(spriteName, spriteSheetName));
    this.animationComponentStore.add(entityId, new AnimationComponent(animationName));
    this.itemDroppedComponentStore.add(entityId, new ItemDroppedComponent(resourceType, amount));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
  }

  destroyItemBox(entityId: number) {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.healthComponentStore.remove(entityId);
    this.collisionBoxComponentStore.remove(entityId);
    this.hitboxComponentStore.remove(entityId);
    this.itemBoxComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.animationComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
  }

  destroyItemDrop(entityId: number) {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.animationComponentStore.remove(entityId);
    this.itemDroppedComponentStore.remove(entityId);
    this.zLayerComponentStore.remove(entityId);
  }

  destroyWeapon(parentEntityId: number) {
    const weaponAttachments = this.weaponSpriteAttachmentComponentStore.getValuesAndEntityId();
    const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == parentEntityId)!;
    const weaponEntityId = weaponAttachment[0];
    this.renderableComponentStore.remove(weaponEntityId);
    this.positionComponentStore.remove(weaponEntityId);
    this.aimShootingComponentStore.remove(weaponEntityId);
    this.weaponSpriteAttachmentComponentStore.remove(weaponEntityId);
    this.animationComponentStore.remove(weaponEntityId);
    this.zLayerComponentStore.remove(weaponEntityId);
    this.weaponMagazineComponentStore.remove(parentEntityId);
    this.shooterCooldownComponentStore.remove(parentEntityId);
    this.weaponComponentStore.remove(parentEntityId);
    this.damageDealtComponentStore.remove(parentEntityId);
  }

  destroyPlayerWeapon(parentEntityId: number) {
    const weaponAttachments = this.weaponSpriteAttachmentComponentStore.getValuesAndEntityId();
    const weaponAttachment = weaponAttachments.find((weaponAttachmentEntry) => weaponAttachmentEntry[1].parentEntityId == parentEntityId)!;
    const weaponEntityId = weaponAttachment[0];
    this.renderableComponentStore.remove(weaponEntityId);
    this.positionComponentStore.remove(weaponEntityId);
    this.aimShootingComponentStore.remove(weaponEntityId);
    this.weaponSpriteAttachmentComponentStore.remove(weaponEntityId);
    this.animationComponentStore.remove(weaponEntityId);
    this.zLayerComponentStore.remove(weaponEntityId);
    this.weaponMagazineComponentStore.remove(parentEntityId);
    this.shooterCooldownComponentStore.remove(parentEntityId);
    this.weaponComponentStore.remove(parentEntityId);
    this.damageDealtComponentStore.remove(parentEntityId);
  }

  destroyHitBox(entityId: number) {
    this.shapeComponentStore.remove(entityId);
    this.shapePositionComponentStore.remove(entityId);
    this.shapeDimensionComponentStore.remove(entityId);
    this.shapeHitMemoryComponentStore.remove(entityId);
    this.collisionBoxComponentStore.remove(entityId);
    return entityId;
  }

}

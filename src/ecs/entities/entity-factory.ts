import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { AnimationComponent } from "../components/animation.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ShooterComponent } from "../components/shooter-component.js";
import { SoldierComponent } from "../components/soldier.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { AIComponent } from "../components/ai.component.js";
import { HealthComponent } from "../components/health.component.js";
import { ShotOriginComponent } from "../components/shot-origin.component.js";
import { DamageComponent } from "../components/damage.component.js";
import { AiAttackRangeComponent } from "../components/ai-attack-range.component.js";
import { AiMovementRadiusComponent } from "../components/ai-movement-radius.component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { SPRITESHEET_MAPPED_VALUES } from "../../game/asset-manager/consts/sprite-mapped-values.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { DirectionComponent } from "../components/direction-component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";
import { GrenadeComponent } from "../components/grenade-component.js";
import { GrenadeBeltComponent } from "../components/grenade-belt.component.js";
import { TravelTimeComponent } from "../components/travel-time.component.js";
import { FuseTimerComponent } from "../components/fuse-timer.component.js";
import { EnemyType } from "../components/types/enemy-type.js";
import { ShapeDimensionComponent } from "../components/shape-dimension.component.js";
import { ShapePositionComponent } from "../components/shape-position.component.js";
import { ShapeComponent } from "../components/shape-component.js";
import { Shape } from "three/src/Three.js";
import { ShapeDirectionComponent } from "../components/shape-direction.component.js";
import { ShapeAngleComponent } from "../components/shape-angle.component.js";
import { RenderableComponent } from "../components/renderable-component.js";
import { ShapeHitMemoryComponent } from "../components/shape-hitmemory-component.js";

export class EntityFactory {
  constructor(
    private entityManager: EntityManager,
    private renderableComponentStore: ComponentStore<RenderableComponent>,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private enemyComponentStore: ComponentStore<EnemyComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private projectileComponentStore: ComponentStore<ProjectileComponent>,
    private shooterComponentStore: ComponentStore<ShooterComponent>,
    private velocityComponentStore: ComponentStore<VelocityComponent>,
    private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
    private animationComponentStore: ComponentStore<AnimationComponent>,
    private directionAnimationComponentStore: ComponentStore<DirectionAnimComponent>,
    private collisionComponentStore: ComponentStore<CollisionComponent>,
    private aiComponentStore: ComponentStore<AIComponent>,
    private healthComponentStore: ComponentStore<HealthComponent>,
    private shotOriginComponentStore: ComponentStore<ShotOriginComponent>,
    private damageComponentStore: ComponentStore<DamageComponent>,
    private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
    private aiAttackRangeComponentStore: ComponentStore<AiAttackRangeComponent>,
    private aiMovementRadiusComponentStore: ComponentStore<AiMovementRadiusComponent>,
    private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
    private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private directionComponentStore: ComponentStore<DirectionComponent>,
    private weaponComponentStore: ComponentStore<WeaponComponent>,
    private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent>,
    private grenadeComponentStore: ComponentStore<GrenadeComponent>,
    private grenadeBeltComponentStore: ComponentStore<GrenadeBeltComponent>,
    private travelTimeComponentStore: ComponentStore<TravelTimeComponent>,
    private fuseTimerComponentStore: ComponentStore<FuseTimerComponent>,
    private shapeDimensionComponentStore: ComponentStore<ShapeDimensionComponent>,
    private shapePositionComponentStore: ComponentStore<ShapePositionComponent>,
    private shapeComponentStore: ComponentStore<ShapeComponent>,
    private shapeDirectionComponentStore: ComponentStore<ShapeDirectionComponent>,
    private shapeAngleComponentStore: ComponentStore<ShapeAngleComponent>,
    private shapeHitMemoryComponentStore: ComponentStore<ShapeHitMemoryComponent>,
  ) {
  }

  createPlayer(startX: number, startY: number, hp: number, damage: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.PLAYER_STILL, SpriteSheetName.PLAYER));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.PLAYER_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity))
    this.playerComponentStore.add(entityId, new PlayerComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(WeaponConfig[WeaponType.PISTOL].shootingCooldown, WeaponConfig[WeaponType.GRENADE].shootingCooldown));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.PISTOL, SpriteSheetName.WEAPON, AnimationName.WEAPON_PISTOL));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(WeaponConfig[WeaponType.PISTOL].damage));
    this.weaponMagazineComponentStore.add(entityId, new WeaponMagazineComponent(
      3,
      WeaponConfig[WeaponType.PISTOL].maxBullets,
      WeaponConfig[WeaponType.PISTOL].maxBullets,
      WeaponConfig[WeaponType.PISTOL].reloadTime,
      false
    ));
    this.grenadeBeltComponentStore.add(entityId, new GrenadeBeltComponent(
      WeaponConfig[WeaponType.GRENADE].maxBullets,
      WeaponConfig[WeaponType.GRENADE].maxBullets,
    ))
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
    return entityId;
  }

  createProjectile(
    startX: number,
    startY: number,
    entityShooterId: number,
    dirX: number, dirY: number,
    velocity: number,
    projectileSprite: SpriteName,
    projectileSpriteSheet: SpriteSheetName,
    projectileAnimation: AnimationName,
    isGrenade: boolean,
    travelDistance: { x: number, y: number },
  ) {
    const entityId = this.entityManager.registerEntity();
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(projectileSprite, projectileSpriteSheet));
    this.animationComponentStore.add(entityId, new AnimationComponent(projectileAnimation));
    this.projectileComponentStore.add(entityId, new ProjectileComponent());
    this.directionComponentStore.add(entityId, new DirectionComponent(dirX, dirY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.shotOriginComponentStore.add(entityId, new ShotOriginComponent(entityShooterId))
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    if (isGrenade) {
      this.travelTimeComponentStore.add(entityId, new TravelTimeComponent(Math.hypot(travelDistance.x, travelDistance.y) / velocity));
      this.fuseTimerComponentStore.add(entityId, new FuseTimerComponent(WeaponConfig[WeaponType.GRENADE].fuseTimer));
      this.grenadeComponentStore.add(entityId, new GrenadeComponent());
    }
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
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds, 0));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SMG, SpriteSheetName.WEAPON, AnimationName.WEAPON_SMG));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
    console.log("Soldier ID", entityId);
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
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds, 0));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SHIELD, SpriteSheetName.WEAPON, AnimationName.WEAPON_SHIELD));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
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
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds, 0));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SNIPER, SpriteSheetName.WEAPON, AnimationName.WEAPON_SNIPER));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
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
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds, 0));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.KNIFE, SpriteSheetName.WEAPON, AnimationName.WEAPON_KNIFE));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
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
    this.shooterComponentStore.add(entityId, new ShooterComponent(0, attackCooldownInSeconds));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.GRENADE_1, SpriteSheetName.WEAPON, AnimationName.GRENADE_FIRED));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
    return entityId;
  }

  createCollisionShape(parentEntityId: number, startX: number, startY: number, shapeWidth: number, shapeHeight: number) {
    const entityId = this.entityManager.registerEntity();
    this.shapeComponentStore.add(entityId, new ShapeComponent(parentEntityId));
    //this.renderableComponentStore.add(entityId, new RenderableComponent());
    //this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    //this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.BLANK, SpriteSheetName.BLANK, shapeWidth, shapeHeight));
    this.shapePositionComponentStore.add(entityId, new ShapePositionComponent(startX, startY));
    this.shapeDimensionComponentStore.add(entityId, new ShapeDimensionComponent(shapeWidth, shapeHeight));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.shapeHitMemoryComponentStore.add(entityId, new ShapeHitMemoryComponent());
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    return entityId;
  }

  destroyProjectile(entityId: number): void {
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    //this.spriteComponentStore.remove(entityId);
    this.projectileComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.collisionComponentStore.remove(entityId);

    if (this.grenadeComponentStore.has(entityId)) {
      this.grenadeComponentStore.remove(entityId);
    }
  }

  destroyEnemy(entityId: number): void {
    ("death call, entity: ", entityId);
    this.renderableComponentStore.remove(entityId);
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId); //for some reason if we delete the spriteComponentStore render system crashes
    this.enemyDeadComponentStore.add(entityId, new EnemyDeadComponent());
    this.collisionComponentStore.remove(entityId);
    this.shooterComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.aiComponentStore.remove(entityId);
    this.weaponComponentStore.remove(entityId);
    this.destroyWeapon(entityId);
  }

  createWeapon(parentEntityId: number) {
    const entityId = this.entityManager.registerEntity();
    const wieldingEntityWeapon = this.weaponComponentStore.get(parentEntityId);
    this.renderableComponentStore.add(entityId, new RenderableComponent());
    this.positionComponentStore.add(entityId, new PositionComponent(0, 0));
    this.aimShootingComponentStore.add(entityId, new AimShootingComponent(0, 5));
    if (wieldingEntityWeapon.spriteName != SpriteName.SHIELD) {
      this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 16, 18, 18));
    } else {
      this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 16, 9, 9));
    }
    this.animationComponentStore.add(entityId, new AnimationComponent(wieldingEntityWeapon.animationName));
    this.spriteComponentStore.add(entityId, new SpriteComponent(
      wieldingEntityWeapon.spriteName,
      wieldingEntityWeapon.spriteSheetName,
      wieldingEntityWeapon.weaponWidth,
      wieldingEntityWeapon.weaponHeight
    ));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
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
    this.spriteComponentStore.remove(weaponEntityId);
    this.zLayerComponentStore.remove(weaponEntityId);
  }

  destroyCollisionShape(entityId: number) {
    //this.renderableComponentStore.remove(entityId);
    this.shapeComponentStore.remove(entityId);
    this.shapePositionComponentStore.remove(entityId);
    this.shapeDimensionComponentStore.remove(entityId);
    this.shapeHitMemoryComponentStore.remove(entityId);
    this.collisionComponentStore.remove(entityId);
    return entityId;
  }

}
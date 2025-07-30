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
import { EnemyDead } from "../components/enemy-dead.component.js";
import { AimShootingComponent } from "../components/aim-shooting.component.js";
import { WeaponSpriteAttachmentComponent } from "../components/weapon-attachment.component.js";
import { SPRITESHEET_MAPPED_VALUES } from "../../game/asset-manager/consts/sprite-mapped-values.js";
import { ZLayerComponent } from "../components/z-layer.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { DirectionComponent } from "../components/direction-component.js";
import { WeaponComponent } from "../components/weapon.component.js";
import { WeaponConfig, WeaponType } from "../components/types/weapon-type.js";
import { WeaponMagazineComponent } from "../components/weapon-magazine.component.js";

export class EntityFactory {
  constructor(
    private entityManager: EntityManager,
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
    private enemyDeadComponentStore: ComponentStore<EnemyDead>,
    private aimShootingComponentStore: ComponentStore<AimShootingComponent>,
    private weaponSpriteAttachmentComponentStore: ComponentStore<WeaponSpriteAttachmentComponent>,
    private zLayerComponentStore: ComponentStore<ZLayerComponent>,
    private directionComponentStore: ComponentStore<DirectionComponent>,
    private weaponComponentStore: ComponentStore<WeaponComponent>,
    private weaponMagazineComponentStore: ComponentStore<WeaponMagazineComponent>,
  ) {

  }

  createPlayer(startX: number, startY: number, hp: number, damage: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.PLAYER_STILL, SpriteSheetName.PLAYER));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.PLAYER_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity))
    this.playerComponentStore.add(entityId, new PlayerComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(WeaponConfig[WeaponType.RIFLE].shootingCooldown));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.RIFLE, SpriteSheetName.WEAPON, AnimationName.WEAPON_RIFLE));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(WeaponConfig[WeaponType.RIFLE].damage));
    this.weaponMagazineComponentStore.add(entityId, new WeaponMagazineComponent(
      1, 
      WeaponConfig[WeaponType.RIFLE].maxBullets, 
      WeaponConfig[WeaponType.RIFLE].maxBullets, 
      WeaponConfig[WeaponType.RIFLE].reloadTime, 
      false
    ));
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(3));
    this.createWeapon(entityId);
    return entityId;
  }

  createProjectile(startX: number, startY: number, entityShooterId: number, dirX: number, dirY: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.BULLET_1, SpriteSheetName.BULLET)); //placeholder
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.BULLET_FIRED));
    this.projectileComponentStore.add(entityId, new ProjectileComponent());
    this.directionComponentStore.add(entityId, new DirectionComponent(dirX, dirY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.shotOriginComponentStore.add(entityId, new ShotOriginComponent(entityShooterId))
    this.zLayerComponentStore.add(entityId, new ZLayerComponent(4));
    return entityId;
  }

  createSoldier(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds));
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

  createJuggernaut(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SMG, SpriteSheetName.WEAPON, AnimationName.WEAPON_SMG, 36, 20));
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

  createSniper(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SMG, SpriteSheetName.WEAPON, AnimationName.WEAPON_SMG, 36, 20));
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

  createKamikaze(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SMG, SpriteSheetName.WEAPON, AnimationName.WEAPON_SMG, 36, 20));
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

  createBomber(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity, velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent(attackCooldownInSeconds));
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.weaponComponentStore.add(entityId, new WeaponComponent(SpriteName.SMG, SpriteSheetName.WEAPON, AnimationName.WEAPON_SMG, 36, 20));
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

  destroyProjectile(entityId: number): void {
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.projectileComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.collisionComponentStore.remove(entityId);
  }

  destroyEnemy(entityId: number): void {
    console.log("death call, entity: ", entityId);
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId); //for some reason if we delete the spriteComponentStore render system crashes
    this.enemyDeadComponentStore.add(entityId, new EnemyDead());
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
    this.positionComponentStore.add(entityId, new PositionComponent(0, 0));
    this.aimShootingComponentStore.add(entityId, new AimShootingComponent(0, 5));
    this.weaponSpriteAttachmentComponentStore.add(entityId, new WeaponSpriteAttachmentComponent(parentEntityId, 16, 16, 18, 18));
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
    console.log("weaponEntityId", weaponEntityId);
    this.positionComponentStore.remove(weaponEntityId);
    this.aimShootingComponentStore.remove(weaponEntityId);
    this.weaponSpriteAttachmentComponentStore.remove(weaponEntityId);
    this.animationComponentStore.remove(weaponEntityId);
    this.spriteComponentStore.remove(weaponEntityId);
    this.zLayerComponentStore.remove(weaponEntityId);
  }

}
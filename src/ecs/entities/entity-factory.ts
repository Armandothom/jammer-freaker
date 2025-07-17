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
    private soldierComponentStore: ComponentStore<SoldierComponent>,
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
  ) {

  }

  createPlayer(startX: number, startY: number, hp: number, damage: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.PLAYER_STILL, SpriteSheetName.PLAYER));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.PLAYER_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity))
    this.aimShootingComponentStore.add(entityId, new AimShootingComponent(0));
    this.playerComponentStore.add(entityId, new PlayerComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    console.log("Player criado com sucesso", entityId);
    return entityId;
  }

  createProjectile(startX: number, startY: number, entityShooterId: number, velX: number, velY: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.BULLET_1, SpriteSheetName.BULLET)); //placeholder
    this.projectileComponentStore.add(entityId, new ProjectileComponent());
    this.velocityComponentStore.add(entityId, new VelocityComponent(velX, velY));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.shotOriginComponentStore.add(entityId, new ShotOriginComponent(entityShooterId))
    return entityId;
  }

  createSoldier(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.soldierComponentStore.add(entityId, new SoldierComponent()); // utiliza no animation setter system
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.shootingCooldownComponentStore.add(entityId, new ShootingCooldownComponent(attackCooldownInSeconds));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    console.log("Soldier Spawnado", entityId, startX, startY);
    return entityId;
  }

  createJuggernaut(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.aimShootingComponentStore.add(entityId, new AimShootingComponent(0));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.shootingCooldownComponentStore.add(entityId, new ShootingCooldownComponent(attackCooldownInSeconds));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    console.log("Juggernaut Spawnado", entityId, startX, startY);
    //console.log(this.directionAnimationComponentStore.get(entityId));
    return entityId;
  }

  createSniper(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.shootingCooldownComponentStore.add(entityId, new ShootingCooldownComponent(attackCooldownInSeconds));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    console.log("Sniper Spawnado", entityId, startX, startY);
    //console.log(this.directionAnimationComponentStore.get(entityId));
    return entityId;
  }

  createKamikaze(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.shootingCooldownComponentStore.add(entityId, new ShootingCooldownComponent(attackCooldownInSeconds));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    console.log("Kamikaze Spawnado", entityId, startX, startY);
    //console.log(this.directionAnimationComponentStore.get(entityId));
    return entityId;
  }

  createBomber(startX: number, startY: number, hp: number, damage: number, attackCooldownInSeconds: number, attackRange: number, movementRadius: number, velocity: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velocity, velocity));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.ENEMY_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new EnemyComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY));
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    this.healthComponentStore.add(entityId, new HealthComponent(hp));
    this.damageComponentStore.add(entityId, new DamageComponent(damage));
    this.shootingCooldownComponentStore.add(entityId, new ShootingCooldownComponent(attackCooldownInSeconds));
    this.aiAttackRangeComponentStore.add(entityId, new AiAttackRangeComponent(attackRange));
    this.aiMovementRadiusComponentStore.add(entityId, new AiMovementRadiusComponent(movementRadius));
    console.log("Bomber Spawnado", entityId, startX, startY);
    //console.log(this.directionAnimationComponentStore.get(entityId));
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
    console.log("Inimigo morto");
    this.enemyDeadComponentStore.add(entityId, new EnemyDead());
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.collisionComponentStore.remove(entityId);
    this.shooterComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.aiComponentStore.remove(entityId);
  }

}
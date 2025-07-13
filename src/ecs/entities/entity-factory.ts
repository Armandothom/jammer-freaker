import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
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
    //private intentClickComponentStore: ComponentStore<IntentClickComponent>
    private soldierComponentStore: ComponentStore<SoldierComponent>,
    private animationComponentStore: ComponentStore<AnimationComponent>,
    private directionAnimationComponentStore: ComponentStore<DirectionAnimComponent>,
    private collisionComponentStore: ComponentStore<CollisionComponent>,
    private aiComponentStore: ComponentStore<AIComponent>,
  ) {

  }

  createPlayer(startX: number, startY: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.SOLDER_STILL, SpriteSheetName.SOLDIER));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.SOLDIER_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.playerComponentStore.add(entityId, new PlayerComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    console.log("Player criado com sucesso");
    return entityId;
  }

  createProjectile(startX: number, startY: number, entityShooterId: number, velX: number, velY: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.BULLET_1, SpriteSheetName.BULLET)); //placeholder
    this.projectileComponentStore.add(entityId, new ProjectileComponent());
    this.velocityComponentStore.add(entityId, new VelocityComponent(velX, velY));
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    return entityId;
  }

  createEnemy(startX: number, startY: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.velocityComponentStore.add(entityId, new VelocityComponent(1, 1));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.SOLDER_STILL, SpriteSheetName.SOLDIER));
    this.animationComponentStore.add(entityId, new AnimationComponent(AnimationName.SOLDIER_STILL));
    this.directionAnimationComponentStore.add(entityId, new DirectionAnimComponent(AnimDirection.RIGHT));
    this.enemyComponentStore.add(entityId, new PlayerComponent());
    this.shooterComponentStore.add(entityId, new ShooterComponent())
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    this.soldierComponentStore.add(entityId, new SoldierComponent());
    this.collisionComponentStore.add(entityId, new CollisionComponent());
    this.aiComponentStore.add(entityId, new AIComponent());
    console.log("Inimigo criado com sucesso");
    return entityId;
  }

  destroyProjectile(entityId: number): void {
    this.positionComponentStore.remove(entityId);
    this.spriteComponentStore.remove(entityId);
    this.projectileComponentStore.remove(entityId);
    this.velocityComponentStore.remove(entityId);
    this.collisionComponentStore.remove(entityId);
}

}
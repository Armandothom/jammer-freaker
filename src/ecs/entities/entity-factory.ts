import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { IntentClickComponent } from "../components/intent-click.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ProjectileComponent } from "../components/projectile-component.js";
import { ProjectileShooterComponent } from "../components/projectile-shooter.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { VelocityComponent } from "../components/velocity-component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";

export class EntityFactory {
  constructor(
    private entityManager: EntityManager,
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private spriteComponentStore: ComponentStore<SpriteComponent>,
    private projectileComponentStore: ComponentStore<ProjectileComponent>,
    private projectileShooterComponentStore: ComponentStore<ProjectileShooterComponent>,
    private velocityComponentStore: ComponentStore<VelocityComponent>,
    private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
    //private intentClickComponentStore: ComponentStore<IntentClickComponent>
  ) {

  }
  
  createPlayer(startX: number, startY: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.SOLDER_STILL, SpriteSheetName.SOLDIER));
    this.playerComponentStore.add(entityId, new PlayerComponent());
    this.movementIntentComponentStore.add(entityId, new MovementIntentComponent(startX, startY))
    return entityId;
  }

  createProjectile(startX: number, startY: number, entityShooterId: number, velX: number, velY: number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.BULLET_1, SpriteSheetName.BULLET)); //placeholder
    this.projectileComponentStore.add(entityId, new ProjectileComponent());
    this.projectileShooterComponentStore.add(entityId, new ProjectileShooterComponent(entityShooterId));
    this.velocityComponentStore.add(entityId, new VelocityComponent(velX, velY));
    //this.intentClickComponentStore.add(entityId, new IntentClickComponent())
    return entityId;
  }

}
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";

export class EntityFactory {
  constructor(
    private entityManager : EntityManager,
    private positionComponent : ComponentStore<PositionComponent>,
    private spriteComponent : ComponentStore<SpriteComponent>) {
      
  }


  createPlayer() {
    const entityId = this.entityManager.registerEntity();
    this.positionComponent.add(entityId, new PositionComponent(20,30));
    this.spriteComponent.add(entityId, new SpriteComponent(SpriteName.GRASS_1));
  }


}
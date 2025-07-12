import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { ComponentStore } from "../core/component-store.js";
import { EntityManager } from "../core/entity-manager.js";

export class EntityFactory {
  constructor(
    private entityManager : EntityManager,
    private playerComponentStore : ComponentStore<PlayerComponent>,
    private positionComponentStore : ComponentStore<PositionComponent>,
    private spriteComponentStore : ComponentStore<SpriteComponent>) {
      
  }


  createPlayer(startX : number, startY : number) {
    const entityId = this.entityManager.registerEntity();
    this.positionComponentStore.add(entityId, new PositionComponent(startX, startY));
    this.spriteComponentStore.add(entityId, new SpriteComponent(SpriteName.SOLDER_STILL, SpriteSheetName.SOLDIER));
    this.playerComponentStore.add(entityId, new PlayerComponent());
  }

}
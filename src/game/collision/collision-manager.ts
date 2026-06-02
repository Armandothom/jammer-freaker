import { PositionComponent } from "../../ecs/components/position.component.js";
import { SpriteComponent } from "../../ecs/components/sprite.component.js";
import { ComponentStore } from "../../ecs/core/component-store.js";
import { WorldTilemapManager } from "../world/world-tilemap-manager.js";

export class CollisionManager {
  constructor(
    private worldTilemapManager : WorldTilemapManager,
    private spriteComponent : ComponentStore<SpriteComponent>,
    private positionComponent : ComponentStore<PositionComponent>) {;
  }


  public detectEntityOccupiedTiles(entityId : number) : Array<string> {
    const occupiedTiles : Array<string> = [];
    const position = this.positionComponent.getOrNull(entityId);
    const sprite = this.spriteComponent.getOrNull(entityId);
    if(!position || !sprite) {
      console.error(`No sprite or position found for ${entityId}`);
      return occupiedTiles;
    }
    const tileTopLeft = this.worldTilemapManager.worldToTile(position.x, position.y);
    const tileBottomRight = this.worldTilemapManager.worldToTile(position.x + sprite.width, position.y + sprite.height);
    for (let x = tileTopLeft.tileX; x <= tileBottomRight.tileX; x++) {
      for (let y = tileTopLeft.tileY; y <= tileBottomRight.tileY; y++) {
        occupiedTiles.push(this.worldTilemapManager.setTilemapKey(x, y));
      }
    }
    return occupiedTiles;
  }

}
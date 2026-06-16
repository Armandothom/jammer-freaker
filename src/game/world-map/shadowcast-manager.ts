import { PositionComponent } from "../../ecs/components/position.component.js";
import { SpriteComponent } from "../../ecs/components/sprite.component.js";
import { ComponentStore } from "../../ecs/core/component-store.js";
import { CameraManager } from "./camera-manager.js";
import { WorldTilemapManager } from "./world-tilemap-manager.js";

export class ShadowcastManager {
  constructor(
    private worldTilemapManager : WorldTilemapManager,
    private spriteComponent : ComponentStore<SpriteComponent>,
    private positionComponent : ComponentStore<PositionComponent>) {;
  }


  public setShadowcast() {


  }

  private mapCornersShadowcast() {

  }

}
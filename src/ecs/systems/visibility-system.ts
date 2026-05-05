import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { CameraManager } from "../../game/world/camera-manager.js";
import { OrderDebuggerOrchestrator } from "../debugger-orders/order-debugger-orchestrator.js";
import { WorldMapCoordinates } from "../../game/world/types/tilemap-tile.js";
import { DirectionAnimComponent } from "../components/direction-anim.component.js";
import { AnimDirection } from "../components/types/anim-direction.js";
import { SpriteComponent } from "../components/sprite.component.js";

export class VisibilitySystem implements ISystem {
  constructor(
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private directionAnimComponentStore: ComponentStore<DirectionAnimComponent>,
    private spriteComponent : ComponentStore<SpriteComponent>,
    private visibilityManager: VisibilityManager,
    private cameraManager :  CameraManager
  ) { }

  update(_: number): void {
    const originPosition = this.setEyeLevelOriginPoint();
    this.visibilityManager.setCurrentVisibilityRayPoints(originPosition);
  }

  private setEyeLevelOriginPoint() : WorldMapCoordinates {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];
    const playerPosition = this.positionComponentStore.get(playerEntity);
    const animDirectionComponent = this.directionAnimComponentStore.get(playerEntity);
    if(animDirectionComponent.xDirection == AnimDirection.LEFT) {
      return {
        x : playerPosition.x + 8,
        y : playerPosition.y + 16
      }
    } else {
      const sprite = this.spriteComponent.get(playerEntity);
      return {
        x : (playerPosition.x + sprite.width) - 8,
        y : playerPosition.y + 16
      }
    }
  }

}

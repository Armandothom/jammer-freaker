import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { WorldMapCoordinates } from "../../game/world/types/tilemap-tile.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { PlayerFovComponent } from "../components/player-fov.component.js";

export class VisibilitySystem implements ISystem {
  constructor(
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private playerFovComponentStore: ComponentStore<PlayerFovComponent>,
    private spriteComponent : ComponentStore<SpriteComponent>,
    private visibilityManager: VisibilityManager,
    private playerFovComponent :  ComponentStore<PlayerFovComponent>
  ) { }

  update(_: number): void {
    const playerEntity = this.playerComponentStore.getAllEntities()[0];
    const originPosition = this.setEyeLevelOriginPoint(playerEntity);
    const playerFov = this.playerFovComponent.get(playerEntity);
    this.visibilityManager.setCurrentVisibilityRayPoints(originPosition, playerFov.angleRange);
  }

  private setEyeLevelOriginPoint(playerEntity : number) : WorldMapCoordinates {
    const playerPosition = this.positionComponentStore.get(playerEntity);
    const playerSprite = this.spriteComponent.get(playerEntity);
    const playerFovDirection = this.playerFovComponentStore.get(playerEntity);
    const deltaX = playerSprite.width * 0.5;
    const deltaY = playerSprite.height * 0.5;
    const positionCenter : WorldMapCoordinates = {
      x: playerPosition.x + deltaX,
      y: playerPosition.y + deltaY
    };
    let position = {
      x: positionCenter.x + (deltaX * Math.cos(playerFovDirection.angleRad + Math.PI)),
      y: positionCenter.y + (deltaY * Math.sin(playerFovDirection.angleRad + Math.PI))
    }
    return position;
  }

}

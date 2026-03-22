import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { VisibilityManager } from "../../game/visibility/visibility-manager.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";

export class VisibilitySystem implements ISystem {
  constructor(
    private playerComponentStore: ComponentStore<PlayerComponent>,
    private positionComponentStore: ComponentStore<PositionComponent>,
    private worldTilemapManager: WorldTilemapManager,
    private visibilityManager: VisibilityManager,
  ) { }

  update(_: number): void {
    if (!this.visibilityManager.fogOfWarEnabled) {
      this.visibilityManager.clear();
      return;
    }

    const [playerEntity] = this.playerComponentStore.getAllEntities();

    if (playerEntity === undefined) {
      this.visibilityManager.clear();
      return;
    }

    const playerPosition = this.positionComponentStore.getOrNull(playerEntity);

    if (!playerPosition) {
      this.visibilityManager.clear();
      return;
    }

    const visionOriginX = playerPosition.x + (this.worldTilemapManager.tileSize / 2);
    const visionOriginY = playerPosition.y + (this.worldTilemapManager.tileSize / 2);

    this.visibilityManager.updateVisibilityFromWorldPosition(
      visionOriginX,
      visionOriginY,
      this.worldTilemapManager,
    );
  }
}

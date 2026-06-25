import type { BuildingName } from "../../game/world-map/buildings/buildings-config.js";
import type { BuildingPlacementRect } from "../../game/world-map/buildings/building-types.js";

export class DemolitionBombComponent {
  public timer = 0;

  constructor(
    public buildingInstanceId: string,
    public buildingName: BuildingName,
    public rect: BuildingPlacementRect,
    public fuseTime: number,
  ) {
  }
}

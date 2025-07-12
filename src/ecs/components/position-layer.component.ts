import { PositionLayer } from "../../game/world/types/position-layer.enum.js";

export class PositionLayerComponent {
  public positionLayer : PositionLayer
  constructor(positionLayer : PositionLayer) {
    this.positionLayer = positionLayer;
  }
}
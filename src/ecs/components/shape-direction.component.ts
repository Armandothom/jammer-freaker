import { AnimDirection } from "./types/anim-direction.js";

export class ShapeDirectionComponent {
  public xDirection : AnimDirection
  constructor(xDirection : AnimDirection) {
    this.xDirection = xDirection;
  }
}

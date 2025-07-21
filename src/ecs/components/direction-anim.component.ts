import { AnimDirection } from "./types/anim-direction.js";

export class DirectionAnimComponent {
  public xDirection : AnimDirection
  public yDirection : AnimDirection
  constructor(xDirection : AnimDirection, yDirection = AnimDirection.TOP) {
    this.xDirection = xDirection;
    this.yDirection = yDirection;
  }
}

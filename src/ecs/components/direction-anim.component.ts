import { AnimDirection } from "./types/anim-direction.js";

export class DirectionAnimComponent {
  public direction : AnimDirection
  constructor(direction : AnimDirection) {
    this.direction = direction;
  }
}

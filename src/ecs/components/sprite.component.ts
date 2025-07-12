import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class SpriteComponent {
  public spriteName : SpriteName;
  constructor(spriteName : SpriteName) {
    this.spriteName = spriteName;
  }
}
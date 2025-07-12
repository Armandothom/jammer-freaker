import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class SpriteComponent {
  public spriteName : SpriteName;
  public spriteSheet : SpriteSheetName;
  constructor(spriteName : SpriteName, spriteSheet : SpriteSheetName) {
    this.spriteName = spriteName;
    this.spriteSheet = spriteSheet;
  }
}
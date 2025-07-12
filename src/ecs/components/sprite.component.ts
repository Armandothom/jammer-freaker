import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class SpriteComponent {
  public spriteName : SpriteName;
  public spriteSheetName : SpriteSheetName;
  constructor(spriteName : SpriteName, spriteSheetName : SpriteSheetName) {
    this.spriteName = spriteName;
    this.spriteSheetName = spriteSheetName;
  }
}
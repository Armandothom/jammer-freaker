import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class SpriteComponent {
  public spriteName : SpriteName;
  public spriteSheetName : SpriteSheetName;
  public width : number;
  public height : number;
  constructor(spriteName : SpriteName, spriteSheetName : SpriteSheetName, width : number = 32, height : number = 32) {
    this.spriteName = spriteName;
    this.spriteSheetName = spriteSheetName;
    this.width = width;
    this.height = height;
  }
}
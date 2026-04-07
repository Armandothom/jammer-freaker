import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class SpriteComponent {
  public spriteName : SpriteName;
  public spriteSheetName : SpriteSheetName;
  public width : number;
  public height : number;
  public hasExplicitWidth: boolean;
  public hasExplicitHeight: boolean;

  constructor(spriteName : SpriteName, spriteSheetName : SpriteSheetName, width?: number, height?: number) {
    this.spriteName = spriteName;
    this.spriteSheetName = spriteSheetName;
    this.hasExplicitWidth = width !== undefined;
    this.hasExplicitHeight = height !== undefined;
    this.width = width ?? 32;
    this.height = height ?? 32;
  }
}

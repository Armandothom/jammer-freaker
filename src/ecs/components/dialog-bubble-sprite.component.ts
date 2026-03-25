import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class DialogBubbleSpriteComponent {
  constructor(
    public spriteName: SpriteName,
    public spriteSheetName: SpriteSheetName,
    public paddingX: number,
    public paddingY: number,
    public textOffsetX: number,
    public textOffsetY: number,
    public minWidth: number,
    public minHeight: number,
  ) {
  }
}

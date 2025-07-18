import { SpriteName } from "../../world/types/sprite-name.enum.js";


/**
 * The size inside the sprite cell
 */
export abstract class SpriteSpriteSheetspriteCellOffset {
    offsetX! : number //Where the sprite starts on the sprite cell X axis
    offsetY! : number //Where the sprite starts on the sprite cell Y axis
    width! : number //The real width of the sprite
    height! : number //The real height of the sprite
}
export abstract class SpriteSpriteSheetProperty {
  row! : number
  column! : number
  spriteCellOffset! : SpriteSpriteSheetspriteCellOffset
}
export abstract class SpriteSheetBlueprint {
  eachSpriteCellSize!: number
  afterRenderSpriteCellSize!: number
  rows!: number;
  columns!: number;
  sprites!: Map<SpriteName, SpriteSpriteSheetProperty>
  srcImagePath! : string;

}

export abstract class SpriteSheetAsset extends SpriteSheetBlueprint {
  texture! : WebGLTexture
  width!: number
  height!: number
}
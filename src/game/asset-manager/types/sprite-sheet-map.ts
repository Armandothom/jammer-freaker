import { SpriteName } from "../../world/types/sprite-name.enum.js";

export abstract class SpriteSheetBlueprint {
  eachSpriteSize!: number
  afterRenderSpriteSize!: number
  rows!: number;
  columns!: number;
  sprites!: Map<SpriteName, {row : number, column : number}>
  srcImagePath! : string;

}

export abstract class SpriteSheetAsset extends SpriteSheetBlueprint {
  texture! : WebGLTexture
  width!: number
  height!: number
}
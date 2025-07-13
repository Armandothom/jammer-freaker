import { AssetManager } from "./asset-manager.js";
import { SpriteName } from "../world/types/sprite-name.enum.js";
import { SPRITESHEET_MAPPED_VALUES } from "./consts/sprite-mapped-values.js";
import { SpriteSheetAsset } from "./types/sprite-sheet-map.js";
import { SpriteSheetName } from "./types/sprite-sheet-name.enum.js";

export class SpriteManager {
  private _mappedSpriteSheetAssets: Map<SpriteSheetName, SpriteSheetAsset> = new Map();
  private _gl: WebGL2RenderingContext;
  constructor(private assetManager: AssetManager) {
    const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
    this._gl = canvas?.getContext("webgl2")!;
    if (!this._gl) {
      alert("WebGL is not available");
      return;
    }
    this.loadSpriteManager();
  }

  /**
   * Used to store the spritesheet info, it takes the image that was loaded on asset manager.
   */
  private loadSpriteManager() {
    const spriteSheetKeys = SPRITESHEET_MAPPED_VALUES.keys();
    for (const spriteSheetKey of spriteSheetKeys) {
      const spriteSheetProperties = SPRITESHEET_MAPPED_VALUES.get(spriteSheetKey)!;
      const spriteSheetLoadedImage = this.assetManager.getLoadedImage(spriteSheetKey);
      this._mappedSpriteSheetAssets.set(spriteSheetKey, {
        ...spriteSheetProperties,
        texture: this.createWebGLTexture(spriteSheetLoadedImage),
        width: spriteSheetLoadedImage.width,
        height: spriteSheetLoadedImage.height
      })
    }
  }

  /**
   * We use this method to get the UV coordinates from the spriteSheet.
   * It is assumed that the spriteSheet image is flipped (since WebGL renders from bottom-left https://stackoverflow.com/a/74483656)
   * @param spriteName the name of the sprite for this BaseSprite.
   */
  public getUvCoordinates(spriteName: SpriteName, spriteSheetName: SpriteSheetName, mirrored = false) {
  const spriteProperties = this.getSpriteProperties(spriteName, spriteSheetName);
  const collisionBox = spriteProperties.sprite.collisionBox;
  const spriteSheetWidth = spriteProperties.spriteSheet.width;
  const spriteSheetHeight = spriteProperties.spriteSheet.height;
  const tileColumn = spriteProperties.sprite.column;
  const tileRow = spriteProperties.sprite.row;
  const spriteCellSize = spriteProperties.spriteSheet.eachSpriteCellSize;
  
  // We define where is the cell of the sprite on the spritesheet
  let cellX = (tileColumn - 1) * spriteCellSize;
  let cellY = (tileRow - 1) * spriteCellSize;
  
  // We define the offset of the sprite, on left,right,top,bottom inside the cell
  let xLeft = cellX + collisionBox.offsetX;
  let xRight = xLeft + collisionBox.width;
  let yTop = cellY + collisionBox.offsetY;
  let yBottom = yTop + collisionBox.height;
  
  //We normalize to between 0 and 1
  const xLeftNormalized = xLeft / spriteSheetWidth;
  const xRightNormalized = xRight / spriteSheetWidth;
  const yTopNormalized = 1 - (yTop / spriteSheetHeight);
  const yBottomNormalized = 1 - (yBottom / spriteSheetHeight);
  
  const normalUv = [
    xLeftNormalized, yTopNormalized,       //topleft
    xLeftNormalized, yBottomNormalized,    //bottomleft
    xRightNormalized, yTopNormalized,      //rightleft

    xRightNormalized, yBottomNormalized,   //bottomright
    xRightNormalized, yTopNormalized,      //topright
    xLeftNormalized, yBottomNormalized     //bottomleft
  ];
  const mirroredUv = [
    xRightNormalized, yTopNormalized,      //topright
    xRightNormalized, yBottomNormalized,   //bottomright
    xLeftNormalized, yTopNormalized,       //topleft

    xLeftNormalized, yBottomNormalized,    //bottoleft
    xLeftNormalized, yTopNormalized,       //topleft
    xRightNormalized, yBottomNormalized    //bottomright

  ]
  return mirrored ? mirroredUv : normalUv;
}

  public getSpriteProperties(spriteName: SpriteName, spriteSheetName: SpriteSheetName) {
    const spriteSheet = this.getSpriteSheetProperties(spriteSheetName);
    const sprite = spriteSheet?.sprites.get(spriteName);
    if (!sprite) {
      throw new Error("Sprite not found");
    }
    return {
      sprite,
      spriteSheet
    }
  }
   
  public getSpriteSheetProperties(spriteSheetName: SpriteSheetName) {
    const spriteSheet = this._mappedSpriteSheetAssets.get(spriteSheetName);
    if (!spriteSheet) {
      throw new Error("Sprite sheet not found");
    }
    return spriteSheet;
  }

  public getSpriteSheetImage(spriteSheetKey: SpriteSheetName) {
    const spriteSheetLoadedImage = this.assetManager.getLoadedImage(spriteSheetKey);
    return spriteSheetLoadedImage;
  }

  private createWebGLTexture(img: HTMLImageElement): WebGLTexture {
    const tex = this._gl.createTexture();
    this._gl.bindTexture(this._gl.TEXTURE_2D, tex);
    //We flip the WebGL on Y since it renders the image from bottom-left, instead of top-left.
    this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, true);
    //We set the blend func to ignore transparent backgrounds
    this._gl.enable(this._gl.BLEND);
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    //We set the texture loading paramters
    this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.NEAREST);
    this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.NEAREST);
    
    return tex;
  }


}
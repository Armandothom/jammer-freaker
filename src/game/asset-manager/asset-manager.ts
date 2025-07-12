import { SPRITESHEET_MAPPED_VALUES } from "./consts/sprite-mapped-values.js";

export class AssetManager {
  private _isLoaded: boolean = false;
  private _loadedImages: Map<string, HTMLImageElement> = new Map();

  public async loadAssets() {
    await this.loadSpriteSheets();
  }

  private async loadSpriteSheets() {
    const spriteSheetKeys = SPRITESHEET_MAPPED_VALUES.keys();
    for (const spriteSheetKey of spriteSheetKeys) {
      const spriteSheetProperties = SPRITESHEET_MAPPED_VALUES.get(spriteSheetKey);
      if (!spriteSheetProperties) {
        throw new Error("Spritesheet not found");
      }
      await new Promise((resolve) => {
        let spriteSheetImage = new Image();
        spriteSheetImage.src = spriteSheetProperties.srcImagePath;
        this._loadedImages.set(spriteSheetKey, spriteSheetImage);
        spriteSheetImage.onload = (() => {
          resolve(true);
        })
      })
    }
    this._isLoaded = true;
  }


  public get isLoaded() {
    return this._isLoaded;
  }

  public getLoadedImage(imageKey : string) : HTMLImageElement {
    const image = this._loadedImages.get(imageKey);
    if(!image) {
      throw new Error("Image not found");
    }
    return image;
  }

}
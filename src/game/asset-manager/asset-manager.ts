import { SPRITESHEET_MAPPED_VALUES } from "./consts/sprite-mapped-values.js";
import { FONT_MAPPED_VALUES } from "../text/consts/font-mapped-values.js";

export class AssetManager {
  private _isLoaded: boolean = false;
  private _loadedImages: Map<string, HTMLImageElement> = new Map();

  public async loadAssets() {
    await this.loadSpriteSheets();
    await this.loadFontAtlases();
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

  private async loadFontAtlases() {
    const mappedFonts = FONT_MAPPED_VALUES.entries();
    for (const [fontId, fontBlueprint] of mappedFonts) {
      await new Promise((resolve) => {
        const fontAtlasImage = new Image();
        fontAtlasImage.src = fontBlueprint.atlasImagePath;
        this._loadedImages.set(fontId, fontAtlasImage);
        fontAtlasImage.onload = (() => {
          resolve(true);
        });
      });
    }
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

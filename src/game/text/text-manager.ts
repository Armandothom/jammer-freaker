import { AssetManager } from "../asset-manager/asset-manager.js";
import { FONT_MAPPED_VALUES } from "./consts/font-mapped-values.js";
import {
  BitmapFontAsset,
  BitmapFontAtlasMapping,
  BitmapFontGlyphDefinition,
} from "./types/bitmap-font.js";

export class TextManager {
  private mappedFonts: Map<string, BitmapFontAsset> = new Map();
  private gl: WebGL2RenderingContext;

  constructor(private assetManager: AssetManager) {
    const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
    this.gl = canvas?.getContext("webgl2")!;
    if (!this.gl) {
      throw new Error("WebGL is not available");
    }
    this.loadFonts();
  }

  public getFont(fontId: string) {
    const font = this.mappedFonts.get(fontId);
    if (!font) {
      throw new Error(`Font not found: ${fontId}`);
    }
    return font;
  }

  public getGlyph(fontId: string, character: string) {
    const font = this.getFont(fontId);
    return font.glyphMap.get(character) ?? font.glyphMap.get("?")!;
  }

  public getGlyphUvCoordinates(fontId: string, character: string) {
    const font = this.getFont(fontId);
    const glyph = this.getGlyph(fontId, character);
    return this.getGlyphUvCoordinatesForFont(font, glyph);
  }

  public getGlyphUvCoordinatesForFont(
    font: BitmapFontAsset,
    glyph: BitmapFontGlyphDefinition,
  ) {
    const atlasFrame = this.getGlyphAtlasFrame(font, glyph);
    const xLeftNormalized = atlasFrame.x / font.atlasWidth;
    const xRightNormalized = (atlasFrame.x + atlasFrame.width) / font.atlasWidth;
    const yTopNormalized = atlasFrame.y / font.atlasHeight;
    const yBottomNormalized = (atlasFrame.y + atlasFrame.height) / font.atlasHeight;

    return [
      xLeftNormalized, yTopNormalized,
      xLeftNormalized, yBottomNormalized,
      xRightNormalized, yTopNormalized,

      xRightNormalized, yBottomNormalized,
      xRightNormalized, yTopNormalized,
      xLeftNormalized, yBottomNormalized,
    ];
  }

  private loadFonts() {
    for (const [fontId, fontBlueprint] of FONT_MAPPED_VALUES.entries()) {
      const atlasImage = this.assetManager.getLoadedImage(fontId);
      const glyphMapEntries = Object.keys(fontBlueprint.definition.glyphs)
        .map((character) => [character, fontBlueprint.definition.glyphs[character]] as [string, BitmapFontGlyphDefinition]);
      const glyphMap = new Map<string, BitmapFontGlyphDefinition>(glyphMapEntries);
      this.mappedFonts.set(fontId, {
        ...fontBlueprint.definition,
        texture: this.createWebGLTexture(atlasImage),
        atlasWidth: atlasImage.width,
        atlasHeight: atlasImage.height,
        glyphMap,
        atlasMapping: this.createAtlasMapping(fontBlueprint.definition, atlasImage),
      });
    }
  }

  private createAtlasMapping(
    font: Pick<BitmapFontAsset, "glyphs" | "size" | "lineHeight" | "padding">,
    atlasImage: HTMLImageElement,
  ): BitmapFontAtlasMapping {
    const glyphs = Object.keys(font.glyphs)
      .map((character) => font.glyphs[character]);
    const uniqueColumnStarts = [...new Set(glyphs.map((glyph) => glyph.x))]
      .sort((left, right) => left - right);
    const uniqueRowStarts = [...new Set(glyphs.map((glyph) => glyph.y))]
      .sort((left, right) => left - right);
    const logicalAtlasWidth = uniqueColumnStarts.length * font.size;
    const logicalAtlasHeight = uniqueRowStarts.length * font.lineHeight;

    return {
      atlasScaleX: atlasImage.width / logicalAtlasWidth,
      atlasScaleY: atlasImage.height / logicalAtlasHeight,
      rowIndexByStart: new Map(
        uniqueRowStarts.map((glyphStart, index) => [glyphStart, index]),
      ),
    };
  }

  private getGlyphAtlasFrame(
    font: BitmapFontAsset,
    glyph: BitmapFontGlyphDefinition,
  ) {
    const rowIndex = font.atlasMapping.rowIndexByStart.get(glyph.y) ?? 0;

    // Glyph coordinates are stored as logical cell starts. We remove inter-row padding and
    // apply the glyph offsets to reach the actual bitmap bounds inside the atlas cell.
    const logicalX = glyph.x + glyph.offsetX - 1;
    const logicalY = glyph.y - (rowIndex * font.padding) + (glyph.offsetY - 1);

    return {
      x: logicalX * font.atlasMapping.atlasScaleX,
      y: logicalY * font.atlasMapping.atlasScaleY,
      width: glyph.width * font.atlasMapping.atlasScaleX,
      height: glyph.height * font.atlasMapping.atlasScaleY,
    };
  }

  private createWebGLTexture(img: HTMLImageElement): WebGLTexture {
    const texture = this.gl.createTexture();
    if (!texture) {
      throw new Error("Could not create WebGL texture for bitmap font");
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    return texture;
  }
}

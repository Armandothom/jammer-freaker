export interface BitmapFontGlyphDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  advance: number;
  offsetX: number;
  offsetY: number;
}

export interface BitmapFontDefinition {
  fontId: string;
  source: string;
  atlas: string;
  size: number;
  lineHeight: number;
  ascent: number;
  descent: number;
  padding: number;
  charset: string;
  glyphs: Record<string, BitmapFontGlyphDefinition>;
}

export interface BitmapFontAtlasMapping {
  atlasScaleX: number;
  atlasScaleY: number;
  rowIndexByStart: Map<number, number>;
}

export interface BitmapFontAsset extends BitmapFontDefinition {
  texture: WebGLTexture;
  atlasWidth: number;
  atlasHeight: number;
  glyphMap: Map<string, BitmapFontGlyphDefinition>;
  atlasMapping: BitmapFontAtlasMapping;
}

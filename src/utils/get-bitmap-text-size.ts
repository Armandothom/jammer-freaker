import { FONT_MAPPED_VALUES } from "../game/text/consts/font-mapped-values.js";
import type {
  BitmapFontDefinition,
  BitmapFontGlyphDefinition,
} from "../game/text/types/bitmap-font.js";

const FALLBACK_CHARACTER = "?";

export interface BitmapTextPixelSize {
  width: number;
  height: number;
}

export interface BitmapTextPixelBounds extends BitmapTextPixelSize {
  left: number;
  top: number;
}

export function getBitmapTextSize(
  text: string,
  fontId: string,
  textScale: number,
): BitmapTextPixelSize {
  const bounds = getBitmapTextBounds(text, fontId, textScale);

  return {
    width: bounds.width,
    height: bounds.height,
  };
}

export function getBitmapTextBounds(
  text: string,
  fontId: string,
  textScale: number,
): BitmapTextPixelBounds {
  const font = getBitmapFontDefinition(fontId);
  return measureBitmapTextBounds(text, font, textScale);
}

function getBitmapFontDefinition(fontId: string): BitmapFontDefinition {
  const fontBlueprint = FONT_MAPPED_VALUES.get(fontId);

  if (!fontBlueprint) {
    throw new Error(`Font not found: ${fontId}`);
  }

  return fontBlueprint.definition;
}

function measureBitmapTextBounds(
  text: string,
  font: BitmapFontDefinition,
  textScale: number,
): BitmapTextPixelBounds {
  const effectiveScale = Math.max(textScale, 0.01);
  const lineHeight = font.lineHeight * effectiveScale;
  const fallbackGlyph = font.glyphs[FALLBACK_CHARACTER];

  if (!fallbackGlyph) {
    throw new Error(`Fallback glyph '${FALLBACK_CHARACTER}' not found in bitmap font.`);
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasVisibleGlyph = false;

  text.split("\n").forEach((line, lineIndex) => {
    let cursorX = 0;
    const lineY = lineIndex * lineHeight;

    for (const character of line) {
      const glyph = resolveGlyph(font, character, fallbackGlyph);

      if (glyph.width > 0 && glyph.height > 0) {
        const glyphLeft = cursorX + (glyph.offsetX * effectiveScale);
        const glyphTop = lineY + (glyph.offsetY * effectiveScale);
        const glyphRight = glyphLeft + (glyph.width * effectiveScale);
        const glyphBottom = glyphTop + (glyph.height * effectiveScale);

        minX = Math.min(minX, glyphLeft);
        minY = Math.min(minY, glyphTop);
        maxX = Math.max(maxX, glyphRight);
        maxY = Math.max(maxY, glyphBottom);
        hasVisibleGlyph = true;
      }

      cursorX += glyph.advance * effectiveScale;
    }
  });

  if (!hasVisibleGlyph) {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function resolveGlyph(
  font: BitmapFontDefinition,
  character: string,
  fallbackGlyph: BitmapFontGlyphDefinition,
) {
  return font.glyphs[character] ?? fallbackGlyph;
}

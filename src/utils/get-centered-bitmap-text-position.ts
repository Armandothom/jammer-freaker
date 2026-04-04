import fontAtlasDefinition from "../assets/font/font_atlas.json" with { type: "json" };
import type {
  BitmapFontDefinition,
  BitmapFontGlyphDefinition,
} from "../game/text/types/bitmap-font.js";
import type { Position } from "./types/position.js";

const DEFAULT_BITMAP_TEXT_SCALE = 2;
const FALLBACK_CHARACTER = "?";
const DEFAULT_BITMAP_FONT = fontAtlasDefinition as BitmapFontDefinition;

interface BitmapTextBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getCenteredBitmapTextPosition(
  text: string,
  spriteWidth: number,
  spriteHeight: number,
  scale = DEFAULT_BITMAP_TEXT_SCALE,
): Position {
  const bounds = measureBitmapTextBounds(
    text,
    DEFAULT_BITMAP_FONT,
    scale,
  );

  return {
    x: Math.round(((spriteWidth - bounds.width) / 2) - bounds.left),
    y: Math.round(((spriteHeight - bounds.height) / 2) - bounds.top),
  };
}

function measureBitmapTextBounds(
  text: string,
  font: BitmapFontDefinition,
  scale: number,
): BitmapTextBounds {
  const effectiveScale = Math.max(scale, 0.01);
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

import {
  BitmapTextComponent,
  BitmapTextHorizontalAlign,
} from "../../ecs/components/bitmap-text.component.js";
import {
  BitmapFontAsset,
  BitmapFontGlyphDefinition,
} from "./types/bitmap-font.js";

export interface BitmapTextLine {
  text: string;
  width: number;
}

export interface PositionedGlyph {
  character: string;
  glyph: BitmapFontGlyphDefinition;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BitmapTextLayout {
  glyphs: PositionedGlyph[];
  lines: BitmapTextLine[];
  width: number;
  height: number;
  lineHeight: number;
  contentWidth: number;
}

export class TextLayoutHelper {
  public static measure(
    bitmapText: BitmapTextComponent,
    font: BitmapFontAsset,
    contentWidth: number,
  ): BitmapTextLayout {
    return this.buildLayout(bitmapText, font, contentWidth, false);
  }

  public static layout(
    bitmapText: BitmapTextComponent,
    font: BitmapFontAsset,
    contentWidth: number,
  ): BitmapTextLayout {
    return this.buildLayout(bitmapText, font, contentWidth, true);
  }

  private static buildLayout(
    bitmapText: BitmapTextComponent,
    font: BitmapFontAsset,
    contentWidth: number,
    includeGlyphs: boolean,
  ): BitmapTextLayout {
    const effectiveScale = Math.max(bitmapText.scale, 0.01);
    const wrapWidth = this.resolveWrapWidth(bitmapText, contentWidth);
    const lines = this.buildLines(
      bitmapText.text,
      font,
      effectiveScale,
      bitmapText.autoWrap,
      wrapWidth,
    );
    const measuredWidth = lines.reduce((maxWidth, line) => Math.max(maxWidth, line.width), 0);
    const effectiveContentWidth = Number.isFinite(contentWidth)
      ? contentWidth
      : measuredWidth;
    const lineHeight = font.lineHeight * effectiveScale;
    const glyphs = includeGlyphs
      ? this.positionGlyphs(lines, bitmapText.horizontalAlign, font, effectiveScale, effectiveContentWidth, lineHeight)
      : [];

    return {
      glyphs,
      lines,
      width: measuredWidth,
      height: lines.length * lineHeight,
      lineHeight,
      contentWidth: effectiveContentWidth,
    };
  }

  private static resolveWrapWidth(
    bitmapText: BitmapTextComponent,
    contentWidth: number,
  ) {
    if (!bitmapText.autoWrap) {
      return Number.POSITIVE_INFINITY;
    }

    const widths = [bitmapText.maxWidth, contentWidth]
      .filter((width): width is number => typeof width === "number" && Number.isFinite(width) && width > 0);

    if (widths.length === 0) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.min(...widths);
  }

  private static buildLines(
    text: string,
    font: BitmapFontAsset,
    scale: number,
    autoWrap: boolean,
    wrapWidth: number,
  ): BitmapTextLine[] {
    const paragraphs = text.split("\n");
    const lines: BitmapTextLine[] = [];

    for (const paragraph of paragraphs) {
      if (autoWrap && Number.isFinite(wrapWidth) && wrapWidth > 0) {
        lines.push(...this.wrapParagraph(paragraph, font, scale, wrapWidth));
      } else {
        lines.push({
          text: paragraph,
          width: this.measureTextWidth(paragraph, font, scale),
        });
      }
    }

    if (lines.length === 0) {
      lines.push({ text: "", width: 0 });
    }

    return lines;
  }

  private static wrapParagraph(
    paragraph: string,
    font: BitmapFontAsset,
    scale: number,
    wrapWidth: number,
  ): BitmapTextLine[] {
    if (paragraph.length === 0) {
      return [{ text: "", width: 0 }];
    }

    const lines: BitmapTextLine[] = [];
    let remaining = paragraph;

    while (remaining.length > 0) {
      const remainingWidth = this.measureTextWidth(remaining, font, scale);
      if (remainingWidth <= wrapWidth) {
        lines.push({
          text: remaining,
          width: remainingWidth,
        });
        break;
      }

      let accumulatedWidth = 0;
      let lineEnd = 0;
      let lastWhitespaceBoundary = -1;

      for (let index = 0; index < remaining.length; index++) {
        const character = remaining[index];
        accumulatedWidth += this.getGlyphAdvance(font, character) * scale;

        if (character === " ") {
          lastWhitespaceBoundary = index + 1;
        }

        if (accumulatedWidth > wrapWidth) {
          if (index === 0) {
            lineEnd = 1;
          } else if (lastWhitespaceBoundary > 0) {
            lineEnd = lastWhitespaceBoundary;
          } else {
            lineEnd = index;
          }
          break;
        }

        lineEnd = index + 1;
      }

      const lineText = remaining.slice(0, lineEnd).replace(/\s+$/, "");
      const nextText = remaining.slice(lineEnd).replace(/^ +/, "");

      if (lineText.length === 0) {
        if (nextText.length === remaining.length) {
          const fallbackCharacter = remaining[0];
          lines.push({
            text: fallbackCharacter,
            width: this.measureTextWidth(fallbackCharacter, font, scale),
          });
          remaining = remaining.slice(1);
          continue;
        }

        remaining = nextText;
        continue;
      }

      lines.push({
        text: lineText,
        width: this.measureTextWidth(lineText, font, scale),
      });
      remaining = nextText;
    }

    if (lines.length === 0) {
      lines.push({ text: "", width: 0 });
    }

    return lines;
  }

  private static positionGlyphs(
    lines: BitmapTextLine[],
    horizontalAlign: BitmapTextHorizontalAlign,
    font: BitmapFontAsset,
    scale: number,
    contentWidth: number,
    lineHeight: number,
  ) {
    const glyphs: PositionedGlyph[] = [];

    lines.forEach((line, lineIndex) => {
      const alignOffset = this.getAlignOffset(horizontalAlign, contentWidth, line.width);
      const lineY = lineIndex * lineHeight;
      let cursorX = alignOffset;

      for (const character of line.text) {
        const glyph = font.glyphMap.get(character) ?? font.glyphMap.get("?")!;

        if (glyph.width > 0 && glyph.height > 0) {
          glyphs.push({
            character,
            glyph,
            x: cursorX + (glyph.offsetX * scale),
            y: lineY + (glyph.offsetY * scale),
            width: glyph.width * scale,
            height: glyph.height * scale,
          });
        }

        cursorX += glyph.advance * scale;
      }
    });

    return glyphs;
  }

  private static getAlignOffset(
    align: BitmapTextHorizontalAlign,
    contentWidth: number,
    lineWidth: number,
  ) {
    const availableWidth = Math.max(contentWidth - lineWidth, 0);

    if (align === "center") {
      return availableWidth / 2;
    }

    if (align === "right") {
      return availableWidth;
    }

    return 0;
  }

  private static measureTextWidth(
    text: string,
    font: BitmapFontAsset,
    scale: number,
  ) {
    let width = 0;

    for (const character of text) {
      width += this.getGlyphAdvance(font, character) * scale;
    }

    return width;
  }

  private static getGlyphAdvance(
    font: BitmapFontAsset,
    character: string,
  ) {
    const glyph = font.glyphMap.get(character) ?? font.glyphMap.get("?")!;
    return glyph.advance;
  }
}

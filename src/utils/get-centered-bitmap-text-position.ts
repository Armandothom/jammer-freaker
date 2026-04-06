import type { Position } from "./types/position.js";
import { getBitmapTextBounds } from "./get-bitmap-text-size.js";

const DEFAULT_BITMAP_TEXT_SCALE = 2;
const DEFAULT_BITMAP_FONT_ID = "04b_03";

export function getCenteredBitmapTextPosition(
  text: string,
  spriteWidth: number,
  spriteHeight: number,
  scale = DEFAULT_BITMAP_TEXT_SCALE,
): Position {
  const bounds = getBitmapTextBounds(text, DEFAULT_BITMAP_FONT_ID, scale);

  return {
    x: Math.round(((spriteWidth - bounds.width) / 2) - bounds.left),
    y: Math.round(((spriteHeight - bounds.height) / 2) - bounds.top),
  };
}

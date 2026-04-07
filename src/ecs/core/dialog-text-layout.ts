import {
  BitmapTextComponent,
  BitmapTextHorizontalAlign,
} from "../components/bitmap-text.component.js";

export const GAMEPLAY_DIALOG_FALLBACK_MAX_WIDTH = 96;
export const SHOP_DIALOG_FALLBACK_MAX_WIDTH = 160;

interface DialogBitmapTextLayout {
  autoWrap: boolean;
  horizontalAlign: BitmapTextHorizontalAlign;
  maxWidth: number | null;
}

export function createDialogBitmapTextComponent(
  text: string,
  fontId: string,
  scale: number,
  fallbackMaxWidth: number | null,
) {
  const layout = resolveDialogBitmapTextLayout(text, fallbackMaxWidth);

  return new BitmapTextComponent(
    text,
    fontId,
    scale,
    layout.maxWidth,
    layout.autoWrap,
    layout.horizontalAlign,
  );
}

export function applyDialogBitmapTextLayout(
  bitmapText: BitmapTextComponent,
  text: string,
  fallbackMaxWidth: number | null,
) {
  const layout = resolveDialogBitmapTextLayout(text, fallbackMaxWidth);

  bitmapText.text = text;
  bitmapText.maxWidth = layout.maxWidth;
  bitmapText.autoWrap = layout.autoWrap;
  bitmapText.horizontalAlign = layout.horizontalAlign;
}

function resolveDialogBitmapTextLayout(
  text: string,
  fallbackMaxWidth: number | null,
): DialogBitmapTextLayout {
  const hasManualLineBreaks = text.includes("\n");
  const shouldAutoWrap = !hasManualLineBreaks
    && typeof fallbackMaxWidth === "number"
    && Number.isFinite(fallbackMaxWidth)
    && fallbackMaxWidth > 0;

  return {
    autoWrap: shouldAutoWrap,
    horizontalAlign: "center",
    maxWidth: shouldAutoWrap ? fallbackMaxWidth : null,
  };
}

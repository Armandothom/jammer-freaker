import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";

export type UITextHorizontalAlign = "left" | "center" | "right";

export type UISpriteClip = {
  sourceOffsetX: number;
  sourceOffsetY: number;
  sourceWidth: number;
  sourceHeight: number;
  trimRenderedSize?: boolean;
};

export type UISpriteNineSlice = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type UISpriteVisual = {
  spriteName: SpriteName;
  spriteSheetName: SpriteSheetName;
  width?: number;
  height?: number;
  opacity?: number;
  rotationOffset?: number;
  clip?: UISpriteClip;
  nineSlice?: UISpriteNineSlice;
};

export type UITextVisual = {
  text: string;
  fontId?: string;
  scale?: number;
  maxWidth?: number | null;
  autoWrap?: boolean;
  horizontalAlign?: UITextHorizontalAlign;
  opacity?: number;
};

export type UIVisual = {
  sprite?: UISpriteVisual;
  text?: UITextVisual;
};

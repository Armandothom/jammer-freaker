import {
  type UIChildrenLayout,
  type UIPadding,
  ZERO_UI_PADDING,
} from "../layout/ui-layout-types.js";
import type { UITextHorizontalAlign } from "./ui-visual-types.js";

export type UITheme = {
  defaultChildrenLayout: UIChildrenLayout;
  defaultFontId: string;
  defaultHorizontalAlign: UITextHorizontalAlign;
  defaultPadding: UIPadding;
  defaultTextScale: number;
  defaultZLayer: number;
};

export const DEFAULT_UI_THEME: UITheme = {
  defaultChildrenLayout: {
    kind: "overlay",
  },
  defaultFontId: "04b_03",
  defaultHorizontalAlign: "left",
  defaultPadding: ZERO_UI_PADDING,
  defaultTextScale: 2,
  defaultZLayer: 4,
};

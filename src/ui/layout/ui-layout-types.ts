export type UISizeValue = number | "fill" | "content";

export type UIAxisAlign = "start" | "center" | "end";

export type UIAnchor =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export type UIPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type UIPartialPadding = Partial<UIPadding>;

export type UIChildrenLayout =
  | { kind: "overlay" }
  | { kind: "absolute" }
  | { kind: "stack-x"; gap?: number; align?: UIAxisAlign }
  | { kind: "stack-y"; gap?: number; align?: UIAxisAlign };

export type UINodeLayout = {
  width?: UISizeValue;
  height?: UISizeValue;
  anchor?: UIAnchor;
  offsetX?: number;
  offsetY?: number;
  padding?: UIPartialPadding;
  childrenLayout?: UIChildrenLayout;
};

export type UIRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type UIViewport = {
  width: number;
  height: number;
};

export const ZERO_UI_PADDING: UIPadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export function normalizePadding(padding?: UIPartialPadding | null): UIPadding {
  return {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0,
  };
}

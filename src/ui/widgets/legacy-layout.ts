import type { UIAnchor, UINodeLayout } from "../layout/ui-layout-types.js";

export function createLegacyPointLayout(
  anchor: UIAnchor,
  offsetX: number,
  offsetY: number,
): UINodeLayout {
  return {
    anchor,
    childrenLayout: {
      kind: "absolute",
    },
    height: 0,
    offsetX,
    offsetY,
    width: 0,
  };
}

export function resolveLegacyAnchorLayout(
  anchor: UIAnchor,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
): UINodeLayout {
  let nextOffsetX = offsetX;
  let nextOffsetY = offsetY;

  if (anchor === "top-right" || anchor === "bottom-right") {
    nextOffsetX -= width;
  }

  if (anchor === "bottom-left" || anchor === "bottom-right") {
    nextOffsetY -= height;
  }

  return {
    anchor,
    offsetX: nextOffsetX,
    offsetY: nextOffsetY,
  };
}

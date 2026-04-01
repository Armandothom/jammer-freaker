import { UIAnchor } from "./ui-anchor.js";

export type UIPadding = {
    offsetX: number;
    offsetY: number;
};

export const UIAnchorPadding: Record<UIAnchor, UIPadding> = {
    [UIAnchor.TOP_LEFT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.TOP_RIGHT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.BOTTOM_LEFT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.BOTTOM_RIGHT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.CENTER]: { offsetX: 0, offsetY: 0 },
};
import { UIAnchor } from "./ui-anchor.js";

export type GameUIPadding = {
    offsetX: number;
    offsetY: number;
};

export const GAME_UI_ANCHOR_PADDING: Record<UIAnchor, GameUIPadding> = {
    [UIAnchor.TOP_LEFT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.TOP_RIGHT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.BOTTOM_LEFT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.BOTTOM_RIGHT]: { offsetX: 20, offsetY: 20 },
    [UIAnchor.CENTER]: { offsetX: 0, offsetY: 0 },
};

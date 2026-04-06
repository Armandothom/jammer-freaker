import { ShopUIType } from "./shop-ui-type.js";
import { UIAnchor } from "./ui-anchor.js";

export type ShopUITypeLayoutPreset = {
    anchor: UIAnchor;
    offsetX: number;
    offsetY: number;
};

export const SHOP_UI_TYPE_LAYOUT_PRESET: Record<ShopUIType, ShopUITypeLayoutPreset> = {
    [ShopUIType.BACKGROUND]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 0,
        offsetY: 0,
    },

    [ShopUIType.WEAPON]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 326,
        offsetY: 96 + 16, // base
    },

    [ShopUIType.TAB_BUTTON]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 128,
        offsetY: 58,
    },

    [ShopUIType.BUY_BUTTON]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 20,
        offsetY: 20,
    },

    [ShopUIType.RETURN_BUTTON]: {
        anchor: UIAnchor.BOTTOM_RIGHT,
        offsetX: 192,
        offsetY: 96,
    },

    [ShopUIType.MONEY_TEXT]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 96,
        offsetY: 32,
    },
};
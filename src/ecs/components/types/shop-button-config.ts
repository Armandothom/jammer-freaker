import { SpriteName } from "../../../game/world/types/sprite-name.enum.js";

export const ShopButtonState = {
    NORMAL: "normal",
    SELECTED: "selected",
    DISABLED: "disabled",
} as const;

export const ShopButtonType = {
    BUY: "buy",
    TAB: "tab",
    RETURN: "return",
} as const;

export type ShopButtonState =
    typeof ShopButtonState[keyof typeof ShopButtonState];

export type ShopButtonType =
    typeof ShopButtonType[keyof typeof ShopButtonType];

export type ShopButtonVisualStateConfig = {
    spriteName: SpriteName;
};

export type ShopButtonConfig = {
    width: number;
    height: number;
    states: Record<ShopButtonState, ShopButtonVisualStateConfig>;
};

export const SHOP_BUTTON_CONFIG: Record<ShopButtonType, ShopButtonConfig> = {
    [ShopButtonType.BUY]: {
        width: 64,
        height: 32,
        states: {
            [ShopButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_1 },
            [ShopButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_1_SELECTED },
            [ShopButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_1_DISABLED },
        },
    },
    [ShopButtonType.TAB]: {
        width: 96,
        height: 32,
        states: {
            [ShopButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_2 },
            [ShopButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_2_SELECTED },
            [ShopButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_2_DISABLED },
        },
    },
    [ShopButtonType.RETURN]: {
        width: 128,
        height: 48,
        states: {
            [ShopButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_3 },
            [ShopButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_3_SELECTED },
            [ShopButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_3_DISABLED },
        },
    },
};
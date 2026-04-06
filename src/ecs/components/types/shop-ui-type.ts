export const ShopUIType = {
    BACKGROUND: "background",
    WEAPON: "weapon",
    TAB_BUTTON: "tab_button",
    BUY_BUTTON: "buy_button",
    RETURN_BUTTON: "return_button",
    MONEY_TEXT: "money_text",
} as const;

export type ShopUIType = typeof ShopUIType[keyof typeof ShopUIType];

export const ShopUIEntryType = {
    BACKGROUND: "background",
    ITEM: "item",
    BUTTON: "button",
    MONEY: "money"
} as const;

export type ShopUIEntryType = typeof ShopUIEntryType[keyof typeof ShopUIEntryType];

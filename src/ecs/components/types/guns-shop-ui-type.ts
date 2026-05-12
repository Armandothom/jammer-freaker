export const GunsShopUIType = {
    BACKGROUND: "background",
    WEAPON: "weapon",
    TAB_BUTTON: "tab_button",
    BUY_BUTTON: "buy_button",
    RETURN_BUTTON: "return_button",
    MONEY_TEXT: "money_text",
    UPGRADE_TAB_BUTTON: "upgrade_tab_button",
    UPGRADE_TAB_NAV_LEFT_BUTTON: "upgrade_tab_nav_left_button",
    UPGRADE_TAB_NAV_RIGHT_BUTTON: "upgrade_tab_nav_right_button",
    UPGRADE_ITEM: "upgrade_item",
} as const;

export type GunsShopUIType = typeof GunsShopUIType[keyof typeof GunsShopUIType];

export const GunsShopUIEntryType = {
    BACKGROUND: "background",
    ITEM: "item",
    BUTTON: "button",
    MONEY: "money"
} as const;

export type GunsShopUIEntryType = typeof GunsShopUIEntryType[keyof typeof GunsShopUIEntryType];

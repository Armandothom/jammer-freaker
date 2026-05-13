import type { UIAnchor } from "../layout/ui-layout-types.js";

export const COMBAT_SHOP_SKIN_MAP = {
    money: {
        anchor: "top-right" as UIAnchor,
        offsetX: 96,
        offsetY: 32,
    },
    returnButton: {
        anchor: "bottom-right" as UIAnchor,
        offsetX: 192,
        offsetY: 96,
    },
    tabs: {
        anchor: "top-right" as UIAnchor,
        offsetX: 128,
        offsetY: 58,
        stepX: 108,
    },
    upgradeRows: {
        anchor: "top-right" as UIAnchor,
        buttonOffsetX: 204,
        buttonOffsetY: -10,
        infoOffsetX: 96,
        offsetX: 326,
        offsetY: 164,
        stepY: 56,
    },
} as const;

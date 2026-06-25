import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";

export const MEDICAL_SHOP_SKIN_MAP = {
    background: {
        anchor: "top-left" as UIAnchor,
        height: 600,
        offsetX: 0,
        offsetY: 0,
        spriteName: SpriteName.GREY,
        spriteSheetName: SpriteSheetName.BLANK,
        width: 800,
    },
    itemRows: {
        anchor: "top-right" as UIAnchor,
        buttonOffsetY: -10,
        descriptionOffsetY: 18,
        iconToInfoGap: 8,
        infoToQuantityGap: 4,
        offsetX: 460,
        offsetY: 112,
        quantityColumnWidth: 28,
        quantityToButtonGap: 12,
        rowWidth: 448,
        stepY: 54,
    },
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
        gap: 12,
        offsetX: 128,
        offsetY: 58,
    },
    upgradeRows: {
        anchor: "top-right" as UIAnchor,
        buttonOffsetY: -10,
        descriptionOffsetY: 18,
        infoToLevelGap: 4,
        leadingPadding: 32,
        levelColumnWidth: 56,
        levelToButtonGap: 12,
        offsetX: 460,
        offsetY: 112,
        rowWidth: 448,
        stepY: 54,
    },
} as const;

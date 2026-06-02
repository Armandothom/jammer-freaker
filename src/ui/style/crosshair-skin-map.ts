import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";

export const CROSSHAIR_SKIN_MAP = {
    cardinal: {
        height: 3,
        spriteName: SpriteName.CROSSHAIR_CARDINAL,
        spriteSheetName: SpriteSheetName.CROSSHAIR,
        width: 16,
    },
    defaultCenter: {
        x: 0,
        y: 0,
    },
    defaultRadius: 6,
    visible: true,
} as const;

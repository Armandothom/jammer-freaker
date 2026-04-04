import { UIAnchor } from "./ui-anchor.js";
import { GameUIType } from "./game-ui-type.js";

export type GameUITypeLayoutPreset = {
    anchor: UIAnchor;
    offsetX: number;
    offsetY: number;
};

export const GAME_UI_TYPE_LAYOUT_PRESET: Record<GameUIType, GameUITypeLayoutPreset> = {
    [GameUIType.HEALTH_BAR]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 72,
        offsetY: 42,
    },

    [GameUIType.HEALTH_BAR_TEXT]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 72,
        offsetY: 48,
    },

    [GameUIType.WEAPON_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 26,
        offsetY: 34,
    },

    [GameUIType.WEAPON_FRAME]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 20,
        offsetY: 20,
    },

    [GameUIType.BULLET_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 32,
        offsetY: 72,
    },

    [GameUIType.BULLET_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 54,
        offsetY: 70,
    },

    [GameUIType.MAG_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 74,
        offsetY: 72,
    },

    [GameUIType.MAG_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 86,
        offsetY: 70,
    },

    [GameUIType.GRENADE_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 116,
        offsetY: 72,
    },

    [GameUIType.GRENADE_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 128,
        offsetY: 70,
    },


    [GameUIType.MONEY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 72,
        offsetY: 24,
    },

    [GameUIType.HOSTAGES]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 20,
        offsetY: 60,
    },

    [GameUIType.WEAPON_SLOT_1]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },
    [GameUIType.WEAPON_SLOT_2]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },
    [GameUIType.WEAPON_SLOT_3]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },
    [GameUIType.WEAPON_SLOT_4]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },

    [GameUIType.WEAPON_KEYBIND_1]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [GameUIType.WEAPON_KEYBIND_2]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [GameUIType.WEAPON_KEYBIND_3]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [GameUIType.WEAPON_KEYBIND_4]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [GameUIType.GRENADE_KEYBIND]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 140,
    },

    [GameUIType.GRENADE_SLOT]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 60,
        offsetY: 132,
    },

    [GameUIType.KNIFE_KEYBIND]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 192,
    },

    [GameUIType.KNIFE_SLOT]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 60,
        offsetY: 184,
    },

    [GameUIType.FLOATING_TEXT]: {
        anchor: UIAnchor.CENTER,
        offsetX: 0,
        offsetY: 0,
    },
};

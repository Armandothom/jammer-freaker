import { UIAnchor } from "./ui-anchor.js";
import { UIType } from "./ui-type.js";

export type UITypeLayoutPreset = {
    anchor: UIAnchor;
    offsetX: number;
    offsetY: number;
};

export const UI_TYPE_LAYOUT_PRESET: Record<UIType, UITypeLayoutPreset> = {
    [UIType.HEALTH_BAR]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 72,
        offsetY: 42,
    },

    [UIType.HEALTH_BAR_TEXT]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 72,
        offsetY: 48,
    },

    [UIType.WEAPON_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 26,
        offsetY: 34,
    },

    [UIType.WEAPON_FRAME]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 20,
        offsetY: 20,
    },

    [UIType.BULLET_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 32,
        offsetY: 72,
    },

    [UIType.BULLET_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 54,
        offsetY: 70,
    },

    [UIType.MAG_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 74,
        offsetY: 72,
    },

    [UIType.MAG_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 86,
        offsetY: 70,
    },

    [UIType.GRENADE_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 116,
        offsetY: 72,
    },

    [UIType.GRENADE_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 128,
        offsetY: 70,
    },


    [UIType.MONEY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 72,
        offsetY: 24,
    },

    [UIType.HOSTAGES]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 20,
        offsetY: 60,
    },

    [UIType.WEAPON_SLOT_1]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },
    [UIType.WEAPON_SLOT_2]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },
    [UIType.WEAPON_SLOT_3]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },
    [UIType.WEAPON_SLOT_4]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 76,
    },

    [UIType.WEAPON_KEYBIND_1]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [UIType.WEAPON_KEYBIND_2]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [UIType.WEAPON_KEYBIND_3]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [UIType.WEAPON_KEYBIND_4]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 52,
    },

    [UIType.GRENADE_KEYBIND]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 140,
    },

    [UIType.GRENADE_SLOT]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 60,
        offsetY: 132,
    },

    [UIType.KNIFE_KEYBIND]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 20,
        offsetY: 192,
    },

    [UIType.KNIFE_SLOT]: {
        anchor: UIAnchor.BOTTOM_LEFT,
        offsetX: 60,
        offsetY: 184,
    },

    [UIType.FLOATING_TEXT]: {
        anchor: UIAnchor.CENTER,
        offsetX: 0,
        offsetY: 0,
    },
};

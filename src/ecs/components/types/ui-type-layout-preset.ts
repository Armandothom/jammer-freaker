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
        offsetX: 20,
        offsetY: 20,
    },

    [UIType.HEALTH_BAR_TEXT]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 20,
        offsetY: 28,
    },

    [UIType.WEAPON_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 32,
        offsetY: 56,
    },

    [UIType.BULLET_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 76,
        offsetY: 58,
    },

    [UIType.BULLET_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 98,
        offsetY: 55,
    },

    [UIType.MAG_QUANTITY]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 124,
        offsetY: 58,
    },

    [UIType.MAG_ICON]: {
        anchor: UIAnchor.TOP_LEFT,
        offsetX: 138,
        offsetY: 56,
    },

    [UIType.MONEY]: {
        anchor: UIAnchor.TOP_RIGHT,
        offsetX: 40,
        offsetY: 28,
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

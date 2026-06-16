import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";

export const UIButtonState = {
  NORMAL: "normal",
  SELECTED: "selected",
  DISABLED: "disabled",
} as const;

export const UIButtonVariant = {
  PRIMARY: "primary",
  TAB: "tab",
  PROMINENT: "prominent",
  COMPACT: "compact",
} as const;

export type UIButtonState =
  typeof UIButtonState[keyof typeof UIButtonState];

export type UIButtonVariant =
  typeof UIButtonVariant[keyof typeof UIButtonVariant];

export type UIButtonVisualStateConfig = {
  spriteName: SpriteName;
};

export type UIButtonConfig = {
  width: number;
  height: number;
  states: Record<UIButtonState, UIButtonVisualStateConfig>;
};

export const UI_BUTTON_CONFIG: Record<UIButtonVariant, UIButtonConfig> = {
  [UIButtonVariant.PRIMARY]: {
    width: 64,
    height: 32,
    states: {
      [UIButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_1 },
      [UIButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_1_SELECTED },
      [UIButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_1_DISABLED },
    },
  },
  [UIButtonVariant.TAB]: {
    width: 96,
    height: 32,
    states: {
      [UIButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_2 },
      [UIButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_2_SELECTED },
      [UIButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_2_DISABLED },
    },
  },
  [UIButtonVariant.PROMINENT]: {
    width: 128,
    height: 48,
    states: {
      [UIButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_3 },
      [UIButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_3_SELECTED },
      [UIButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_3_DISABLED },
    },
  },
  [UIButtonVariant.COMPACT]: {
    width: 64,
    height: 32,
    states: {
      [UIButtonState.NORMAL]: { spriteName: SpriteName.BUTTON_4 },
      [UIButtonState.SELECTED]: { spriteName: SpriteName.BUTTON_4_SELECTED },
      [UIButtonState.DISABLED]: { spriteName: SpriteName.BUTTON_4_DISABLED },
    },
  },
};

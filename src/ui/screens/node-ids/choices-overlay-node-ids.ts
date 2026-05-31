export const CHOICES_OVERLAY_SCREEN_ID = "choices-overlay";

export const CHOICES_OVERLAY_MAX_CHOICES = 3;

export const CHOICES_OVERLAY_NODE_IDS = {
  frame: "choices-overlay.frame",
  root: "choices-overlay.root",
  choice(choiceIndex: number) {
    return {
      label: `choices-overlay.choice.${choiceIndex}.label`,
      root: `choices-overlay.choice.${choiceIndex}.root`,
    };
  },
} as const;

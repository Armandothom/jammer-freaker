import type { UIAction } from "./ui-action.js";

export const CHOICES_OVERLAY_UI_ACTION = {
  CLOSE: "choices-overlay.close",
  EXECUTE: "choices-overlay.execute",
} as const;

export type ChoicesOverlayChoiceId =
  | "destroy"
  | "pick-up"
  | "use";

export function createCloseChoicesOverlayAction(): UIAction {
  return {
    type: CHOICES_OVERLAY_UI_ACTION.CLOSE,
  };
}

export function createExecuteChoicesOverlayAction(choiceId: ChoicesOverlayChoiceId): UIAction {
  return {
    payload: {
      choiceId,
    },
    type: CHOICES_OVERLAY_UI_ACTION.EXECUTE,
  };
}

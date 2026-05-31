import type { ChoicesOverlayChoiceId } from "../input/choices-overlay-ui-actions.js";

export interface ChoicesOverlayChoiceViewModel {
  choiceId: ChoicesOverlayChoiceId;
  label: string;
  visible: boolean;
  x: number;
  y: number;
}

export interface ChoicesOverlayViewModel {
  choices: ChoicesOverlayChoiceViewModel[];
  frameHeight: number;
  frameWidth: number;
  x: number;
  y: number;
}

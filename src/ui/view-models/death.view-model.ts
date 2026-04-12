import type { UIButtonState } from "../style/ui-button-config.js";

export type DeathButtonViewModel = {
  buttonState: UIButtonState;
  text: string;
  visible: boolean;
};

export type DeathViewModel = {
  overlayVisible: boolean;
  promptText: string;
  quitButton: DeathButtonViewModel;
  retryButton: DeathButtonViewModel;
};

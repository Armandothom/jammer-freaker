import type { UIButtonState } from "../style/ui-button-config.js";

export type VictoryButtonViewModel = {
    buttonState: UIButtonState;
    text: string;
    visible: boolean;
};

export type VictoryViewModel = {
    overlayVisible: boolean;
    promptText: string;
    missionStats: string;
    nextMissionButton: VictoryButtonViewModel;
    goToShopButton: VictoryButtonViewModel;
};

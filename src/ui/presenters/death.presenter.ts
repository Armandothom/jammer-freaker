import { LevelEndReason, LevelManager } from "../../ecs/core/level-manager.js";
import { DEATH_SCREEN_SKIN_MAP } from "../style/death-screen-skin-map.js";
import { UIButtonState } from "../style/ui-button-config.js";
import type { DeathViewModel } from "../view-models/death.view-model.js";

export class DeathPresenter {
    constructor(
        private levelManager: LevelManager,
    ) {
    }

    public buildViewModel(): DeathViewModel {
        const overlayVisible = this.levelManager.getCurrentLevelEndReason() === LevelEndReason.PlayerDeath;
        const promptText = DEATH_SCREEN_SKIN_MAP.deathPrompt.text;

        return {
            overlayVisible,
            promptText,
            quitButton: {
                buttonState: UIButtonState.NORMAL,
                text: DEATH_SCREEN_SKIN_MAP.quitButton.text,
                visible: overlayVisible,
            },
            retryButton: {
                buttonState: UIButtonState.NORMAL,
                text: DEATH_SCREEN_SKIN_MAP.retryButton.text,
                visible: overlayVisible,
            },
        };
    }
}

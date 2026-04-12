import { LevelEndReason, LevelManager, LevelStats } from "../../ecs/core/level-manager.js";
import { UIButtonState } from "../style/ui-button-config.js";
import { VICTORY_SCREEN_SKIN_MAP } from "../style/victory-screen-skin-map.js";
import { VictoryViewModel } from "../view-models/victory.view-model.js";

export class VictoryPresenter {
    constructor(
        private levelManager: LevelManager,
    ) {
    }

    public buildViewModel(): VictoryViewModel {
        const overlayVisible = this.levelManager.getCurrentLevelEndReason() === LevelEndReason.Victory;
        const missionStatsInfo = this.levelManager.levelStats;
        const promptText = VICTORY_SCREEN_SKIN_MAP.victoryPrompt.text;
        const missionStats = this.formatLevelStats(missionStatsInfo);

        return {
            overlayVisible,
            promptText,
            missionStats,
            nextMissionButton: {
                buttonState: UIButtonState.NORMAL,
                text: VICTORY_SCREEN_SKIN_MAP.nextMissionButton.text,
                visible: overlayVisible,
            },
            goToShopButton: {
                buttonState: UIButtonState.NORMAL,
                text: VICTORY_SCREEN_SKIN_MAP.goToShopButton.text,
                visible: overlayVisible,
            },
        };
    }

    private formatLevelStats(stats: LevelStats): string {
        return (
            `Mission Time: ${stats.time}\n` +
            `Enemies Killed: ${stats.enemiesKilled}\n` +
            `Money: ${stats.currentMoney} + ${stats.extraMoney}`
        );
    }
}

import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { VictoryPresenter } from "../../ui/presenters/victory.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { VICTORY_SCREEN_NODE_IDS } from "../../ui/screens/node-ids/victory-screen-node-ids.js";
import { UI_BUTTON_CONFIG, UIButtonState, UIButtonVariant } from "../../ui/style/ui-button-config.js";
import { ISystem } from "./system.interface.js";

export class VictoryRuntimeSystem implements ISystem {
    private uiNodeBinder: UINodeBinder | null = null;
    private readonly screenId = "victory_screen";

    constructor(
        private uiRuntime: UIRuntime,
        private victoryPresenter: VictoryPresenter,
    ) {

    }
    update(_deltaTime: number): void {
        const binder = this.getBinder();
        const viewModel = this.victoryPresenter.buildViewModel();

        if (!viewModel.overlayVisible) {
            this.uiRuntime.popOverlay(this.screenId);
            return;
        } // removes the overlay if the level didn't end by Victory

        this.uiRuntime.pushOverlay(this.screenId);

        binder.setVisibility(VICTORY_SCREEN_NODE_IDS.root, true);
        binder.patchText(VICTORY_SCREEN_NODE_IDS.victoryPrompt.text, {
            text: viewModel.promptText,
        });

        binder.setVisibility(VICTORY_SCREEN_NODE_IDS.missionStats.root, true);
        binder.patchText(VICTORY_SCREEN_NODE_IDS.missionStats.root, {
            text: viewModel.missionStats,
        });

        binder.setVisibility(VICTORY_SCREEN_NODE_IDS.nextMissionButton.root, viewModel.nextMissionButton.visible);
        binder.patchText(VICTORY_SCREEN_NODE_IDS.nextMissionButton.root, {
            text: viewModel.nextMissionButton.text,
        });

        binder.patchInteraction(VICTORY_SCREEN_NODE_IDS.nextMissionButton.root, {
            disabled: viewModel.nextMissionButton.buttonState === UIButtonState.DISABLED,
        });

        binder.patchSprite(VICTORY_SCREEN_NODE_IDS.nextMissionButton.root, {
            spriteName: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].states[viewModel.nextMissionButton.buttonState].spriteName,
        });

        binder.setVisibility(VICTORY_SCREEN_NODE_IDS.goToShopHubButton.root, viewModel.goToShopHubButton.visible);
        binder.patchText(VICTORY_SCREEN_NODE_IDS.goToShopHubButton.root, {
            text: viewModel.goToShopHubButton.text,
        });

        binder.patchInteraction(VICTORY_SCREEN_NODE_IDS.goToShopHubButton.root, {
            disabled: viewModel.goToShopHubButton.buttonState === UIButtonState.DISABLED,
        });

        binder.patchSprite(VICTORY_SCREEN_NODE_IDS.goToShopHubButton.root, {
            spriteName: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].states[viewModel.goToShopHubButton.buttonState].spriteName,
        });

        this.uiRuntime.relayout();
    }

    private getBinder(): UINodeBinder {
        if (!this.uiNodeBinder) {
            this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
        }

        return this.uiNodeBinder;
    }

}

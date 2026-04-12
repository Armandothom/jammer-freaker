import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { DeathPresenter } from "../../ui/presenters/death.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import { DEATH_SCREEN_NODE_IDS } from "../../ui/screens/node-ids/death-screen-node-ids.js";
import { UI_BUTTON_CONFIG, UIButtonState, UIButtonVariant } from "../../ui/style/ui-button-config.js";
import { ISystem } from "./system.interface.js";

export class DeathRuntimeSystem implements ISystem {
    private uiNodeBinder: UINodeBinder | null = null;
    private readonly screenId = "death_screen";

    constructor(
        private uiRuntime: UIRuntime,
        private deathPresenter: DeathPresenter,
    ) {

    }
    update(_deltaTime: number): void {
        const binder = this.getBinder();
        const viewModel = this.deathPresenter.buildViewModel();

        if (!viewModel.overlayVisible) {
            this.uiRuntime.popOverlay(this.screenId);
            return;
        } // removes the overlay if the level didn't end by playerDeath

        this.uiRuntime.pushOverlay(this.screenId);

        binder.setVisibility(DEATH_SCREEN_NODE_IDS.root, true);
        binder.patchText(DEATH_SCREEN_NODE_IDS.deathPrompt.text, {
            text: viewModel.promptText,
        });

        binder.setVisibility(DEATH_SCREEN_NODE_IDS.retryButton.root, viewModel.retryButton.visible);
        binder.patchText(DEATH_SCREEN_NODE_IDS.retryButton.root, {
            text: viewModel.retryButton.text,
        });

        binder.patchInteraction(DEATH_SCREEN_NODE_IDS.retryButton.root, {
            disabled: viewModel.retryButton.buttonState === UIButtonState.DISABLED,
        });

        binder.patchSprite(DEATH_SCREEN_NODE_IDS.retryButton.root, {
            spriteName: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].states[viewModel.retryButton.buttonState].spriteName,
        });

        binder.setVisibility(DEATH_SCREEN_NODE_IDS.quitButton.root, viewModel.quitButton.visible);
        binder.patchText(DEATH_SCREEN_NODE_IDS.quitButton.root, {
            text: viewModel.quitButton.text,
        });

        binder.patchInteraction(DEATH_SCREEN_NODE_IDS.quitButton.root, {
            disabled: viewModel.quitButton.buttonState === UIButtonState.DISABLED,
        });

        binder.patchSprite(DEATH_SCREEN_NODE_IDS.quitButton.root, {
            spriteName: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].states[viewModel.quitButton.buttonState].spriteName,
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

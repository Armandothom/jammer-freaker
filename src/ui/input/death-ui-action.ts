import { UIAction } from "./ui-action.js";

export const DEATH_UI_ACTION = {
    RETRY: "death.retry",
    QUIT: "death.quit"
}

export function createRetryLevelAction(): UIAction {
    return {
        type: DEATH_UI_ACTION.RETRY,
    };
}

export function createQuitGameAction(): UIAction {
    return {
        type: DEATH_UI_ACTION.QUIT,
    };
}


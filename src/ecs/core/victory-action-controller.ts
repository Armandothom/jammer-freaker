import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { VICTORY_UI_ACTION } from "../../ui/input/victory-ui-action.js";
import { LevelManager } from "./level-manager.js";

export class VictoryActionController implements UIActionHandler {
    constructor(
        private levelManager: LevelManager,
    ) {
    }

    public handle(action: UIAction): boolean {
        switch (action.type) {
            case VICTORY_UI_ACTION.NEXT_MISSION:
                this.levelManager.startNextLevelWithCurrentInventory();
                return true;

            case VICTORY_UI_ACTION.GOTO_SHOP:
                return this.levelManager.requestShopState();

            default:
                return false;
        }
    }
}

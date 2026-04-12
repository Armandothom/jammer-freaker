import { DEATH_UI_ACTION } from "../../ui/input/death-ui-action.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { LevelManager } from "./level-manager.js";

export class DeathActionController implements UIActionHandler {
  constructor(
    private levelManager: LevelManager,
  ) {
  }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case DEATH_UI_ACTION.RETRY:
        this.levelManager.retryCurrentLevel();
        return true;

      default:
        return false;
    }
  }
}

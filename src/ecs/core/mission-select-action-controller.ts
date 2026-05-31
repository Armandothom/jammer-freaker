import { MISSION_SELECT_UI_ACTION } from "../../ui/input/mission-select-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";

export class MissionSelectActionController implements UIActionHandler {
    constructor(
        private requestGameplayState: (mapId: string) => void,
        private requestShopHubState: () => void,
    ) {
    }

    public handle(action: UIAction): boolean {
        switch (action.type) {
            case MISSION_SELECT_UI_ACTION.SELECT_MAP: {
                const mapId = action.payload?.mapId;
                if (!mapId) {
                    return false;
                }

                this.requestGameplayState(mapId);
                return true;
            }

            case MISSION_SELECT_UI_ACTION.RETURN_TO_HUB:
                this.requestShopHubState();
                return true;

            default:
                return false;
        }
    }
}

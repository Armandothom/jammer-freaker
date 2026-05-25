import type { UIAction } from "./ui-action.js";

export const MISSION_SELECT_UI_ACTION = {
    RETURN_TO_HUB: "mission-select.return-to-hub",
    SELECT_MAP: "mission-select.select-map",
} as const;

export function createSelectMissionMapAction(mapId: string): UIAction {
    return {
        type: MISSION_SELECT_UI_ACTION.SELECT_MAP,
        payload: { mapId },
    };
}

export function createReturnFromMissionSelectToHubAction(): UIAction {
    return {
        type: MISSION_SELECT_UI_ACTION.RETURN_TO_HUB,
    };
}

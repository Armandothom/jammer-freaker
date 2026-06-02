import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { WorldMapSummary } from "../../game/world-map/maps/world-map-registry.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import {
    createReturnFromMissionSelectToHubAction,
    createSelectMissionMapAction,
} from "../input/mission-select-ui-actions.js";
import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { MISSION_SELECT_NODE_IDS } from "./node-ids/mission-select-node-ids.js";

const MISSION_SELECT_BUTTON_WIDTH = 184;
const MISSION_SELECT_BUTTON_HEIGHT = 36;
const MISSION_SELECT_BUTTON_GAP = 8;

export class MissionSelectScreen implements UIScreen {
    public readonly id = "mission-select";

    constructor(private mapSummaries: WorldMapSummary[]) {
    }

    public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
        return createUINode({
            children: [
                createUINode({
                    id: MISSION_SELECT_NODE_IDS.background,
                    layout: {
                        height: "fill",
                        width: "fill",
                    },
                    visual: {
                        sprite: {
                            spriteName: SpriteName.BLANK,
                            spriteSheetName: SpriteSheetName.BLANK,
                        },
                    },
                }),
                createUINode({
                    children: [
                        ...this.mapSummaries.map((mapSummary) => createButtonWidget({
                            anchor: "top-left",
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PROMINENT,
                            height: MISSION_SELECT_BUTTON_HEIGHT,
                            nodeId: MISSION_SELECT_NODE_IDS.buttons.map(mapSummary.id),
                            offsetX: 0,
                            offsetY: 0,
                            onClickAction: createSelectMissionMapAction(mapSummary.id),
                            text: mapSummary.name,
                            width: MISSION_SELECT_BUTTON_WIDTH,
                        })),
                        createButtonWidget({
                            anchor: "top-left",
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PROMINENT,
                            height: MISSION_SELECT_BUTTON_HEIGHT,
                            nodeId: MISSION_SELECT_NODE_IDS.buttons.returnToHub,
                            offsetX: 0,
                            offsetY: 0,
                            onClickAction: createReturnFromMissionSelectToHubAction(),
                            text: "Return to Hub",
                            width: MISSION_SELECT_BUTTON_WIDTH,
                        }),
                    ],
                    id: MISSION_SELECT_NODE_IDS.menu,
                    layout: {
                        anchor: "center",
                        childrenLayout: {
                            align: "center",
                            gap: MISSION_SELECT_BUTTON_GAP,
                            kind: "stack-y",
                        },
                        height: "content",
                        width: MISSION_SELECT_BUTTON_WIDTH,
                    },
                }),
            ],
            id: MISSION_SELECT_NODE_IDS.root,
            layout: {
                childrenLayout: {
                    kind: "overlay",
                },
                height: "fill",
                width: "fill",
            },
        });
    }
}

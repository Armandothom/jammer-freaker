import { createGoToShopHubAction, createNextMissionAction } from "../input/victory-ui-action.js";
import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import {
    UIButtonState,
    UIButtonVariant,
} from "../style/ui-button-config.js";
import { VICTORY_SCREEN_SKIN_MAP } from "../style/victory-screen-skin-map.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { VICTORY_SCREEN_NODE_IDS } from "./node-ids/victory-screen-node-ids.js";

export class VictoryScreenOverlay implements UIScreen {
    public readonly id = "victory_screen";

    public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
        return createUINode({
            id: VICTORY_SCREEN_NODE_IDS.root,
            layout: {
                childrenLayout: {
                    kind: "overlay",
                },
                height: "fill",
                width: "fill",
            },
            children: [
                createUINode({
                    id: VICTORY_SCREEN_NODE_IDS.background,
                    layout: {
                        anchor: VICTORY_SCREEN_SKIN_MAP.background.anchor,
                        height: VICTORY_SCREEN_SKIN_MAP.background.height,
                        offsetX: VICTORY_SCREEN_SKIN_MAP.background.offsetX,
                        offsetY: VICTORY_SCREEN_SKIN_MAP.background.offsetY,
                        width: VICTORY_SCREEN_SKIN_MAP.background.width,
                    },
                    visual: {
                        sprite: {
                            spriteName: VICTORY_SCREEN_SKIN_MAP.background.spriteName,
                            spriteSheetName: VICTORY_SCREEN_SKIN_MAP.background.spriteSheetName,
                        },
                    },
                }),
                createUINode({
                    id: VICTORY_SCREEN_NODE_IDS.victoryPrompt.root,
                    layout: {
                        anchor: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.anchor,
                        childrenLayout: {
                            kind: "overlay",
                        },
                        height: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.height,
                        offsetX: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.offsetX,
                        offsetY: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.offsetY,
                        width: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.width,
                    },
                    children: [
                        createUINode({
                            id: VICTORY_SCREEN_NODE_IDS.victoryPrompt.background,
                            layout: {
                                height: "fill",
                                width: "fill",
                            },
                            visual: {
                                sprite: {
                                    spriteName: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.spriteName,
                                    spriteSheetName: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.spriteSheetName,
                                },
                            },
                        }),
                        createUINode({
                            id: VICTORY_SCREEN_NODE_IDS.missionStats.root,
                            layout: {
                                anchor: VICTORY_SCREEN_SKIN_MAP.missionStats.anchor,
                                offsetX: VICTORY_SCREEN_SKIN_MAP.missionStats.offsetX,
                                offsetY: VICTORY_SCREEN_SKIN_MAP.missionStats.offsetY,
                                width: VICTORY_SCREEN_SKIN_MAP.missionStats.width,
                            },
                            visual: {
                                text: {
                                    autoWrap: VICTORY_SCREEN_SKIN_MAP.missionStats.autoWrap,
                                    horizontalAlign: VICTORY_SCREEN_SKIN_MAP.missionStats.horizontalAlign,
                                    text: VICTORY_SCREEN_SKIN_MAP.missionStats.text,
                                },
                            },
                        }),
                        createUINode({
                            id: VICTORY_SCREEN_NODE_IDS.victoryPrompt.text,
                            layout: {
                                height: "content",
                                offsetY: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.textOffsetY,
                                width: "fill",
                            },
                            visual: {
                                text: {
                                    autoWrap: false,
                                    horizontalAlign: "center",
                                    text: VICTORY_SCREEN_SKIN_MAP.victoryPrompt.text,
                                },
                            },
                        }),
                        createButtonWidget({
                            anchor: VICTORY_SCREEN_SKIN_MAP.nextMissionButton.anchor,
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PRIMARY,
                            nodeId: VICTORY_SCREEN_NODE_IDS.nextMissionButton.root,
                            offsetX: VICTORY_SCREEN_SKIN_MAP.nextMissionButton.offsetX,
                            offsetY: VICTORY_SCREEN_SKIN_MAP.nextMissionButton.offsetY,
                            text: VICTORY_SCREEN_SKIN_MAP.nextMissionButton.text,
                            width: VICTORY_SCREEN_SKIN_MAP.nextMissionButton.width,
                            onClickAction: createNextMissionAction(),
                        }),
                        createButtonWidget({
                            anchor: VICTORY_SCREEN_SKIN_MAP.goToShopHubButton.anchor,
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PRIMARY,
                            nodeId: VICTORY_SCREEN_NODE_IDS.goToShopHubButton.root,
                            offsetX: VICTORY_SCREEN_SKIN_MAP.goToShopHubButton.offsetX,
                            offsetY: VICTORY_SCREEN_SKIN_MAP.goToShopHubButton.offsetY,
                            text: VICTORY_SCREEN_SKIN_MAP.goToShopHubButton.text,
                            onClickAction: createGoToShopHubAction(),
                        }),
                    ],
                }),
            ],
        });
    }
}

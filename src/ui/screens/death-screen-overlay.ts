import { createQuitGameAction, createRetryLevelAction } from "../input/death-ui-action.js";
import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { DEATH_SCREEN_SKIN_MAP } from "../style/death-screen-skin-map.js";
import {
    UIButtonState,
    UIButtonVariant,
} from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { DEATH_SCREEN_NODE_IDS } from "./death-screen-node-ids.js";

export class DeathScreenOverlay implements UIScreen {
    public readonly id = "death_screen";

    public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
        return createUINode({
            id: DEATH_SCREEN_NODE_IDS.root,
            layout: {
                childrenLayout: {
                    kind: "overlay",
                },
                height: "fill",
                width: "fill",
            },
            children: [
                createUINode({
                    id: DEATH_SCREEN_NODE_IDS.background,
                    layout: {
                        anchor: DEATH_SCREEN_SKIN_MAP.background.anchor,
                        height: DEATH_SCREEN_SKIN_MAP.background.height,
                        offsetX: DEATH_SCREEN_SKIN_MAP.background.offsetX,
                        offsetY: DEATH_SCREEN_SKIN_MAP.background.offsetY,
                        width: DEATH_SCREEN_SKIN_MAP.background.width,
                    },
                    visual: {
                        sprite: {
                            spriteName: DEATH_SCREEN_SKIN_MAP.background.spriteName,
                            spriteSheetName: DEATH_SCREEN_SKIN_MAP.background.spriteSheetName,
                        },
                    },
                }),
                createUINode({
                    id: DEATH_SCREEN_NODE_IDS.deathPrompt.root,
                    layout: {
                        anchor: DEATH_SCREEN_SKIN_MAP.deathPrompt.anchor,
                        childrenLayout: {
                            kind: "overlay",
                        },
                        height: DEATH_SCREEN_SKIN_MAP.deathPrompt.height,
                        offsetX: DEATH_SCREEN_SKIN_MAP.deathPrompt.offsetX,
                        offsetY: DEATH_SCREEN_SKIN_MAP.deathPrompt.offsetY,
                        width: DEATH_SCREEN_SKIN_MAP.deathPrompt.width,
                    },
                    children: [
                        createUINode({
                            id: DEATH_SCREEN_NODE_IDS.deathPrompt.background,
                            layout: {
                                height: "fill",
                                width: "fill",
                            },
                            visual: {
                                sprite: {
                                    spriteName: DEATH_SCREEN_SKIN_MAP.deathPrompt.spriteName,
                                    spriteSheetName: DEATH_SCREEN_SKIN_MAP.deathPrompt.spriteSheetName,
                                },
                            },
                        }),
                        createUINode({
                            id: DEATH_SCREEN_NODE_IDS.deathPrompt.text,
                            layout: {
                                height: "content",
                                offsetY: DEATH_SCREEN_SKIN_MAP.deathPrompt.textOffsetY,
                                width: "fill",
                            },
                            visual: {
                                text: {
                                    autoWrap: false,
                                    horizontalAlign: "center",
                                    text: DEATH_SCREEN_SKIN_MAP.deathPrompt.text,
                                },
                            },
                        }),
                        createButtonWidget({
                            anchor: DEATH_SCREEN_SKIN_MAP.retryButton.anchor,
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PRIMARY,
                            nodeId: DEATH_SCREEN_NODE_IDS.retryButton.root,
                            offsetX: DEATH_SCREEN_SKIN_MAP.retryButton.offsetX,
                            offsetY: DEATH_SCREEN_SKIN_MAP.retryButton.offsetY,
                            text: DEATH_SCREEN_SKIN_MAP.retryButton.text,
                            onClickAction: createRetryLevelAction(),
                        }),
                        createButtonWidget({
                            anchor: DEATH_SCREEN_SKIN_MAP.quitButton.anchor,
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PRIMARY,
                            nodeId: DEATH_SCREEN_NODE_IDS.quitButton.root,
                            offsetX: DEATH_SCREEN_SKIN_MAP.quitButton.offsetX,
                            offsetY: DEATH_SCREEN_SKIN_MAP.quitButton.offsetY,
                            text: DEATH_SCREEN_SKIN_MAP.quitButton.text,
                            onClickAction: createQuitGameAction(), // THIS SHOULD CHANGE TO CHANGE MISSION
                        }),
                    ],
                }),
            ],
        });
    }
}

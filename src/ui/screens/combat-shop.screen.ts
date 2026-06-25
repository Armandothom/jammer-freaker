import {
    COMBAT_SHOP_TAB_CONFIG,
    COMBAT_SHOP_TABS_ORDER,
} from "../../ecs/components/types/combat-shop-tab-config.js";
import {
    getCombatShopUpgradeItemPrice,
    COMBAT_SHOP_UPGRADE_CONFIG,
    COMBAT_SHOP_UPGRADE_ITEMS_ORDER,
} from "../../ecs/components/types/combat-shop-upgrade-config.js";
import { QUEST_TRADER } from "../../ecs/components/types/quest-config.js";
import {
    createBuyCombatShopUpgradeAction,
    createReturnFromCombatShopToHubAction,
    createSelectCombatShopTabAction,
} from "../input/combat-shop-ui-actions.js";
import { createOpenQuestScreenAction } from "../input/quest-ui-actions.js";
import {
    resolveLegacyRightAnchoredStripOffsetX,
    resolveShopInfoAuxActionRowLayout,
} from "../layout/shop-auto-layout.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { COMBAT_SHOP_SKIN_MAP } from "../style/combat-shop-skin-map.js";
import { UI_BUTTON_CONFIG, UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { createLegacyPointLayout } from "../widgets/legacy-layout.js";
import { COMBAT_SHOP_NODE_IDS } from "./node-ids/combat-shop-node-ids.js";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US");

export class CombatShopScreen implements UIScreen {
    public readonly id = "combat-shop";

    public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
        return createUINode({
            children: [
                createUINode({
                    id: COMBAT_SHOP_NODE_IDS.background,
                    layout: {
                        anchor: COMBAT_SHOP_SKIN_MAP.background.anchor,
                        offsetX: COMBAT_SHOP_SKIN_MAP.background.offsetX,
                        offsetY: COMBAT_SHOP_SKIN_MAP.background.offsetY,
                    },
                    visual: {
                        sprite: {
                            height: COMBAT_SHOP_SKIN_MAP.background.height,
                            spriteName: COMBAT_SHOP_SKIN_MAP.background.spriteName,
                            spriteSheetName: COMBAT_SHOP_SKIN_MAP.background.spriteSheetName,
                            width: COMBAT_SHOP_SKIN_MAP.background.width,
                        },
                    },
                }),
                createUINode({
                    id: COMBAT_SHOP_NODE_IDS.money,
                    layout: createLegacyPointLayout(
                        COMBAT_SHOP_SKIN_MAP.money.anchor,
                        COMBAT_SHOP_SKIN_MAP.money.offsetX,
                        COMBAT_SHOP_SKIN_MAP.money.offsetY,
                    ),
                    visual: {
                        text: {
                            autoWrap: false,
                            horizontalAlign: "left",
                            maxWidth: null,
                            text: "$0",
                        },
                    },
                }),
                ...COMBAT_SHOP_TABS_ORDER.map((tabType, index) => createButtonWidget({
                    anchor: COMBAT_SHOP_SKIN_MAP.tabs.anchor,
                    buttonState: UIButtonState.SELECTED,
                    buttonVariant: UIButtonVariant.TAB,
                    legacyAnchor: true,
                    nodeId: COMBAT_SHOP_NODE_IDS.tab(tabType),
                    offsetX: resolveLegacyRightAnchoredStripOffsetX(
                        COMBAT_SHOP_SKIN_MAP.tabs.offsetX,
                        index,
                        UI_BUTTON_CONFIG[UIButtonVariant.TAB].width,
                        COMBAT_SHOP_SKIN_MAP.tabs.gap,
                    ),
                    offsetY: COMBAT_SHOP_SKIN_MAP.tabs.offsetY,
                    onClickAction: createSelectCombatShopTabAction(tabType),
                    text: COMBAT_SHOP_TAB_CONFIG[tabType].label,
                })),
                createButtonWidget({
                    anchor: COMBAT_SHOP_SKIN_MAP.returnButton.anchor,
                    buttonState: UIButtonState.NORMAL,
                    buttonVariant: UIButtonVariant.PROMINENT,
                    legacyAnchor: true,
                    nodeId: COMBAT_SHOP_NODE_IDS.returnButton,
                    offsetX: COMBAT_SHOP_SKIN_MAP.returnButton.offsetX,
                    offsetY: COMBAT_SHOP_SKIN_MAP.returnButton.offsetY,
                    onClickAction: createReturnFromCombatShopToHubAction(),
                    text: "Return to Hub",
                }),
                createButtonWidget({
                    anchor: "bottom-left",
                    buttonState: UIButtonState.NORMAL,
                    buttonVariant: UIButtonVariant.PROMINENT,
                    nodeId: COMBAT_SHOP_NODE_IDS.questButton,
                    offsetX: 64,
                    offsetY: 48,
                    onClickAction: createOpenQuestScreenAction(QUEST_TRADER.PORCUPINE),
                    text: "Quests",
                }),
                createUINode({
                    children: COMBAT_SHOP_UPGRADE_ITEMS_ORDER.map((upgradeType, index) => {
                        const nodeIds = COMBAT_SHOP_NODE_IDS.upgradeItem(upgradeType);
                        const config = COMBAT_SHOP_UPGRADE_CONFIG[upgradeType];

                        return createCombatShopUpgradeItemRow({
                            buttonNodeId: nodeIds.button,
                            buttonText: `$${MONEY_FORMATTER.format(getCombatShopUpgradeItemPrice(upgradeType, 1))}`,
                            descriptionNodeId: nodeIds.description,
                            descriptionText: config.description,
                            levelNodeId: nodeIds.level,
                            levelText: "Lvl. 0",
                            nodeId: nodeIds.root,
                            onButtonClickAction: createBuyCombatShopUpgradeAction(upgradeType),
                            rowIndex: index,
                            titleNodeId: nodeIds.title,
                            titleText: config.name,
                        });
                    }),
                    id: COMBAT_SHOP_NODE_IDS.sections.upgrades,
                    layout: {
                        childrenLayout: {
                            kind: "absolute",
                        },
                        height: "fill",
                        width: "fill",
                    },
                }),
            ],
            id: COMBAT_SHOP_NODE_IDS.root,
            layout: {
                childrenLayout: {
                    kind: "absolute",
                },
                height: "fill",
                width: "fill",
            },
        });
    }
}

type CombatShopUpgradeItemRowProps = {
    buttonNodeId: string;
    buttonText: string;
    descriptionNodeId: string;
    descriptionText: string;
    levelNodeId: string;
    levelText: string;
    nodeId: string;
    onButtonClickAction: ReturnType<typeof createBuyCombatShopUpgradeAction>;
    rowIndex: number;
    titleNodeId: string;
    titleText: string;
};

function createCombatShopUpgradeItemRow(props: CombatShopUpgradeItemRowProps): UINode {
    const rowLayout = resolveShopInfoAuxActionRowLayout({
        actionWidth: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].width,
        auxToActionGap: COMBAT_SHOP_SKIN_MAP.upgradeRows.levelToButtonGap,
        auxWidth: COMBAT_SHOP_SKIN_MAP.upgradeRows.levelColumnWidth,
        infoToAuxGap: COMBAT_SHOP_SKIN_MAP.upgradeRows.infoToLevelGap,
        leadingToInfoGap: 0,
        leadingWidth: COMBAT_SHOP_SKIN_MAP.upgradeRows.leadingPadding,
        rowWidth: COMBAT_SHOP_SKIN_MAP.upgradeRows.rowWidth,
    });

    return createUINode({
        children: [
            createUINode({
                id: props.titleNodeId,
                layout: {
                    offsetX: rowLayout.infoX,
                    offsetY: 0,
                    width: rowLayout.infoWidth,
                },
                visual: {
                    text: {
                        autoWrap: false,
                        horizontalAlign: "left",
                        maxWidth: rowLayout.infoWidth,
                        text: props.titleText,
                    },
                },
            }),
            createUINode({
                id: props.levelNodeId,
                layout: {
                    offsetX: rowLayout.auxX,
                    offsetY: 0,
                    width: COMBAT_SHOP_SKIN_MAP.upgradeRows.levelColumnWidth,
                },
                visual: {
                    text: {
                        autoWrap: false,
                        horizontalAlign: "right",
                        maxWidth: COMBAT_SHOP_SKIN_MAP.upgradeRows.levelColumnWidth,
                        text: props.levelText,
                    },
                },
            }),
            createUINode({
                id: props.descriptionNodeId,
                layout: {
                    offsetX: rowLayout.infoX,
                    offsetY: COMBAT_SHOP_SKIN_MAP.upgradeRows.descriptionOffsetY,
                    width: rowLayout.infoWidth,
                },
                visual: {
                    text: {
                        autoWrap: true,
                        horizontalAlign: "left",
                        maxWidth: rowLayout.infoWidth,
                        text: props.descriptionText,
                    },
                },
            }),
            createButtonWidget({
                anchor: "top-left",
                buttonState: UIButtonState.NORMAL,
                buttonVariant: UIButtonVariant.PRIMARY,
                nodeId: props.buttonNodeId,
                offsetX: rowLayout.actionX,
                offsetY: COMBAT_SHOP_SKIN_MAP.upgradeRows.buttonOffsetY,
                onClickAction: props.onButtonClickAction,
                text: props.buttonText,
            }),
        ],
        id: props.nodeId,
        layout: createLegacyPointLayout(
            COMBAT_SHOP_SKIN_MAP.upgradeRows.anchor,
            COMBAT_SHOP_SKIN_MAP.upgradeRows.offsetX,
            COMBAT_SHOP_SKIN_MAP.upgradeRows.offsetY + (COMBAT_SHOP_SKIN_MAP.upgradeRows.stepY * props.rowIndex),
        ),
    });
}

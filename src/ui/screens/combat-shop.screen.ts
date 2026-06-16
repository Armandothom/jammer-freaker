import {
    COMBAT_SHOP_TAB_CONFIG,
    COMBAT_SHOP_TABS_ORDER,
} from "../../ecs/components/types/combat-shop-tab-config.js";
import {
    getCombatShopUpgradeItemPrice,
    COMBAT_SHOP_UPGRADE_CONFIG,
    COMBAT_SHOP_UPGRADE_ITEMS_ORDER,
} from "../../ecs/components/types/combat-shop-upgrade-config.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import {
    createBuyCombatShopUpgradeAction,
    createReturnFromCombatShopToHubAction,
    createSelectCombatShopTabAction,
} from "../input/combat-shop-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { COMBAT_SHOP_SKIN_MAP } from "../style/combat-shop-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
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
                    offsetX: COMBAT_SHOP_SKIN_MAP.tabs.offsetX + (COMBAT_SHOP_SKIN_MAP.tabs.stepX * index),
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
    return createUINode({
        children: [
            createUINode({
                id: props.titleNodeId,
                layout: {
                    offsetX: 0,
                    offsetY: 0,
                },
                visual: {
                    text: {
                        autoWrap: false,
                        horizontalAlign: "left",
                        maxWidth: null,
                        text: props.titleText,
                    },
                },
            }),
            createUINode({
                id: props.levelNodeId,
                layout: {
                    offsetX: 0,
                    offsetY: 18,
                },
                visual: {
                    text: {
                        autoWrap: false,
                        horizontalAlign: "left",
                        maxWidth: null,
                        text: props.levelText,
                    },
                },
            }),
            createUINode({
                id: props.descriptionNodeId,
                layout: {
                    offsetX: COMBAT_SHOP_SKIN_MAP.upgradeRows.infoOffsetX,
                    offsetY: 0,
                },
                visual: {
                    text: {
                        autoWrap: true,
                        horizontalAlign: "left",
                        maxWidth: 104,
                        text: props.descriptionText,
                    },
                },
            }),
            createButtonWidget({
                anchor: "top-left",
                buttonState: UIButtonState.NORMAL,
                buttonVariant: UIButtonVariant.PRIMARY,
                nodeId: props.buttonNodeId,
                offsetX: COMBAT_SHOP_SKIN_MAP.upgradeRows.buttonOffsetX,
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

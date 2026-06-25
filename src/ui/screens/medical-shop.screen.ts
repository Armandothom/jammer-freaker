import {
    MEDICAL_SHOP_RESOURCE_ITEM_CONFIG,
    MEDICAL_SHOP_RESOURCE_ITEMS_ORDER,
} from "../../ecs/components/types/medical-shop-resource-item-config.js";
import {
    MEDICAL_SHOP_TAB_CONFIG,
    MEDICAL_SHOP_TABS_ORDER,
} from "../../ecs/components/types/medical-shop-tab-config.js";
import {
    getMedicalShopUpgradeItemPrice,
    MEDICAL_SHOP_UPGRADE_ITEM_CONFIG,
    MEDICAL_SHOP_UPGRADE_ITEMS_ORDER,
} from "../../ecs/components/types/medical-shop-upgrade-item-config.js";
import { QUEST_TRADER } from "../../ecs/components/types/quest-config.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import {
    createBuyMedicalShopResourceAction,
    createBuyMedicalShopUpgradeAction,
    createReturnFromMedicalShopToHubAction,
    createSelectMedicalShopTabAction,
} from "../input/medical-shop-ui-actions.js";
import { createOpenQuestScreenAction } from "../input/quest-ui-actions.js";
import {
    resolveLegacyRightAnchoredStripOffsetX,
    resolveShopInfoAuxActionRowLayout,
} from "../layout/shop-auto-layout.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { MEDICAL_SHOP_SKIN_MAP } from "../style/medical-shop-skin-map.js";
import { UI_BUTTON_CONFIG, UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { createLegacyPointLayout } from "../widgets/legacy-layout.js";
import { MEDICAL_SHOP_NODE_IDS } from "./node-ids/medical-shop-node-ids.js";

const MONEY_FORMATTER = new Intl.NumberFormat("en-US");

export class MedicalShopScreen implements UIScreen {
    public readonly id = "medical-shop";

    public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
        return createUINode({
            children: [
                createUINode({
                    id: MEDICAL_SHOP_NODE_IDS.background,
                    layout: {
                        anchor: MEDICAL_SHOP_SKIN_MAP.background.anchor,
                        offsetX: MEDICAL_SHOP_SKIN_MAP.background.offsetX,
                        offsetY: MEDICAL_SHOP_SKIN_MAP.background.offsetY,
                    },
                    visual: {
                        sprite: {
                            height: MEDICAL_SHOP_SKIN_MAP.background.height,
                            spriteName: MEDICAL_SHOP_SKIN_MAP.background.spriteName,
                            spriteSheetName: MEDICAL_SHOP_SKIN_MAP.background.spriteSheetName,
                            width: MEDICAL_SHOP_SKIN_MAP.background.width,
                        },
                    },
                }),
                createUINode({
                    id: MEDICAL_SHOP_NODE_IDS.money,
                    layout: createLegacyPointLayout(
                        MEDICAL_SHOP_SKIN_MAP.money.anchor,
                        MEDICAL_SHOP_SKIN_MAP.money.offsetX,
                        MEDICAL_SHOP_SKIN_MAP.money.offsetY,
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
                ...MEDICAL_SHOP_TABS_ORDER.map((tabType, index) => createButtonWidget({
                    anchor: MEDICAL_SHOP_SKIN_MAP.tabs.anchor,
                    buttonState: UIButtonState.NORMAL,
                    buttonVariant: UIButtonVariant.TAB,
                    legacyAnchor: true,
                    nodeId: MEDICAL_SHOP_NODE_IDS.tab(tabType),
                    offsetX: resolveLegacyRightAnchoredStripOffsetX(
                        MEDICAL_SHOP_SKIN_MAP.tabs.offsetX,
                        index,
                        UI_BUTTON_CONFIG[UIButtonVariant.TAB].width,
                        MEDICAL_SHOP_SKIN_MAP.tabs.gap,
                    ),
                    offsetY: MEDICAL_SHOP_SKIN_MAP.tabs.offsetY,
                    onClickAction: createSelectMedicalShopTabAction(tabType),
                    text: MEDICAL_SHOP_TAB_CONFIG[tabType].label,
                })),
                createButtonWidget({
                    anchor: MEDICAL_SHOP_SKIN_MAP.returnButton.anchor,
                    buttonState: UIButtonState.NORMAL,
                    buttonVariant: UIButtonVariant.PROMINENT,
                    legacyAnchor: true,
                    nodeId: MEDICAL_SHOP_NODE_IDS.returnButton,
                    offsetX: MEDICAL_SHOP_SKIN_MAP.returnButton.offsetX,
                    offsetY: MEDICAL_SHOP_SKIN_MAP.returnButton.offsetY,
                    onClickAction: createReturnFromMedicalShopToHubAction(),
                    text: "Return to Hub",
                }),
                createButtonWidget({
                    anchor: "bottom-left",
                    buttonState: UIButtonState.NORMAL,
                    buttonVariant: UIButtonVariant.PROMINENT,
                    nodeId: MEDICAL_SHOP_NODE_IDS.questButton,
                    offsetX: 64,
                    offsetY: 48,
                    onClickAction: createOpenQuestScreenAction(QUEST_TRADER.DIGNITAS),
                    text: "Quests",
                }),
                createUINode({
                    children: MEDICAL_SHOP_RESOURCE_ITEMS_ORDER.map((itemType, index) => {
                        const nodeIds = MEDICAL_SHOP_NODE_IDS.resourceItem(itemType);
                        const config = MEDICAL_SHOP_RESOURCE_ITEM_CONFIG[itemType];

                        return createMedicalShopResourceItemRow({
                            buttonNodeId: nodeIds.button,
                            buttonText: `$${MONEY_FORMATTER.format(config.price)}`,
                            descriptionNodeId: nodeIds.description,
                            descriptionText: config.description,
                            iconNodeId: nodeIds.icon,
                            itemHeight: config.height,
                            itemName: config.name,
                            itemNameNodeId: nodeIds.name,
                            itemSpriteName: config.spriteName,
                            itemWidth: config.width,
                            nodeId: nodeIds.root,
                            onButtonClickAction: createBuyMedicalShopResourceAction(itemType),
                            quantityNodeId: nodeIds.quantity,
                            quantityText: `x${config.availableQuantity}`,
                            rowIndex: index,
                        });
                    }),
                    id: MEDICAL_SHOP_NODE_IDS.sections.resources,
                    layout: {
                        childrenLayout: {
                            kind: "absolute",
                        },
                        height: "fill",
                        width: "fill",
                    },
                    visible: false,
                }),
                createUINode({
                    children: MEDICAL_SHOP_UPGRADE_ITEMS_ORDER.map((upgradeType, index) => {
                        const nodeIds = MEDICAL_SHOP_NODE_IDS.upgradeItem(upgradeType);
                        const config = MEDICAL_SHOP_UPGRADE_ITEM_CONFIG[upgradeType];

                        return createMedicalShopUpgradeItemRow({
                            buttonNodeId: nodeIds.button,
                            buttonText: `$${MONEY_FORMATTER.format(getMedicalShopUpgradeItemPrice(upgradeType, 1))}`,
                            descriptionNodeId: nodeIds.description,
                            descriptionText: config.description,
                            levelNodeId: nodeIds.level,
                            levelText: "Lvl. 0",
                            nodeId: nodeIds.root,
                            onButtonClickAction: createBuyMedicalShopUpgradeAction(upgradeType),
                            rowIndex: index,
                            titleNodeId: nodeIds.title,
                            titleText: config.name,
                        });
                    }),
                    id: MEDICAL_SHOP_NODE_IDS.sections.upgrades,
                    layout: {
                        childrenLayout: {
                            kind: "absolute",
                        },
                        height: "fill",
                        width: "fill",
                    },
                    visible: false,
                }),
            ],
            id: MEDICAL_SHOP_NODE_IDS.root,
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

type MedicalShopResourceItemRowProps = {
    buttonNodeId: string;
    buttonText: string;
    descriptionNodeId: string;
    descriptionText: string;
    iconNodeId: string;
    itemHeight: number;
    itemName: string;
    itemNameNodeId: string;
    itemSpriteName: SpriteName;
    itemWidth: number;
    nodeId: string;
    onButtonClickAction: ReturnType<typeof createBuyMedicalShopResourceAction>;
    quantityNodeId: string;
    quantityText: string;
    rowIndex: number;
};

type MedicalShopResourceRowLayout = {
    actionX: number;
    infoWidth: number;
    infoX: number;
    auxX: number;
};

function createMedicalShopResourceItemRow(props: MedicalShopResourceItemRowProps): UINode {
    const rowLayout = resolveMedicalShopResourceRowLayout(props.itemWidth);

    return createUINode({
        children: [
            createUINode({
                id: props.iconNodeId,
                layout: {
                    offsetX: 0,
                    offsetY: 0,
                },
                visual: {
                    sprite: {
                        height: props.itemHeight,
                        spriteName: props.itemSpriteName,
                        spriteSheetName: resolveMedicalResourceSpriteSheet(props.itemSpriteName),
                        width: props.itemWidth,
                    },
                },
            }),
            createUINode({
                id: props.itemNameNodeId,
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
                        text: props.itemName,
                    },
                },
            }),
            createUINode({
                id: props.quantityNodeId,
                layout: {
                    offsetX: rowLayout.auxX,
                    offsetY: 0,
                    width: MEDICAL_SHOP_SKIN_MAP.itemRows.quantityColumnWidth,
                },
                visual: {
                    text: {
                        autoWrap: false,
                        horizontalAlign: "right",
                        maxWidth: MEDICAL_SHOP_SKIN_MAP.itemRows.quantityColumnWidth,
                        text: props.quantityText,
                    },
                },
            }),
            createUINode({
                id: props.descriptionNodeId,
                layout: {
                    offsetX: rowLayout.infoX,
                    offsetY: MEDICAL_SHOP_SKIN_MAP.itemRows.descriptionOffsetY,
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
                offsetY: MEDICAL_SHOP_SKIN_MAP.itemRows.buttonOffsetY,
                onClickAction: props.onButtonClickAction,
                text: props.buttonText,
            }),
        ],
        id: props.nodeId,
        layout: createLegacyPointLayout(
            MEDICAL_SHOP_SKIN_MAP.itemRows.anchor,
            MEDICAL_SHOP_SKIN_MAP.itemRows.offsetX,
            MEDICAL_SHOP_SKIN_MAP.itemRows.offsetY + (MEDICAL_SHOP_SKIN_MAP.itemRows.stepY * props.rowIndex),
        ),
    });
}

function resolveMedicalShopResourceRowLayout(itemWidth: number): MedicalShopResourceRowLayout {
    const rowSkin = MEDICAL_SHOP_SKIN_MAP.itemRows;
    return resolveShopInfoAuxActionRowLayout({
        actionWidth: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].width,
        auxToActionGap: rowSkin.quantityToButtonGap,
        auxWidth: rowSkin.quantityColumnWidth,
        infoToAuxGap: rowSkin.infoToQuantityGap,
        leadingToInfoGap: rowSkin.iconToInfoGap,
        leadingWidth: itemWidth,
        rowWidth: rowSkin.rowWidth,
    });
}

type MedicalShopUpgradeItemRowProps = {
    buttonNodeId: string;
    buttonText: string;
    descriptionNodeId: string;
    descriptionText: string;
    levelNodeId: string;
    levelText: string;
    nodeId: string;
    onButtonClickAction: ReturnType<typeof createBuyMedicalShopUpgradeAction>;
    rowIndex: number;
    titleNodeId: string;
    titleText: string;
};

function createMedicalShopUpgradeItemRow(props: MedicalShopUpgradeItemRowProps): UINode {
    const rowLayout = resolveShopInfoAuxActionRowLayout({
        actionWidth: UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].width,
        auxToActionGap: MEDICAL_SHOP_SKIN_MAP.upgradeRows.levelToButtonGap,
        auxWidth: MEDICAL_SHOP_SKIN_MAP.upgradeRows.levelColumnWidth,
        infoToAuxGap: MEDICAL_SHOP_SKIN_MAP.upgradeRows.infoToLevelGap,
        leadingToInfoGap: 0,
        leadingWidth: MEDICAL_SHOP_SKIN_MAP.upgradeRows.leadingPadding,
        rowWidth: MEDICAL_SHOP_SKIN_MAP.upgradeRows.rowWidth,
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
                    width: MEDICAL_SHOP_SKIN_MAP.upgradeRows.levelColumnWidth,
                },
                visual: {
                    text: {
                        autoWrap: false,
                        horizontalAlign: "right",
                        maxWidth: MEDICAL_SHOP_SKIN_MAP.upgradeRows.levelColumnWidth,
                        text: props.levelText,
                    },
                },
            }),
            createUINode({
                id: props.descriptionNodeId,
                layout: {
                    offsetX: rowLayout.infoX,
                    offsetY: MEDICAL_SHOP_SKIN_MAP.upgradeRows.descriptionOffsetY,
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
                offsetY: MEDICAL_SHOP_SKIN_MAP.upgradeRows.buttonOffsetY,
                onClickAction: props.onButtonClickAction,
                text: props.buttonText,
            }),
        ],
        id: props.nodeId,
        layout: createLegacyPointLayout(
            MEDICAL_SHOP_SKIN_MAP.upgradeRows.anchor,
            MEDICAL_SHOP_SKIN_MAP.upgradeRows.offsetX,
            MEDICAL_SHOP_SKIN_MAP.upgradeRows.offsetY + (MEDICAL_SHOP_SKIN_MAP.upgradeRows.stepY * props.rowIndex),
        ),
    });
}

function resolveMedicalResourceSpriteSheet(spriteName: SpriteName): SpriteSheetName {
    if (spriteName === SpriteName.BLANK) {
        return SpriteSheetName.BLANK;
    }

    return SpriteSheetName.RESOURCES_ICON;
}

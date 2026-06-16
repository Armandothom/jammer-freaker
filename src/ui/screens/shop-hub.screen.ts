import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import {
    createGoToCombatShopFromShopHubAction,
    createGoToGunsShopFromShopHubAction,
    createGoToMedicalShopFromShopHubAction,
    createGoToMissionSelectFromShopHubAction,
} from "../input/shop-hub-ui-actions.js";
import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import { SHOP_HUB_NODE_IDS } from "./node-ids/shop-hub-node-ids.js";

const SHOP_HUB_BUTTON_WIDTH = 160;
const SHOP_HUB_BUTTON_HEIGHT = 36;
const SHOP_HUB_BUTTON_GAP = 8;

export class ShopHubScreen implements UIScreen {
    public readonly id = "shop-hub";

    public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
        return createUINode({
            children: [
                createUINode({
                    id: SHOP_HUB_NODE_IDS.background,
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
                        createButtonWidget({
                            anchor: "top-left",
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PROMINENT,
                            height: SHOP_HUB_BUTTON_HEIGHT,
                            nodeId: SHOP_HUB_NODE_IDS.buttons.goToMission,
                            offsetX: 0,
                            offsetY: 0,
                            onClickAction: createGoToMissionSelectFromShopHubAction(),
                            text: "Go-To-Mission",
                            width: SHOP_HUB_BUTTON_WIDTH,
                        }),
                        createButtonWidget({
                            anchor: "top-left",
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PROMINENT,
                            height: SHOP_HUB_BUTTON_HEIGHT,
                            nodeId: SHOP_HUB_NODE_IDS.buttons.goToGunsShop,
                            offsetX: 0,
                            offsetY: 0,
                            onClickAction: createGoToGunsShopFromShopHubAction(),
                            text: "Guns Shop",
                            width: SHOP_HUB_BUTTON_WIDTH,
                        }),
                        createButtonWidget({
                            anchor: "top-left",
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PROMINENT,
                            height: SHOP_HUB_BUTTON_HEIGHT,
                            nodeId: SHOP_HUB_NODE_IDS.buttons.goToMedicalShop,
                            offsetX: 0,
                            offsetY: 0,
                            onClickAction: createGoToMedicalShopFromShopHubAction(),
                            text: "Medical Shop",
                            width: SHOP_HUB_BUTTON_WIDTH,
                        }),
                        createButtonWidget({
                            anchor: "top-left",
                            buttonState: UIButtonState.NORMAL,
                            buttonVariant: UIButtonVariant.PROMINENT,
                            height: SHOP_HUB_BUTTON_HEIGHT,
                            nodeId: SHOP_HUB_NODE_IDS.buttons.goToCombatShop,
                            offsetX: 0,
                            offsetY: 0,
                            onClickAction: createGoToCombatShopFromShopHubAction(),
                            text: "Combat Shop",
                            width: SHOP_HUB_BUTTON_WIDTH,
                        }),
                    ],
                    id: SHOP_HUB_NODE_IDS.menu,
                    layout: {
                        anchor: "center",
                        childrenLayout: {
                            align: "center",
                            gap: SHOP_HUB_BUTTON_GAP,
                            kind: "stack-y",
                        },
                        height: "content",
                        width: SHOP_HUB_BUTTON_WIDTH,
                    },
                }),
            ],
            id: SHOP_HUB_NODE_IDS.root,
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

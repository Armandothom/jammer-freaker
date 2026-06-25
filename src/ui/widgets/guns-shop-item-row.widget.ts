import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIAction } from "../input/ui-action.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import { UIButtonVariant, type UIButtonState } from "../style/ui-button-config.js";
import { createLegacyPointLayout } from "./legacy-layout.js";
import { createButtonWidget } from "./button.widget.js";
import { getBitmapTextBounds } from "../../utils/get-bitmap-text-size.js";
import { getCenteredBitmapTextPosition } from "../../utils/get-centered-bitmap-text-position.js";
import { resolveShopInfoActionRowLayout, resolveShopInfoAuxActionRowLayout } from "../layout/shop-auto-layout.js";
import { UI_BUTTON_CONFIG } from "../style/ui-button-config.js";

type GunsShopItemRowWidgetProps = {
  anchor: UIAnchor;
  buttonNodeId: string;
  buttonOffsetY: number;
  buttonState: UIButtonState;
  buttonText: string;
  iconNodeId: string;
  iconToInfoGap: number;
  infoToButtonGap: number;
  infoToQuantityGap?: number;
  itemHeight: number;
  itemName: string;
  itemNameNodeId: string;
  itemSpriteName: SpriteName;
  itemSpriteSheetName: SpriteSheetName;
  itemWidth: number;
  legacyOffsetX: number;
  legacyOffsetY: number;
  nodeId: string;
  onButtonClickAction: UIAction;
  quantityColumnWidth?: number;
  quantityNodeId?: string;
  quantityText?: string;
  quantityToButtonGap?: number;
  rowWidth: number;
};

export function createGunsShopItemRowWidget(props: GunsShopItemRowWidgetProps): UINode {
  const itemNameBounds = getBitmapTextBounds(props.itemName, "04b_03", 2);
  const buttonWidth = UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].width;
  const textBaselineY = props.buttonOffsetY + getCenteredBitmapTextPosition(
    props.buttonText,
    buttonWidth,
    UI_BUTTON_CONFIG[UIButtonVariant.PRIMARY].height,
    2,
  ).y;
  const quantityRowLayout = props.quantityNodeId
    ? resolveShopInfoAuxActionRowLayout({
      actionWidth: buttonWidth,
      auxToActionGap: props.quantityToButtonGap ?? 0,
      auxWidth: props.quantityColumnWidth ?? 0,
      infoToAuxGap: props.infoToQuantityGap ?? 0,
      leadingToInfoGap: props.iconToInfoGap,
      leadingWidth: props.itemWidth,
      rowWidth: props.rowWidth,
    })
    : null;
  const rowLayout = quantityRowLayout ?? resolveShopInfoActionRowLayout({
      actionWidth: buttonWidth,
      infoToActionGap: props.infoToButtonGap,
      leadingToInfoGap: props.iconToInfoGap,
      leadingWidth: props.itemWidth,
      rowWidth: props.rowWidth,
    });
  const children: UINode[] = [
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
          spriteSheetName: props.itemSpriteSheetName,
          width: props.itemWidth,
        },
      },
    }),
    createButtonWidget({
      anchor: "top-left",
      buttonState: props.buttonState,
      buttonVariant: UIButtonVariant.PRIMARY,
      nodeId: props.buttonNodeId,
      offsetX: rowLayout.actionX,
      offsetY: props.buttonOffsetY,
      onClickAction: props.onButtonClickAction,
      text: props.buttonText,
    }),
    createUINode({
      id: props.itemNameNodeId,
      layout: {
        offsetX: rowLayout.infoX - itemNameBounds.left,
        offsetY: textBaselineY,
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
  ];

  if (props.quantityNodeId) {
    const quantityText = props.quantityText ?? "";

    children.push(createUINode({
      id: props.quantityNodeId,
      layout: {
        offsetX: quantityRowLayout?.auxX ?? 0,
        offsetY: textBaselineY,
        width: props.quantityColumnWidth ?? 0,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "right",
          maxWidth: props.quantityColumnWidth ?? 0,
          text: quantityText,
        },
      },
    }));
  }

  return createUINode({
    children,
    id: props.nodeId,
    layout: createLegacyPointLayout(
      props.anchor,
      props.legacyOffsetX,
      props.legacyOffsetY,
    ),
  });
}

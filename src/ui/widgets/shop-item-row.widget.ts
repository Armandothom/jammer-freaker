import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import type { UIAction } from "../input/ui-action.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import { UIButtonVariant, type UIButtonState } from "../style/ui-button-config.js";
import { createLegacyPointLayout } from "./legacy-layout.js";
import { createButtonWidget } from "./button.widget.js";
import { getBitmapTextBounds } from "../../utils/get-bitmap-text-size.js";
import { getCenteredBitmapTextPosition } from "../../utils/get-centered-bitmap-text-position.js";

type ShopItemRowWidgetProps = {
  anchor: UIAnchor;
  buttonNodeId: string;
  buttonOffsetX: number;
  buttonOffsetY: number;
  buttonState: UIButtonState;
  buttonText: string;
  iconNodeId: string;
  itemHeight: number;
  itemName: string;
  itemNameNodeId: string;
  itemSpriteName: SpriteName;
  itemSpriteSheetName: SpriteSheetName;
  itemWidth: number;
  legacyOffsetX: number;
  legacyOffsetY: number;
  nameOffsetX: number;
  nodeId: string;
  onButtonClickAction: UIAction;
  quantityNodeId?: string;
  quantityText?: string;
  secondarySpacingX?: number;
};

export function createShopItemRowWidget(props: ShopItemRowWidgetProps): UINode {
  const itemNameBounds = getBitmapTextBounds(props.itemName, "04b_03", 2);
  const textBaselineY = props.buttonOffsetY + getCenteredBitmapTextPosition(
    props.buttonText,
    64,
    32,
    2,
  ).y;
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
      offsetX: props.buttonOffsetX,
      offsetY: props.buttonOffsetY,
      onClickAction: props.onButtonClickAction,
      text: props.buttonText,
    }),
    createUINode({
      id: props.itemNameNodeId,
      layout: {
        offsetX: props.itemWidth + props.nameOffsetX - itemNameBounds.left,
        offsetY: textBaselineY,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "left",
          maxWidth: null,
          text: props.itemName,
        },
      },
    }),
  ];

  if (props.quantityNodeId) {
    const quantityText = props.quantityText ?? "";
    const quantityBounds = getBitmapTextBounds(quantityText, "04b_03", 2);

    children.push(createUINode({
      id: props.quantityNodeId,
      layout: {
        offsetX: props.itemWidth
          + props.nameOffsetX
          + itemNameBounds.width
          + (props.secondarySpacingX ?? 0)
          - quantityBounds.left,
        offsetY: textBaselineY,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "left",
          maxWidth: null,
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

import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIAction } from "../input/ui-action.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { UIButtonVariant, type UIButtonState } from "../style/ui-button-config.js";
import type { UINode } from "../runtime/ui-node.js";
import { createUINode } from "../runtime/ui-node.js";
import { createButtonWidget } from "./button.widget.js";

type UpgradeTabButtonWidgetProps = {
  anchor: UIAnchor;
  buttonState: UIButtonState;
  iconHeight: number;
  iconOffsetX: number;
  iconOffsetY: number;
  iconSpriteName: SpriteName;
  iconWidth: number;
  legacyOffsetX: number;
  legacyOffsetY: number;
  nodeId: string;
  onClickAction: UIAction;
};

export function createUpgradeTabButtonWidget(
  props: UpgradeTabButtonWidgetProps,
): UINode {
  return createButtonWidget({
    anchor: props.anchor,
    buttonState: props.buttonState,
    buttonVariant: UIButtonVariant.COMPACT,
    children: [
      createUINode({
        id: `${props.nodeId}.icon`,
        layout: {
          offsetX: props.iconOffsetX,
          offsetY: props.iconOffsetY,
        },
        visual: {
          sprite: {
            height: props.iconHeight,
            spriteName: props.iconSpriteName,
            spriteSheetName: SpriteSheetName.WEAPON,
            width: props.iconWidth,
          },
        },
      }),
    ],
    legacyAnchor: true,
    nodeId: props.nodeId,
    offsetX: props.legacyOffsetX,
    offsetY: props.legacyOffsetY,
    onClickAction: props.onClickAction,
    text: "",
  });
}

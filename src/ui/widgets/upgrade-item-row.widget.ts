import type { UIAction } from "../input/ui-action.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import { UIButtonVariant, type UIButtonState } from "../style/ui-button-config.js";
import { createButtonWidget } from "./button.widget.js";
import { createLegacyPointLayout } from "./legacy-layout.js";

type UpgradeItemRowWidgetProps = {
  anchor: UIAnchor;
  buttonNodeId: string;
  buttonOffsetX: number;
  buttonOffsetY: number;
  buttonState: UIButtonState;
  buttonText: string;
  infoNodeId: string;
  infoOffsetX: number;
  infoText: string;
  labelNodeId: string;
  labelText: string;
  legacyOffsetX: number;
  legacyOffsetY: number;
  nodeId: string;
  onButtonClickAction: UIAction;
};

export function createUpgradeItemRowWidget(
  props: UpgradeItemRowWidgetProps,
): UINode {
  const children: UINode[] = [
    createUINode({
      id: props.labelNodeId,
      layout: {
        offsetX: 0,
        offsetY: 0,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "left",
          maxWidth: null,
          text: props.labelText,
        },
      },
    }),
    createUINode({
      id: props.infoNodeId,
      layout: {
        offsetX: props.infoOffsetX,
        offsetY: 0,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "left",
          maxWidth: null,
          text: props.infoText,
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
  ];

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

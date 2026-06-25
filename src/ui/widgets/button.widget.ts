import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonState,
  type UIButtonVariant,
  type UIButtonState as UIButtonStateValue,
} from "../style/ui-button-config.js";
import type { UIAction } from "../input/ui-action.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import { resolveLegacyAnchorLayout } from "./legacy-layout.js";

type ButtonWidgetProps = {
  anchor: UIAnchor;
  buttonState: UIButtonStateValue;
  buttonVariant: UIButtonVariant;
  children?: UINode[];
  legacyAnchor?: boolean;
  nodeId: string;
  offsetX: number;
  offsetY: number;
  onClickAction?: UIAction;
  text: string;
  width?: number;
  height?: number;
};

export function createButtonWidget(props: ButtonWidgetProps): UINode {
  const buttonConfig = UI_BUTTON_CONFIG[props.buttonVariant];
  const buttonWidth = props.width ?? buttonConfig.width;
  const buttonHeight = props.height ?? buttonConfig.height;
  const layout = props.legacyAnchor
    ? resolveLegacyAnchorLayout(
      props.anchor,
      props.offsetX,
      props.offsetY,
      buttonWidth,
      buttonHeight,
    )
    : {
      anchor: props.anchor,
      offsetX: props.offsetX,
      offsetY: props.offsetY,
    };

  return createUINode({
    children: props.children ?? [],
    id: props.nodeId,
    interaction: props.onClickAction
      ? {
        action: props.onClickAction,
        disabled: props.buttonState === UIButtonState.DISABLED,
      }
      : undefined,
    layout: {
      ...layout,
      childrenLayout: props.children?.length
        ? { kind: "absolute" }
        : undefined,
    },
    visual: {
      sprite: {
        height: buttonHeight,
        nineSlice: buttonConfig.nineSlice,
        spriteName: buttonConfig.states[props.buttonState].spriteName,
        spriteSheetName: SpriteSheetName.BUTTONS,
        width: buttonWidth,
      },
      text: {
        autoWrap: false,
        horizontalAlign: "center",
        maxWidth: buttonWidth,
        text: props.text,
      },
    },
  });
}

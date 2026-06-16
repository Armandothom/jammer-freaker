import type { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import type { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import type { UIAction } from "../input/ui-action.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";

type SpriteTextButtonWidgetArgs = {
  anchor: UIAnchor;
  disabled?: boolean;
  fontId?: string;
  gap?: number;
  nodeId: string;
  offsetX: number;
  offsetY: number;
  onClickAction?: UIAction;
  spriteHeight: number;
  spriteName: SpriteName;
  spriteNodeId?: string;
  spriteSheetName: SpriteSheetName;
  spriteWidth: number;
  text: string;
  textNodeId?: string;
  textScale?: number;
  textWidth?: number;
  width?: number;
};

export function createSpriteTextButtonWidget(args: SpriteTextButtonWidgetArgs): UINode {
  const interaction = args.onClickAction
    ? {
      action: args.onClickAction,
      disabled: args.disabled,
    }
    : undefined;

  return createUINode({
    children: [
      createUINode({
        id: args.spriteNodeId ?? `${args.nodeId}.sprite`,
        interaction,
        layout: {
          height: args.spriteHeight,
          width: args.spriteWidth,
        },
        visual: {
          sprite: {
            height: args.spriteHeight,
            spriteName: args.spriteName,
            spriteSheetName: args.spriteSheetName,
            width: args.spriteWidth,
          },
        },
      }),
      createUINode({
        id: args.textNodeId ?? `${args.nodeId}.text`,
        interaction,
        layout: {
          height: "content",
          width: args.textWidth ?? "content",
        },
        visual: {
          text: {
            autoWrap: false,
            fontId: args.fontId,
            horizontalAlign: "center",
            maxWidth: args.textWidth ?? null,
            scale: args.textScale,
            text: args.text,
          },
        },
      }),
    ],
    id: args.nodeId,
    layout: {
      anchor: args.anchor,
      childrenLayout: {
        align: "center",
        gap: args.gap ?? 0,
        kind: "stack-y",
      },
      offsetX: args.offsetX,
      offsetY: args.offsetY,
      width: args.width ?? "content",
    },
  });
}

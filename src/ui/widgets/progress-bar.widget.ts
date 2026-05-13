import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";

type ProgressBarWidgetArgs = {
  anchor: UIAnchor;
  backgroundNodeId: string;
  backgroundSpriteName: import("../../game/world/types/sprite-name.enum.js").SpriteName;
  fillNodeId: string;
  fillSourceHeight: number;
  fillSourceWidth: number;
  fillSpriteName: import("../../game/world/types/sprite-name.enum.js").SpriteName;
  nodeId: string;
  offsetX: number;
  offsetY: number;
  spriteSheetName: import("../../game/asset-manager/types/sprite-sheet-name.enum.js").SpriteSheetName;
  textNodeId?: string;
  textOffsetY?: number;
  visible?: boolean;
  width: number;
  height: number;
};

export function createProgressBarWidget(args: ProgressBarWidgetArgs): UINode {
  const children: UINode[] = [
    createUINode({
      id: args.backgroundNodeId,
      layout: {
        height: args.height,
        offsetX: 0,
        offsetY: 0,
        width: args.width,
      },
      visual: {
        sprite: {
          height: args.height,
          spriteName: args.backgroundSpriteName,
          spriteSheetName: args.spriteSheetName,
          width: args.width,
        },
      },
    }),
    createUINode({
      id: args.fillNodeId,
      layout: {
        height: args.height,
        offsetX: 0,
        offsetY: 0,
        width: args.width,
      },
      visual: {
        sprite: {
          clip: {
            sourceHeight: args.fillSourceHeight,
            sourceOffsetX: 0,
            sourceOffsetY: 0,
            sourceWidth: args.fillSourceWidth,
            trimRenderedSize: true,
          },
          height: args.height,
          spriteName: args.fillSpriteName,
          spriteSheetName: args.spriteSheetName,
          width: args.width,
        },
      },
    }),
  ];

  if (args.textNodeId) {
    children.push(createUINode({
      id: args.textNodeId,
      layout: {
        height: "content",
        offsetX: 0,
        offsetY: args.textOffsetY ?? 0,
        width: args.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "center",
          maxWidth: args.width,
          text: "",
        },
      },
    }));
  }

  return createUINode({
    children,
    id: args.nodeId,
    layout: {
      anchor: args.anchor,
      childrenLayout: {
        kind: "overlay",
      },
      offsetX: args.offsetX,
      offsetY: args.offsetY,
      width: args.width,
    },
    visible: args.visible,
  });
}

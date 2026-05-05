import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";

type ResourceCounterWidgetArgs = {
  anchor: UIAnchor;
  defaultIconHeight: number;
  defaultIconSpriteName: SpriteName;
  defaultIconSpriteSheetName: SpriteSheetName;
  defaultIconWidth: number;
  iconNodeId: string;
  iconOffsetX: number;
  iconOffsetY: number;
  nodeId: string;
  offsetX: number;
  offsetY: number;
  textNodeId: string;
  textWidth?: number;
  textOffsetX: number;
  textOffsetY: number;
};

export function createResourceCounterWidget(args: ResourceCounterWidgetArgs): UINode {
  return createUINode({
    children: [
      createUINode({
        id: args.textNodeId,
        layout: {
          height: "content",
          offsetX: args.textOffsetX,
          offsetY: args.textOffsetY,
          width: args.textWidth ?? "content",
        },
        visual: {
          text: {
            autoWrap: false,
            horizontalAlign: args.textWidth != null ? "right" : "left",
            maxWidth: args.textWidth ?? null,
            text: "",
          },
        },
      }),
      createUINode({
        id: args.iconNodeId,
        layout: {
          height: "content",
          offsetX: args.iconOffsetX,
          offsetY: args.iconOffsetY,
          width: "content",
        },
        visual: {
          sprite: {
            height: args.defaultIconHeight,
            spriteName: args.defaultIconSpriteName,
            spriteSheetName: args.defaultIconSpriteSheetName,
            width: args.defaultIconWidth,
          },
        },
      }),
    ],
    id: args.nodeId,
    layout: {
      anchor: args.anchor,
      childrenLayout: {
        kind: "overlay",
      },
      offsetX: args.offsetX,
      offsetY: args.offsetY,
    },
  });
}

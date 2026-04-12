import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIAnchor } from "../layout/ui-layout-types.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";

type WeaponPanelWidgetArgs = {
  anchor: UIAnchor;
  frameHeight: number;
  frameNodeId: string;
  frameSpriteName: SpriteName;
  frameSpriteSheetName: SpriteSheetName;
  frameWidth: number;
  iconHeight: number;
  iconNodeId: string;
  iconOffsetX: number;
  iconOffsetY: number;
  iconSpriteName: SpriteName;
  iconSpriteSheetName: SpriteSheetName;
  iconWidth: number;
  nodeId: string;
  offsetX: number;
  offsetY: number;
};

export function createWeaponPanelWidget(args: WeaponPanelWidgetArgs): UINode {
  return createUINode({
    children: [
      createUINode({
        id: args.frameNodeId,
        layout: {
          height: args.frameHeight,
          offsetX: 0,
          offsetY: 0,
          width: args.frameWidth,
        },
        visual: {
          sprite: {
            height: args.frameHeight,
            spriteName: args.frameSpriteName,
            spriteSheetName: args.frameSpriteSheetName,
            width: args.frameWidth,
          },
        },
      }),
      createUINode({
        id: args.iconNodeId,
        layout: {
          height: args.iconHeight,
          offsetX: args.iconOffsetX,
          offsetY: args.iconOffsetY,
          width: args.iconWidth,
        },
        visual: {
          sprite: {
            height: args.iconHeight,
            spriteName: args.iconSpriteName,
            spriteSheetName: args.iconSpriteSheetName,
            width: args.iconWidth,
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
      width: args.frameWidth,
    },
  });
}

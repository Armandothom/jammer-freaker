import { createUINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { CROSSHAIR_SKIN_MAP } from "../style/crosshair-skin-map.js";
import type { CrosshairCardinal } from "../view-models/crosshair.view-model.js";
import { CROSSHAIR_NODE_IDS } from "./node-ids/crosshair-node-ids.js";

type CrosshairCardinalLayout = {
  offsetX: number;
  offsetY: number;
  rotationOffset?: number;
};

export class CrosshairScreenOverlay implements UIScreen {
  public readonly id = "crosshair";

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        this.createCardinalNode("north"),
        this.createCardinalNode("south"),
        this.createCardinalNode("east"),
        this.createCardinalNode("west"),
      ],
      id: CROSSHAIR_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
      visible: CROSSHAIR_SKIN_MAP.visible,
    });
  }

  private createCardinalNode(cardinal: CrosshairCardinal): ReturnType<typeof createUINode> {
    const layout = resolveCrosshairCardinalLayout(
      cardinal,
      CROSSHAIR_SKIN_MAP.defaultCenter.x,
      CROSSHAIR_SKIN_MAP.defaultCenter.y,
      CROSSHAIR_SKIN_MAP.defaultRadius,
    );

    return createUINode({
      id: CROSSHAIR_NODE_IDS.cardinal[cardinal],
      layout: {
        anchor: "top-left",
        height: CROSSHAIR_SKIN_MAP.cardinal.height,
        offsetX: layout.offsetX,
        offsetY: layout.offsetY,
        width: CROSSHAIR_SKIN_MAP.cardinal.width,
      },
      visual: {
        sprite: {
          height: CROSSHAIR_SKIN_MAP.cardinal.height,
          rotationOffset: layout.rotationOffset,
          spriteName: CROSSHAIR_SKIN_MAP.cardinal.spriteName,
          spriteSheetName: CROSSHAIR_SKIN_MAP.cardinal.spriteSheetName,
          width: CROSSHAIR_SKIN_MAP.cardinal.width,
        },
      },
    });
  }
}

export function resolveCrosshairCardinalLayout(
  cardinal: CrosshairCardinal,
  centerX: number,
  centerY: number,
  radius: number,
): CrosshairCardinalLayout {
  const halfHeight = CROSSHAIR_SKIN_MAP.cardinal.height / 2;
  const width = CROSSHAIR_SKIN_MAP.cardinal.width;
  const safeRadius = Math.max(0, radius);
  let offsetX = centerX + safeRadius;
  let offsetY = centerY - halfHeight;
  let rotationOffset: number | undefined;

  switch (cardinal) {
    case "north":
      offsetX = centerX - halfHeight;
      offsetY = centerY - safeRadius;
      rotationOffset = -Math.PI / 2;
      break;

    case "south":
      offsetX = centerX + halfHeight;
      offsetY = centerY + safeRadius;
      rotationOffset = Math.PI / 2;
      break;

    case "east":
      offsetX = centerX + safeRadius;
      offsetY = centerY - halfHeight;
      break;

    case "west":
      offsetX = centerX - safeRadius - width;
      offsetY = centerY - halfHeight;
      break;
  }

  return {
    offsetX: Math.round(offsetX),
    offsetY: Math.round(offsetY),
    rotationOffset,
  };
}

import {
  createCloseChoicesOverlayAction,
  createExecuteChoicesOverlayAction,
} from "../input/choices-overlay-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { CHOICES_OVERLAY_SKIN_MAP } from "../style/choices-overlay-skin-map.js";
import {
  CHOICES_OVERLAY_MAX_CHOICES,
  CHOICES_OVERLAY_NODE_IDS,
  CHOICES_OVERLAY_SCREEN_ID,
} from "./node-ids/choices-overlay-node-ids.js";

export class ChoicesOverlayScreen implements UIScreen {
  public readonly id = CHOICES_OVERLAY_SCREEN_ID;

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          children: this.createChoiceNodes(),
          id: CHOICES_OVERLAY_NODE_IDS.frame,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            height: 32,
            offsetX: 0,
            offsetY: 0,
            padding: {
              bottom: CHOICES_OVERLAY_SKIN_MAP.frame.padding,
              left: CHOICES_OVERLAY_SKIN_MAP.frame.padding,
              right: CHOICES_OVERLAY_SKIN_MAP.frame.padding,
              top: CHOICES_OVERLAY_SKIN_MAP.frame.padding,
            },
            width: 32,
          },
          visual: {
            sprite: {
              height: 32,
              spriteName: CHOICES_OVERLAY_SKIN_MAP.frame.backgroundSpriteName,
              spriteSheetName: CHOICES_OVERLAY_SKIN_MAP.frame.backgroundSpriteSheetName,
              width: 32,
            },
          },
          visible: false,
          zIndex: 901,
        }),
      ],
      id: CHOICES_OVERLAY_NODE_IDS.root,
      interaction: {
        action: createCloseChoicesOverlayAction(),
      },
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
      zIndex: 900,
    });
  }

  private createChoiceNodes(): UINode[] {
    return Array.from({ length: CHOICES_OVERLAY_MAX_CHOICES }, (_value, choiceIndex) => {
      const nodeIds = CHOICES_OVERLAY_NODE_IDS.choice(choiceIndex);

      return createUINode({
        children: [
          createUINode({
            id: nodeIds.label,
            layout: {
              height: "content",
              offsetX: CHOICES_OVERLAY_SKIN_MAP.text.offsetX,
              offsetY: CHOICES_OVERLAY_SKIN_MAP.text.offsetY,
              width: CHOICES_OVERLAY_SKIN_MAP.choice.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "left",
                maxWidth: CHOICES_OVERLAY_SKIN_MAP.choice.width,
                scale: CHOICES_OVERLAY_SKIN_MAP.text.scale,
                text: "",
              },
            },
            zIndex: 903,
          }),
        ],
        id: nodeIds.root,
        interaction: {
          action: createExecuteChoicesOverlayAction("destroy"),
        },
        layout: {
          childrenLayout: {
            kind: "absolute",
          },
          height: CHOICES_OVERLAY_SKIN_MAP.choice.height,
          offsetX: 0,
          offsetY: 0,
          width: CHOICES_OVERLAY_SKIN_MAP.choice.width,
        },
        visible: false,
        zIndex: 902,
      });
    });
  }
}

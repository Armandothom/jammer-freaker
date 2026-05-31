import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { MAX_LOOT_CONTAINER_SLOTS } from "../../game/world/loot/loot-container-config.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";
import {
  createCloseContainerContentAction,
  createItemPlacementBindAction,
  createTakeAllContainerContentAction,
} from "../input/container-content-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { CONTAINER_CONTENT_SKIN_MAP } from "../style/container-content-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import {
  CONTAINER_CONTENT_NODE_IDS,
  CONTAINER_CONTENT_SCREEN_ID,
} from "./node-ids/container-content-node-ids.js";

const DEFAULT_FRAME_WIDTH = 224;
const DEFAULT_FRAME_HEIGHT = 176;

export class ContainerContentScreen implements UIScreen {
  public readonly id = CONTAINER_CONTENT_SCREEN_ID;

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          children: [
            createUINode({
              id: CONTAINER_CONTENT_NODE_IDS.hoveredItemName,
              layout: {
                height: CONTAINER_CONTENT_SKIN_MAP.hoveredItemName.height,
                offsetX: 0,
                offsetY: 0,
                width: DEFAULT_FRAME_WIDTH - (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2),
              },
              visual: {
                text: {
                  autoWrap: false,
                  horizontalAlign: "left",
                  maxWidth: DEFAULT_FRAME_WIDTH - (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2),
                  text: "",
                },
              },
              zIndex: 2,
            }),
            createUINode({
              children: [
                createUINode({
                  id: CONTAINER_CONTENT_NODE_IDS.closeButtonLabel,
                  layout: {
                    height: CONTAINER_CONTENT_SKIN_MAP.closeButton.height,
                    offsetX: 0,
                    offsetY: 0,
                    width: CONTAINER_CONTENT_SKIN_MAP.closeButton.width,
                  },
                  visual: {
                    text: {
                      autoWrap: false,
                      horizontalAlign: "center",
                      maxWidth: CONTAINER_CONTENT_SKIN_MAP.closeButton.width,
                      text: CONTAINER_CONTENT_SKIN_MAP.closeButton.text,
                    },
                  },
                  zIndex: 4,
                }),
              ],
              id: CONTAINER_CONTENT_NODE_IDS.closeButton,
              interaction: {
                action: createCloseContainerContentAction(),
              },
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: CONTAINER_CONTENT_SKIN_MAP.closeButton.height,
                offsetX: DEFAULT_FRAME_WIDTH
                  - (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2)
                  - CONTAINER_CONTENT_SKIN_MAP.closeButton.width,
                offsetY: 0,
                width: CONTAINER_CONTENT_SKIN_MAP.closeButton.width,
              },
              visual: {
                sprite: {
                  height: CONTAINER_CONTENT_SKIN_MAP.closeButton.height,
                  spriteName: SpriteName.BLANK,
                  spriteSheetName: SpriteSheetName.BLANK,
                  width: CONTAINER_CONTENT_SKIN_MAP.closeButton.width,
                },
              },
              zIndex: 3,
            }),
            ...this.createSlotNodes(),
            createButtonWidget({
              anchor: "top-left",
              buttonState: UIButtonState.NORMAL,
              buttonVariant: UIButtonVariant.PRIMARY,
              nodeId: CONTAINER_CONTENT_NODE_IDS.takeAllButton,
              offsetX: DEFAULT_FRAME_WIDTH
                - (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2)
                - CONTAINER_CONTENT_SKIN_MAP.takeAllButton.width,
              offsetY: DEFAULT_FRAME_HEIGHT
                - (CONTAINER_CONTENT_SKIN_MAP.frame.padding * 2)
                - CONTAINER_CONTENT_SKIN_MAP.takeAllButton.height,
              onClickAction: createTakeAllContainerContentAction(),
              text: CONTAINER_CONTENT_SKIN_MAP.takeAllButton.text,
              width: CONTAINER_CONTENT_SKIN_MAP.takeAllButton.width,
              height: CONTAINER_CONTENT_SKIN_MAP.takeAllButton.height,
            }),
          ],
          id: CONTAINER_CONTENT_NODE_IDS.containerFrame,
          layout: {
            anchor: "center",
            childrenLayout: {
              kind: "absolute",
            },
            height: DEFAULT_FRAME_HEIGHT,
            padding: {
              bottom: CONTAINER_CONTENT_SKIN_MAP.frame.padding,
              left: CONTAINER_CONTENT_SKIN_MAP.frame.padding,
              right: CONTAINER_CONTENT_SKIN_MAP.frame.padding,
              top: CONTAINER_CONTENT_SKIN_MAP.frame.padding,
            },
            width: DEFAULT_FRAME_WIDTH,
          },
          visual: {
            sprite: {
              height: DEFAULT_FRAME_HEIGHT,
              spriteName: CONTAINER_CONTENT_SKIN_MAP.frame.backgroundSpriteName,
              spriteSheetName: CONTAINER_CONTENT_SKIN_MAP.frame.backgroundSpriteSheetName,
              width: DEFAULT_FRAME_WIDTH,
            },
          },
        }),
        this.createDragVisualNode(),
      ],
      id: CONTAINER_CONTENT_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
    });
  }

  private createSlotNodes(): UINode[] {
    return Array.from({ length: MAX_LOOT_CONTAINER_SLOTS }, (_value, slotIndex) => {
      const nodeIds = CONTAINER_CONTENT_NODE_IDS.slot(slotIndex);

      return createUINode({
        children: [
          createUINode({
            id: nodeIds.icon,
            layout: {
              height: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
              offsetX: CONTAINER_CONTENT_SKIN_MAP.itemIcon.offsetX,
              offsetY: CONTAINER_CONTENT_SKIN_MAP.itemIcon.offsetY,
              width: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
            },
            visual: {
              sprite: {
                height: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
                spriteName: SpriteName.BLANK,
                spriteSheetName: SpriteSheetName.BLANK,
                width: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
              },
            },
            zIndex: 2,
          }),
          createUINode({
            id: nodeIds.label,
            layout: {
              height: "content",
              offsetX: CONTAINER_CONTENT_SKIN_MAP.itemLabel.offsetX,
              offsetY: CONTAINER_CONTENT_SKIN_MAP.itemLabel.offsetY,
              width: CONTAINER_CONTENT_SKIN_MAP.itemLabel.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "center",
                maxWidth: CONTAINER_CONTENT_SKIN_MAP.itemLabel.width,
                scale: 2,
                text: "",
              },
            },
            visible: false,
            zIndex: 2,
          }),
          createUINode({
            id: nodeIds.quantity,
            layout: {
              height: "content",
              offsetX: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.offsetX,
              offsetY: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.offsetY,
              width: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "right",
                maxWidth: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.width,
                scale: 2,
                text: "",
              },
            },
            zIndex: 3,
          }),
        ],
        id: nodeIds.root,
        interaction: {
          action: createItemPlacementBindAction("container", slotIndex),
        },
        layout: {
          childrenLayout: {
            kind: "absolute",
          },
          height: CONTAINER_CONTENT_SKIN_MAP.itemSlot.height,
          offsetX: 0,
          offsetY: 0,
          width: CONTAINER_CONTENT_SKIN_MAP.itemSlot.width,
        },
        visual: {
          sprite: {
            height: CONTAINER_CONTENT_SKIN_MAP.itemSlot.height,
            spriteName: CONTAINER_CONTENT_SKIN_MAP.itemSlot.backgroundSpriteName,
            spriteSheetName: CONTAINER_CONTENT_SKIN_MAP.itemSlot.backgroundSpriteSheetName,
            width: CONTAINER_CONTENT_SKIN_MAP.itemSlot.width,
          },
        },
        visible: false,
        zIndex: 1,
      });
    });
  }

  private createDragVisualNode(): UINode {
    return createUINode({
      children: [
        createUINode({
          id: CONTAINER_CONTENT_NODE_IDS.dragVisual.icon,
          layout: {
            height: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
            offsetX: CONTAINER_CONTENT_SKIN_MAP.itemIcon.offsetX,
            offsetY: CONTAINER_CONTENT_SKIN_MAP.itemIcon.offsetY,
            width: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
          },
          visual: {
            sprite: {
              height: CONTAINER_CONTENT_SKIN_MAP.itemIcon.height,
              spriteName: SpriteName.BLANK,
              spriteSheetName: SpriteSheetName.BLANK,
              width: CONTAINER_CONTENT_SKIN_MAP.itemIcon.width,
            },
          },
          zIndex: 21,
        }),
        createUINode({
          id: CONTAINER_CONTENT_NODE_IDS.dragVisual.label,
          layout: {
            height: "content",
            offsetX: CONTAINER_CONTENT_SKIN_MAP.itemLabel.offsetX,
            offsetY: CONTAINER_CONTENT_SKIN_MAP.itemLabel.offsetY,
            width: CONTAINER_CONTENT_SKIN_MAP.itemLabel.width,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "center",
              maxWidth: CONTAINER_CONTENT_SKIN_MAP.itemLabel.width,
              scale: 2,
              text: "",
            },
          },
          visible: false,
          zIndex: 21,
        }),
        createUINode({
          id: CONTAINER_CONTENT_NODE_IDS.dragVisual.quantity,
          layout: {
            height: "content",
            offsetX: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.offsetX,
            offsetY: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.offsetY,
            width: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.width,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "right",
              maxWidth: CONTAINER_CONTENT_SKIN_MAP.itemQuantity.width,
              scale: 2,
              text: "",
            },
          },
          zIndex: 22,
        }),
      ],
      id: CONTAINER_CONTENT_NODE_IDS.dragVisual.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: CONTAINER_CONTENT_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: CONTAINER_CONTENT_SKIN_MAP.itemSlot.width,
      },
      visible: false,
      zIndex: 20,
    });
  }
}

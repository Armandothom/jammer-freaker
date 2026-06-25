import { CAMP_STORAGE_MAX_SLOTS } from "../../ecs/components/states/camp-storage-state.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import {
  createCampStorageItemPlacementBindAction,
  createReturnFromCampStorageToHubAction,
} from "../input/camp-storage-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { CAMP_STORAGE_SKIN_MAP } from "../style/camp-storage-skin-map.js";
import { INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS } from "../style/inventory-overlay-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import {
  CAMP_STORAGE_NODE_IDS,
  CAMP_STORAGE_SCREEN_ID,
} from "./node-ids/camp-storage-node-ids.js";

const DEFAULT_STORAGE_FRAME_WIDTH = 220;
const DEFAULT_STORAGE_FRAME_HEIGHT = 428;
const DEFAULT_INVENTORY_FRAME_WIDTH = 220;
const DEFAULT_INVENTORY_FRAME_HEIGHT = 324;

export class CampStorageScreen implements UIScreen {
  public readonly id = CAMP_STORAGE_SCREEN_ID;

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          id: CAMP_STORAGE_NODE_IDS.background,
          layout: {
            height: "fill",
            width: "fill",
          },
          visual: {
            sprite: {
              spriteName: CAMP_STORAGE_SKIN_MAP.background.spriteName,
              spriteSheetName: CAMP_STORAGE_SKIN_MAP.background.spriteSheetName,
            },
          },
        }),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          height: CAMP_STORAGE_SKIN_MAP.returnButton.height,
          nodeId: CAMP_STORAGE_NODE_IDS.returnButton,
          offsetX: CAMP_STORAGE_SKIN_MAP.returnButton.offsetX,
          offsetY: CAMP_STORAGE_SKIN_MAP.returnButton.offsetY,
          onClickAction: createReturnFromCampStorageToHubAction(),
          text: "Return to Hub",
          width: CAMP_STORAGE_SKIN_MAP.returnButton.width,
        }),
        createUINode({
          children: [
            this.createTitleNode(
              CAMP_STORAGE_NODE_IDS.storageTitle,
              "Camp Storage",
              CAMP_STORAGE_SKIN_MAP.storagePanel.offsetX,
            ),
            this.createTitleNode(
              CAMP_STORAGE_NODE_IDS.inventoryTitle,
              "your inventory",
              CAMP_STORAGE_SKIN_MAP.inventoryPanel.offsetX,
            ),
            createUINode({
              children: this.createStorageSlotNodes(),
              id: CAMP_STORAGE_NODE_IDS.storageFrame,
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: DEFAULT_STORAGE_FRAME_HEIGHT,
                offsetX: CAMP_STORAGE_SKIN_MAP.storagePanel.offsetX,
                offsetY: CAMP_STORAGE_SKIN_MAP.storagePanel.offsetY,
                padding: {
                  bottom: CAMP_STORAGE_SKIN_MAP.frame.padding,
                  left: CAMP_STORAGE_SKIN_MAP.frame.padding,
                  right: CAMP_STORAGE_SKIN_MAP.frame.padding,
                  top: CAMP_STORAGE_SKIN_MAP.frame.padding,
                },
                width: DEFAULT_STORAGE_FRAME_WIDTH,
              },
              visual: {
                sprite: {
                  height: DEFAULT_STORAGE_FRAME_HEIGHT,
                  nineSlice: CAMP_STORAGE_SKIN_MAP.frame.nineSlice,
                  spriteName: CAMP_STORAGE_SKIN_MAP.frame.backgroundSpriteName,
                  spriteSheetName: CAMP_STORAGE_SKIN_MAP.frame.backgroundSpriteSheetName,
                  width: DEFAULT_STORAGE_FRAME_WIDTH,
                },
              },
              zIndex: 1,
            }),
            createUINode({
              children: this.createInventorySlotNodes(),
              id: CAMP_STORAGE_NODE_IDS.inventoryFrame,
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: DEFAULT_INVENTORY_FRAME_HEIGHT,
                offsetX: CAMP_STORAGE_SKIN_MAP.inventoryPanel.offsetX,
                offsetY: CAMP_STORAGE_SKIN_MAP.inventoryPanel.offsetY,
                padding: {
                  bottom: CAMP_STORAGE_SKIN_MAP.frame.padding,
                  left: CAMP_STORAGE_SKIN_MAP.frame.padding,
                  right: CAMP_STORAGE_SKIN_MAP.frame.padding,
                  top: CAMP_STORAGE_SKIN_MAP.frame.padding,
                },
                width: DEFAULT_INVENTORY_FRAME_WIDTH,
              },
              visual: {
                sprite: {
                  height: DEFAULT_INVENTORY_FRAME_HEIGHT,
                  nineSlice: CAMP_STORAGE_SKIN_MAP.frame.nineSlice,
                  spriteName: CAMP_STORAGE_SKIN_MAP.frame.backgroundSpriteName,
                  spriteSheetName: CAMP_STORAGE_SKIN_MAP.frame.backgroundSpriteSheetName,
                  width: DEFAULT_INVENTORY_FRAME_WIDTH,
                },
              },
              zIndex: 1,
            }),
            createUINode({
              id: CAMP_STORAGE_NODE_IDS.hoveredItemName,
              layout: {
                height: CAMP_STORAGE_SKIN_MAP.hoveredItemName.height,
                offsetX: 0,
                offsetY: CAMP_STORAGE_SKIN_MAP.hoveredItemName.offsetY,
                width: CAMP_STORAGE_SKIN_MAP.hoveredItemName.width,
              },
              visual: {
                text: {
                  autoWrap: false,
                  horizontalAlign: "center",
                  maxWidth: CAMP_STORAGE_SKIN_MAP.hoveredItemName.width,
                  text: "",
                },
              },
              zIndex: 5,
            }),
          ],
          id: CAMP_STORAGE_NODE_IDS.content,
          layout: {
            anchor: "center",
            childrenLayout: {
              kind: "absolute",
            },
            height: CAMP_STORAGE_SKIN_MAP.content.height,
            width: CAMP_STORAGE_SKIN_MAP.content.width,
          },
        }),
        this.createDragVisualNode(),
      ],
      id: CAMP_STORAGE_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
    });
  }

  private createDragVisualNode(): UINode {
    return createUINode({
      children: [
        this.createSlotIconNode(CAMP_STORAGE_NODE_IDS.dragVisual.icon, 21),
        this.createSlotLabelNode(CAMP_STORAGE_NODE_IDS.dragVisual.label, 21),
        this.createSlotQuantityNode(CAMP_STORAGE_NODE_IDS.dragVisual.quantity, 22),
      ],
      id: CAMP_STORAGE_NODE_IDS.dragVisual.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: CAMP_STORAGE_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: CAMP_STORAGE_SKIN_MAP.itemSlot.width,
      },
      visible: false,
      zIndex: 20,
    });
  }

  private createInventorySlotNodes(): UINode[] {
    return Array.from({ length: INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS }, (_value, slotIndex) => {
      const nodeIds = CAMP_STORAGE_NODE_IDS.inventorySlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createCampStorageItemPlacementBindAction("inventory", slotIndex),
        false,
      );
    });
  }

  private createSlotIconNode(nodeId: string, zIndex: number): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        height: CAMP_STORAGE_SKIN_MAP.itemIcon.height,
        offsetX: CAMP_STORAGE_SKIN_MAP.itemIcon.offsetX,
        offsetY: CAMP_STORAGE_SKIN_MAP.itemIcon.offsetY,
        width: CAMP_STORAGE_SKIN_MAP.itemIcon.width,
      },
      visual: {
        sprite: {
          height: CAMP_STORAGE_SKIN_MAP.itemIcon.height,
          spriteName: SpriteName.BLANK,
          spriteSheetName: SpriteSheetName.BLANK,
          width: CAMP_STORAGE_SKIN_MAP.itemIcon.width,
        },
      },
      zIndex,
    });
  }

  private createSlotLabelNode(nodeId: string, zIndex: number): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        height: "content",
        offsetX: CAMP_STORAGE_SKIN_MAP.itemLabel.offsetX,
        offsetY: CAMP_STORAGE_SKIN_MAP.itemLabel.offsetY,
        width: CAMP_STORAGE_SKIN_MAP.itemLabel.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "center",
          maxWidth: CAMP_STORAGE_SKIN_MAP.itemLabel.width,
          scale: 2,
          text: "",
        },
      },
      visible: false,
      zIndex,
    });
  }

  private createSlotNode(
    nodeIds: ReturnType<typeof CAMP_STORAGE_NODE_IDS.storageSlot>,
    action: ReturnType<typeof createCampStorageItemPlacementBindAction>,
    visible: boolean,
  ): UINode {
    return createUINode({
      children: [
        this.createSlotIconNode(nodeIds.icon, 4),
        this.createSlotLabelNode(nodeIds.label, 4),
        this.createSlotQuantityNode(nodeIds.quantity, 5),
      ],
      id: nodeIds.root,
      interaction: {
        action,
      },
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: CAMP_STORAGE_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: CAMP_STORAGE_SKIN_MAP.itemSlot.width,
      },
      visual: {
        sprite: {
          height: CAMP_STORAGE_SKIN_MAP.itemSlot.height,
          nineSlice: CAMP_STORAGE_SKIN_MAP.itemSlot.nineSlice,
          spriteName: CAMP_STORAGE_SKIN_MAP.itemSlot.backgroundSpriteName,
          spriteSheetName: CAMP_STORAGE_SKIN_MAP.itemSlot.backgroundSpriteSheetName,
          width: CAMP_STORAGE_SKIN_MAP.itemSlot.width,
        },
      },
      visible,
      zIndex: 3,
    });
  }

  private createSlotQuantityNode(nodeId: string, zIndex: number): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        height: "content",
        offsetX: CAMP_STORAGE_SKIN_MAP.itemQuantity.offsetX,
        offsetY: CAMP_STORAGE_SKIN_MAP.itemQuantity.offsetY,
        width: CAMP_STORAGE_SKIN_MAP.itemQuantity.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "right",
          maxWidth: CAMP_STORAGE_SKIN_MAP.itemQuantity.width,
          scale: 2,
          text: "",
        },
      },
      zIndex,
    });
  }

  private createStorageSlotNodes(): UINode[] {
    return Array.from({ length: CAMP_STORAGE_MAX_SLOTS }, (_value, slotIndex) => {
      const nodeIds = CAMP_STORAGE_NODE_IDS.storageSlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createCampStorageItemPlacementBindAction("storage", slotIndex),
        true,
      );
    });
  }

  private createTitleNode(nodeId: string, text: string, offsetX: number): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        height: CAMP_STORAGE_SKIN_MAP.title.height,
        offsetX,
        offsetY: CAMP_STORAGE_SKIN_MAP.title.offsetY,
        width: CAMP_STORAGE_SKIN_MAP.title.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "center",
          maxWidth: CAMP_STORAGE_SKIN_MAP.title.width,
          text,
        },
      },
      zIndex: 5,
    });
  }
}

import { INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS } from "../style/inventory-overlay-skin-map.js";
import {
  WARE_BUYER_MAX_SLOTS,
  WARE_BUYER_SOURCE_TAB,
} from "../../ecs/components/states/ware-buyer-state.js";
import { QUEST_TRADER } from "../../ecs/components/types/quest-config.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { createOpenQuestScreenAction } from "../input/quest-ui-actions.js";
import {
  createReturnFromWareBuyerToHubAction,
  createSelectWareBuyerSourceTabAction,
  createSellWareBuyerItemsAction,
  createWareBuyerItemPlacementBindAction,
} from "../input/ware-buyer-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { WARE_BUYER_SKIN_MAP } from "../style/ware-buyer-skin-map.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import {
  WARE_BUYER_NODE_IDS,
  WARE_BUYER_SCREEN_ID,
} from "./node-ids/ware-buyer-node-ids.js";

const DEFAULT_STORAGE_FRAME_WIDTH = 220;
const DEFAULT_STORAGE_FRAME_HEIGHT = 428;
const DEFAULT_INVENTORY_FRAME_WIDTH = 220;
const DEFAULT_INVENTORY_FRAME_HEIGHT = 324;
const DEFAULT_SALE_FRAME_WIDTH = 220;
const DEFAULT_SALE_FRAME_HEIGHT = 428;

export class WareBuyerScreen implements UIScreen {
  public readonly id = WARE_BUYER_SCREEN_ID;

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          id: WARE_BUYER_NODE_IDS.background,
          layout: {
            height: "fill",
            width: "fill",
          },
          visual: {
            sprite: {
              spriteName: WARE_BUYER_SKIN_MAP.background.spriteName,
              spriteSheetName: WARE_BUYER_SKIN_MAP.background.spriteSheetName,
            },
          },
        }),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          height: WARE_BUYER_SKIN_MAP.returnButton.height,
          nodeId: WARE_BUYER_NODE_IDS.returnButton,
          offsetX: WARE_BUYER_SKIN_MAP.returnButton.offsetX,
          offsetY: WARE_BUYER_SKIN_MAP.returnButton.offsetY,
          onClickAction: createReturnFromWareBuyerToHubAction(),
          text: "Return to Hub",
          width: WARE_BUYER_SKIN_MAP.returnButton.width,
        }),
        createButtonWidget({
          anchor: "bottom-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          height: WARE_BUYER_SKIN_MAP.returnButton.height,
          nodeId: WARE_BUYER_NODE_IDS.questButton,
          offsetX: WARE_BUYER_SKIN_MAP.returnButton.offsetX,
          offsetY: WARE_BUYER_SKIN_MAP.returnButton.offsetY,
          onClickAction: createOpenQuestScreenAction(QUEST_TRADER.CUCKOO),
          text: "Quests",
          width: WARE_BUYER_SKIN_MAP.returnButton.width,
        }),
        createUINode({
          children: [
            createButtonWidget({
              anchor: "top-left",
              buttonState: UIButtonState.NORMAL,
              buttonVariant: UIButtonVariant.TAB,
              height: 32,
              nodeId: WARE_BUYER_NODE_IDS.tabs.campStorage,
              offsetX: WARE_BUYER_SKIN_MAP.sourcePanel.offsetX,
              offsetY: 0,
              onClickAction: createSelectWareBuyerSourceTabAction(WARE_BUYER_SOURCE_TAB.CAMP_STORAGE),
              text: "Camp Storage",
              width: WARE_BUYER_SKIN_MAP.sourcePanel.tabWidth,
            }),
            createButtonWidget({
              anchor: "top-left",
              buttonState: UIButtonState.NORMAL,
              buttonVariant: UIButtonVariant.TAB,
              height: 32,
              nodeId: WARE_BUYER_NODE_IDS.tabs.backpack,
              offsetX: WARE_BUYER_SKIN_MAP.sourcePanel.offsetX
                + WARE_BUYER_SKIN_MAP.sourcePanel.tabWidth
                + WARE_BUYER_SKIN_MAP.sourcePanel.tabGap,
              offsetY: 0,
              onClickAction: createSelectWareBuyerSourceTabAction(WARE_BUYER_SOURCE_TAB.BACKPACK),
              text: "Backpack",
              width: WARE_BUYER_SKIN_MAP.sourcePanel.tabWidth,
            }),
            createUINode({
              children: this.createStorageSlotNodes(),
              id: WARE_BUYER_NODE_IDS.storageFrame,
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: DEFAULT_STORAGE_FRAME_HEIGHT,
                offsetX: WARE_BUYER_SKIN_MAP.sourcePanel.offsetX,
                offsetY: WARE_BUYER_SKIN_MAP.sourcePanel.frameOffsetY,
                padding: {
                  bottom: WARE_BUYER_SKIN_MAP.frame.padding,
                  left: WARE_BUYER_SKIN_MAP.frame.padding,
                  right: WARE_BUYER_SKIN_MAP.frame.padding,
                  top: WARE_BUYER_SKIN_MAP.frame.padding,
                },
                width: DEFAULT_STORAGE_FRAME_WIDTH,
              },
              visual: {
                sprite: {
                  height: DEFAULT_STORAGE_FRAME_HEIGHT,
                  nineSlice: WARE_BUYER_SKIN_MAP.frame.nineSlice,
                  spriteName: WARE_BUYER_SKIN_MAP.frame.backgroundSpriteName,
                  spriteSheetName: WARE_BUYER_SKIN_MAP.frame.backgroundSpriteSheetName,
                  width: DEFAULT_STORAGE_FRAME_WIDTH,
                },
              },
              zIndex: 1,
            }),
            createUINode({
              children: this.createInventorySlotNodes(),
              id: WARE_BUYER_NODE_IDS.inventoryFrame,
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: DEFAULT_INVENTORY_FRAME_HEIGHT,
                offsetX: WARE_BUYER_SKIN_MAP.sourcePanel.offsetX,
                offsetY: WARE_BUYER_SKIN_MAP.sourcePanel.frameOffsetY,
                padding: {
                  bottom: WARE_BUYER_SKIN_MAP.frame.padding,
                  left: WARE_BUYER_SKIN_MAP.frame.padding,
                  right: WARE_BUYER_SKIN_MAP.frame.padding,
                  top: WARE_BUYER_SKIN_MAP.frame.padding,
                },
                width: DEFAULT_INVENTORY_FRAME_WIDTH,
              },
              visual: {
                sprite: {
                  height: DEFAULT_INVENTORY_FRAME_HEIGHT,
                  nineSlice: WARE_BUYER_SKIN_MAP.frame.nineSlice,
                  spriteName: WARE_BUYER_SKIN_MAP.frame.backgroundSpriteName,
                  spriteSheetName: WARE_BUYER_SKIN_MAP.frame.backgroundSpriteSheetName,
                  width: DEFAULT_INVENTORY_FRAME_WIDTH,
                },
              },
              zIndex: 1,
            }),
            createUINode({
              id: WARE_BUYER_NODE_IDS.totalValue,
              layout: {
                height: WARE_BUYER_SKIN_MAP.title.height,
                offsetX: WARE_BUYER_SKIN_MAP.salePanel.offsetX,
                offsetY: 0,
                width: WARE_BUYER_SKIN_MAP.title.width,
              },
              visual: {
                text: {
                  autoWrap: false,
                  horizontalAlign: "center",
                  maxWidth: WARE_BUYER_SKIN_MAP.title.width,
                  text: "Total: $0",
                },
              },
              zIndex: 5,
            }),
            createUINode({
              children: this.createSaleSlotNodes(),
              id: WARE_BUYER_NODE_IDS.saleFrame,
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: DEFAULT_SALE_FRAME_HEIGHT,
                offsetX: WARE_BUYER_SKIN_MAP.salePanel.offsetX,
                offsetY: WARE_BUYER_SKIN_MAP.salePanel.frameOffsetY,
                padding: {
                  bottom: WARE_BUYER_SKIN_MAP.frame.padding,
                  left: WARE_BUYER_SKIN_MAP.frame.padding,
                  right: WARE_BUYER_SKIN_MAP.frame.padding,
                  top: WARE_BUYER_SKIN_MAP.frame.padding,
                },
                width: DEFAULT_SALE_FRAME_WIDTH,
              },
              visual: {
                sprite: {
                  height: DEFAULT_SALE_FRAME_HEIGHT,
                  nineSlice: WARE_BUYER_SKIN_MAP.frame.nineSlice,
                  spriteName: WARE_BUYER_SKIN_MAP.frame.backgroundSpriteName,
                  spriteSheetName: WARE_BUYER_SKIN_MAP.frame.backgroundSpriteSheetName,
                  width: DEFAULT_SALE_FRAME_WIDTH,
                },
              },
              zIndex: 1,
            }),
            createButtonWidget({
              anchor: "top-left",
              buttonState: UIButtonState.NORMAL,
              buttonVariant: UIButtonVariant.PROMINENT,
              height: WARE_BUYER_SKIN_MAP.sellButton.height,
              nodeId: WARE_BUYER_NODE_IDS.sellButton,
              offsetX: WARE_BUYER_SKIN_MAP.salePanel.offsetX + WARE_BUYER_SKIN_MAP.sellButton.offsetX,
              offsetY: WARE_BUYER_SKIN_MAP.sellButton.offsetY,
              onClickAction: createSellWareBuyerItemsAction(),
              text: "Sell Items",
              width: WARE_BUYER_SKIN_MAP.sellButton.width,
            }),
            createUINode({
              id: WARE_BUYER_NODE_IDS.hoveredItemName,
              layout: {
                height: WARE_BUYER_SKIN_MAP.hoveredItemName.height,
                offsetX: 0,
                offsetY: WARE_BUYER_SKIN_MAP.hoveredItemName.offsetY,
                width: WARE_BUYER_SKIN_MAP.hoveredItemName.width,
              },
              visual: {
                text: {
                  autoWrap: false,
                  horizontalAlign: "center",
                  maxWidth: WARE_BUYER_SKIN_MAP.hoveredItemName.width,
                  text: "",
                },
              },
              zIndex: 5,
            }),
          ],
          id: WARE_BUYER_NODE_IDS.content,
          layout: {
            anchor: "center",
            childrenLayout: {
              kind: "absolute",
            },
            height: WARE_BUYER_SKIN_MAP.content.height,
            width: WARE_BUYER_SKIN_MAP.content.width,
          },
        }),
        this.createDragVisualNode(),
      ],
      id: WARE_BUYER_NODE_IDS.root,
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
        this.createSlotIconNode(WARE_BUYER_NODE_IDS.dragVisual.icon, 21),
        this.createSlotLabelNode(WARE_BUYER_NODE_IDS.dragVisual.label, 21),
        this.createSlotQuantityNode(WARE_BUYER_NODE_IDS.dragVisual.quantity, 22),
      ],
      id: WARE_BUYER_NODE_IDS.dragVisual.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: WARE_BUYER_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: WARE_BUYER_SKIN_MAP.itemSlot.width,
      },
      visible: false,
      zIndex: 20,
    });
  }

  private createInventorySlotNodes(): UINode[] {
    return Array.from({ length: INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS }, (_value, slotIndex) => {
      const nodeIds = WARE_BUYER_NODE_IDS.inventorySlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createWareBuyerItemPlacementBindAction("inventory", slotIndex),
        false,
      );
    });
  }

  private createSaleSlotNodes(): UINode[] {
    return Array.from({ length: WARE_BUYER_MAX_SLOTS }, (_value, slotIndex) => {
      const nodeIds = WARE_BUYER_NODE_IDS.saleSlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createWareBuyerItemPlacementBindAction("sale", slotIndex),
        true,
      );
    });
  }

  private createSlotIconNode(nodeId: string, zIndex: number): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        height: WARE_BUYER_SKIN_MAP.itemIcon.height,
        offsetX: WARE_BUYER_SKIN_MAP.itemIcon.offsetX,
        offsetY: WARE_BUYER_SKIN_MAP.itemIcon.offsetY,
        width: WARE_BUYER_SKIN_MAP.itemIcon.width,
      },
      visual: {
        sprite: {
          height: WARE_BUYER_SKIN_MAP.itemIcon.height,
          spriteName: SpriteName.BLANK,
          spriteSheetName: SpriteSheetName.BLANK,
          width: WARE_BUYER_SKIN_MAP.itemIcon.width,
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
        offsetX: WARE_BUYER_SKIN_MAP.itemLabel.offsetX,
        offsetY: WARE_BUYER_SKIN_MAP.itemLabel.offsetY,
        width: WARE_BUYER_SKIN_MAP.itemLabel.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "center",
          maxWidth: WARE_BUYER_SKIN_MAP.itemLabel.width,
          scale: 2,
          text: "",
        },
      },
      visible: false,
      zIndex,
    });
  }

  private createSlotNode(
    nodeIds: ReturnType<typeof WARE_BUYER_NODE_IDS.storageSlot>,
    action: ReturnType<typeof createWareBuyerItemPlacementBindAction>,
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
        height: WARE_BUYER_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: WARE_BUYER_SKIN_MAP.itemSlot.width,
      },
      visual: {
        sprite: {
          height: WARE_BUYER_SKIN_MAP.itemSlot.height,
          nineSlice: WARE_BUYER_SKIN_MAP.itemSlot.nineSlice,
          spriteName: WARE_BUYER_SKIN_MAP.itemSlot.backgroundSpriteName,
          spriteSheetName: WARE_BUYER_SKIN_MAP.itemSlot.backgroundSpriteSheetName,
          width: WARE_BUYER_SKIN_MAP.itemSlot.width,
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
        offsetX: WARE_BUYER_SKIN_MAP.itemQuantity.offsetX,
        offsetY: WARE_BUYER_SKIN_MAP.itemQuantity.offsetY,
        width: WARE_BUYER_SKIN_MAP.itemQuantity.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "right",
          maxWidth: WARE_BUYER_SKIN_MAP.itemQuantity.width,
          scale: 2,
          text: "",
        },
      },
      zIndex,
    });
  }

  private createStorageSlotNodes(): UINode[] {
    return Array.from({ length: WARE_BUYER_MAX_SLOTS }, (_value, slotIndex) => {
      const nodeIds = WARE_BUYER_NODE_IDS.storageSlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createWareBuyerItemPlacementBindAction("storage", slotIndex),
        true,
      );
    });
  }
}

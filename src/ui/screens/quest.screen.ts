import {
  QUEST_DELIVERY_SLOT_COUNT,
  QUEST_STORAGE_MAX_SLOTS,
} from "../../ecs/components/states/quest-state.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import {
  createBlockQuestPopupAction,
  createDeliverQuestItemsAction,
  createQuestItemPlacementBindAction,
  createQuestPrimaryAction,
  createReturnFromQuestToShopAction,
  createSelectQuestSourceTabAction,
} from "../input/quest-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import { INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS } from "../style/inventory-overlay-skin-map.js";
import { QUEST_SCREEN_SKIN_MAP } from "../style/quest-screen-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import {
  QUEST_SCREEN_ID,
  QUEST_SCREEN_NODE_IDS,
} from "./node-ids/quest-screen-node-ids.js";

export class QuestScreen implements UIScreen {
  public readonly id = QUEST_SCREEN_ID;

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          id: QUEST_SCREEN_NODE_IDS.background,
          layout: {
            height: "fill",
            width: "fill",
          },
          visual: {
            sprite: {
              spriteName: QUEST_SCREEN_SKIN_MAP.background.spriteName,
              spriteSheetName: QUEST_SCREEN_SKIN_MAP.background.spriteSheetName,
            },
          },
        }),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          height: QUEST_SCREEN_SKIN_MAP.returnButton.height,
          nodeId: QUEST_SCREEN_NODE_IDS.returnButton,
          offsetX: QUEST_SCREEN_SKIN_MAP.returnButton.offsetX,
          offsetY: QUEST_SCREEN_SKIN_MAP.returnButton.offsetY,
          onClickAction: createReturnFromQuestToShopAction(),
          text: "Return",
          width: QUEST_SCREEN_SKIN_MAP.returnButton.width,
        }),
        this.createMainPanelNode(),
        this.createDeliveryPopupNode(),
        this.createDragVisualNode(),
      ],
      id: QUEST_SCREEN_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
    });
  }

  private createDeliveryPopupNode(): UINode {
    return createUINode({
      children: [
        createUINode({
          id: QUEST_SCREEN_NODE_IDS.delivery.blocker,
          interaction: {
            action: createBlockQuestPopupAction(),
          },
          layout: {
            height: QUEST_SCREEN_SKIN_MAP.popup.height,
            offsetX: 0,
            offsetY: 0,
            width: QUEST_SCREEN_SKIN_MAP.popup.width,
          },
        }),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.SELECTED,
          buttonVariant: UIButtonVariant.TAB,
          height: QUEST_SCREEN_SKIN_MAP.sourceTabs.height,
          nodeId: QUEST_SCREEN_NODE_IDS.tabs.campStorage,
          offsetX: QUEST_SCREEN_SKIN_MAP.sourceTabs.offsetX,
          offsetY: QUEST_SCREEN_SKIN_MAP.sourceTabs.offsetY,
          onClickAction: createSelectQuestSourceTabAction("camp_storage"),
          text: "Camp Storage",
          width: QUEST_SCREEN_SKIN_MAP.sourceTabs.tabWidth,
        }),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.TAB,
          height: QUEST_SCREEN_SKIN_MAP.sourceTabs.height,
          nodeId: QUEST_SCREEN_NODE_IDS.tabs.backpack,
          offsetX: QUEST_SCREEN_SKIN_MAP.sourceTabs.offsetX
            + QUEST_SCREEN_SKIN_MAP.sourceTabs.tabWidth
            + QUEST_SCREEN_SKIN_MAP.sourceTabs.tabGap,
          offsetY: QUEST_SCREEN_SKIN_MAP.sourceTabs.offsetY,
          onClickAction: createSelectQuestSourceTabAction("backpack"),
          text: "Backpack",
          width: QUEST_SCREEN_SKIN_MAP.sourceTabs.tabWidth,
        }),
        createUINode({
          children: this.createStorageSlotNodes(),
          id: QUEST_SCREEN_NODE_IDS.storageFrame,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            offsetX: QUEST_SCREEN_SKIN_MAP.sourceFrame.offsetX,
            offsetY: QUEST_SCREEN_SKIN_MAP.sourceFrame.offsetY,
            padding: {
              bottom: QUEST_SCREEN_SKIN_MAP.frame.padding,
              left: QUEST_SCREEN_SKIN_MAP.frame.padding,
              right: QUEST_SCREEN_SKIN_MAP.frame.padding,
              top: QUEST_SCREEN_SKIN_MAP.frame.padding,
            },
          },
          visual: {
            sprite: {
              nineSlice: QUEST_SCREEN_SKIN_MAP.frame.nineSlice,
              spriteName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteName,
              spriteSheetName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteSheetName,
            },
          },
        }),
        createUINode({
          children: this.createInventorySlotNodes(),
          id: QUEST_SCREEN_NODE_IDS.inventoryFrame,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            offsetX: QUEST_SCREEN_SKIN_MAP.sourceFrame.offsetX,
            offsetY: QUEST_SCREEN_SKIN_MAP.sourceFrame.offsetY,
            padding: {
              bottom: QUEST_SCREEN_SKIN_MAP.frame.padding,
              left: QUEST_SCREEN_SKIN_MAP.frame.padding,
              right: QUEST_SCREEN_SKIN_MAP.frame.padding,
              top: QUEST_SCREEN_SKIN_MAP.frame.padding,
            },
          },
          visible: false,
          visual: {
            sprite: {
              nineSlice: QUEST_SCREEN_SKIN_MAP.frame.nineSlice,
              spriteName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteName,
              spriteSheetName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteSheetName,
            },
          },
        }),
        createUINode({
          id: QUEST_SCREEN_NODE_IDS.delivery.title,
          layout: {
            offsetX: QUEST_SCREEN_SKIN_MAP.deliveryTitle.offsetX,
            offsetY: QUEST_SCREEN_SKIN_MAP.deliveryTitle.offsetY,
            width: QUEST_SCREEN_SKIN_MAP.deliveryTitle.width,
          },
          visual: {
            text: {
              autoWrap: true,
              horizontalAlign: "center",
              maxWidth: QUEST_SCREEN_SKIN_MAP.deliveryTitle.width,
              text: "Deposit Quest Items",
            },
          },
        }),
        createUINode({
          children: this.createDeliverySlotNodes(),
          id: QUEST_SCREEN_NODE_IDS.delivery.frame,
          layout: {
            childrenLayout: {
              kind: "absolute",
            },
            offsetX: QUEST_SCREEN_SKIN_MAP.deliveryFrame.offsetX,
            offsetY: QUEST_SCREEN_SKIN_MAP.deliveryFrame.offsetY,
            padding: {
              bottom: QUEST_SCREEN_SKIN_MAP.frame.padding,
              left: QUEST_SCREEN_SKIN_MAP.frame.padding,
              right: QUEST_SCREEN_SKIN_MAP.frame.padding,
              top: QUEST_SCREEN_SKIN_MAP.frame.padding,
            },
          },
          visual: {
            sprite: {
              nineSlice: QUEST_SCREEN_SKIN_MAP.frame.nineSlice,
              spriteName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteName,
              spriteSheetName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteSheetName,
            },
          },
        }),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          height: QUEST_SCREEN_SKIN_MAP.deliveryButton.height,
          nodeId: QUEST_SCREEN_NODE_IDS.delivery.button,
          offsetX: QUEST_SCREEN_SKIN_MAP.deliveryButton.offsetX,
          offsetY: QUEST_SCREEN_SKIN_MAP.deliveryButton.offsetY,
          onClickAction: createDeliverQuestItemsAction(),
          text: "Deliver Items",
          width: QUEST_SCREEN_SKIN_MAP.deliveryButton.width,
        }),
        createUINode({
          id: QUEST_SCREEN_NODE_IDS.hoveredItemName,
          layout: {
            height: QUEST_SCREEN_SKIN_MAP.hoveredItemName.height,
            offsetX: QUEST_SCREEN_SKIN_MAP.hoveredItemName.offsetX,
            offsetY: QUEST_SCREEN_SKIN_MAP.hoveredItemName.offsetY,
            width: QUEST_SCREEN_SKIN_MAP.hoveredItemName.width,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "center",
              maxWidth: QUEST_SCREEN_SKIN_MAP.hoveredItemName.width,
              text: "",
            },
          },
        }),
      ],
      id: QUEST_SCREEN_NODE_IDS.delivery.popup,
      layout: {
        anchor: "center",
        childrenLayout: {
          kind: "absolute",
        },
        height: QUEST_SCREEN_SKIN_MAP.popup.height,
        width: QUEST_SCREEN_SKIN_MAP.popup.width,
      },
      visible: false,
      visual: {
        sprite: {
          height: QUEST_SCREEN_SKIN_MAP.popup.height,
          nineSlice: QUEST_SCREEN_SKIN_MAP.frame.nineSlice,
          spriteName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteName,
          spriteSheetName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteSheetName,
          width: QUEST_SCREEN_SKIN_MAP.popup.width,
        },
      },
      zIndex: 10,
    });
  }

  private createDeliverySlotNodes(): UINode[] {
    return Array.from({ length: QUEST_DELIVERY_SLOT_COUNT }, (_value, slotIndex) => {
      const nodeIds = QUEST_SCREEN_NODE_IDS.deliverySlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createQuestItemPlacementBindAction("delivery", slotIndex),
        true,
      );
    });
  }

  private createDragVisualNode(): UINode {
    return createUINode({
      children: [
        this.createSlotIconNode(QUEST_SCREEN_NODE_IDS.dragVisual.icon, 21),
        this.createSlotLabelNode(QUEST_SCREEN_NODE_IDS.dragVisual.label, 21),
        this.createSlotQuantityNode(QUEST_SCREEN_NODE_IDS.dragVisual.quantity, 22),
      ],
      id: QUEST_SCREEN_NODE_IDS.dragVisual.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: QUEST_SCREEN_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: QUEST_SCREEN_SKIN_MAP.itemSlot.width,
      },
      visible: false,
      zIndex: QUEST_SCREEN_SKIN_MAP.dragVisual.zIndex,
    });
  }

  private createInventorySlotNodes(): UINode[] {
    return Array.from({ length: INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS }, (_value, slotIndex) => {
      const nodeIds = QUEST_SCREEN_NODE_IDS.inventorySlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createQuestItemPlacementBindAction("inventory", slotIndex),
        false,
      );
    });
  }

  private createMainPanelNode(): UINode {
    return createUINode({
      children: [
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.quest.title,
          QUEST_SCREEN_SKIN_MAP.mainText.textOffsetX,
          QUEST_SCREEN_SKIN_MAP.mainText.titleOffsetY,
          QUEST_SCREEN_SKIN_MAP.mainText.textWidth * 2,
          "",
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.quest.type,
          QUEST_SCREEN_SKIN_MAP.mainText.textOffsetX,
          QUEST_SCREEN_SKIN_MAP.mainText.typeOffsetY,
          QUEST_SCREEN_SKIN_MAP.mainText.textWidth,
          "",
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.quest.objectives,
          QUEST_SCREEN_SKIN_MAP.mainText.textOffsetX,
          QUEST_SCREEN_SKIN_MAP.mainText.objectivesOffsetY,
          QUEST_SCREEN_SKIN_MAP.mainText.textWidth,
          "",
          true,
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.quest.bestSources,
          QUEST_SCREEN_SKIN_MAP.mainText.textOffsetX,
          QUEST_SCREEN_SKIN_MAP.mainText.bestSourcesOffsetY,
          QUEST_SCREEN_SKIN_MAP.mainText.textWidth,
          "",
          true,
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.quest.rewards,
          QUEST_SCREEN_SKIN_MAP.mainText.textOffsetX,
          QUEST_SCREEN_SKIN_MAP.mainText.rewardsOffsetY,
          QUEST_SCREEN_SKIN_MAP.mainText.textWidth,
          "",
          true,
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.quest.status,
          QUEST_SCREEN_SKIN_MAP.mainText.textOffsetX,
          QUEST_SCREEN_SKIN_MAP.mainText.statusOffsetY,
          QUEST_SCREEN_SKIN_MAP.mainText.textWidth,
          "",
        ),
        this.createFinalPreviewNode(),
        createButtonWidget({
          anchor: "top-left",
          buttonState: UIButtonState.NORMAL,
          buttonVariant: UIButtonVariant.PROMINENT,
          height: QUEST_SCREEN_SKIN_MAP.mainActionButton.height,
          nodeId: QUEST_SCREEN_NODE_IDS.mainActionButton,
          offsetX: QUEST_SCREEN_SKIN_MAP.mainActionButton.offsetX,
          offsetY: QUEST_SCREEN_SKIN_MAP.mainActionButton.offsetY,
          onClickAction: createQuestPrimaryAction(),
          text: "Start Quest",
          width: QUEST_SCREEN_SKIN_MAP.mainActionButton.width,
        }),
      ],
      id: QUEST_SCREEN_NODE_IDS.mainPanel,
      layout: {
        anchor: "center",
        childrenLayout: {
          kind: "absolute",
        },
        height: QUEST_SCREEN_SKIN_MAP.mainPanel.height,
        width: QUEST_SCREEN_SKIN_MAP.mainPanel.width,
      },
      visual: {
        sprite: {
          height: QUEST_SCREEN_SKIN_MAP.mainPanel.height,
          nineSlice: QUEST_SCREEN_SKIN_MAP.frame.nineSlice,
          spriteName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteName,
          spriteSheetName: QUEST_SCREEN_SKIN_MAP.frame.backgroundSpriteSheetName,
          width: QUEST_SCREEN_SKIN_MAP.mainPanel.width,
        },
      },
    });
  }

  private createFinalPreviewNode(): UINode {
    return createUINode({
      children: [
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.finalPreview.title,
          0,
          0,
          QUEST_SCREEN_SKIN_MAP.preview.width,
          "",
          true,
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.finalPreview.type,
          0,
          34,
          QUEST_SCREEN_SKIN_MAP.preview.width,
          "",
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.finalPreview.objectives,
          0,
          62,
          QUEST_SCREEN_SKIN_MAP.preview.width,
          "",
          true,
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.finalPreview.bestSources,
          0,
          112,
          QUEST_SCREEN_SKIN_MAP.preview.width,
          "",
          true,
        ),
        this.createTextNode(
          QUEST_SCREEN_NODE_IDS.finalPreview.rewards,
          0,
          148,
          QUEST_SCREEN_SKIN_MAP.preview.width,
          "",
          true,
        ),
      ],
      id: QUEST_SCREEN_NODE_IDS.finalPreview.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        offsetX: QUEST_SCREEN_SKIN_MAP.preview.offsetX,
        offsetY: QUEST_SCREEN_SKIN_MAP.preview.offsetY,
        width: QUEST_SCREEN_SKIN_MAP.preview.width,
      },
      visible: false,
    });
  }

  private createSlotIconNode(nodeId: string, zIndex: number): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        height: QUEST_SCREEN_SKIN_MAP.itemIcon.height,
        offsetX: QUEST_SCREEN_SKIN_MAP.itemIcon.offsetX,
        offsetY: QUEST_SCREEN_SKIN_MAP.itemIcon.offsetY,
        width: QUEST_SCREEN_SKIN_MAP.itemIcon.width,
      },
      visual: {
        sprite: {
          height: QUEST_SCREEN_SKIN_MAP.itemIcon.height,
          spriteName: SpriteName.BLANK,
          spriteSheetName: SpriteSheetName.BLANK,
          width: QUEST_SCREEN_SKIN_MAP.itemIcon.width,
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
        offsetX: QUEST_SCREEN_SKIN_MAP.itemLabel.offsetX,
        offsetY: QUEST_SCREEN_SKIN_MAP.itemLabel.offsetY,
        width: QUEST_SCREEN_SKIN_MAP.itemLabel.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "center",
          maxWidth: QUEST_SCREEN_SKIN_MAP.itemLabel.width,
          scale: 2,
          text: "",
        },
      },
      visible: false,
      zIndex,
    });
  }

  private createSlotNode(
    nodeIds: ReturnType<typeof QUEST_SCREEN_NODE_IDS.storageSlot>,
    action: ReturnType<typeof createQuestItemPlacementBindAction>,
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
        height: QUEST_SCREEN_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: QUEST_SCREEN_SKIN_MAP.itemSlot.width,
      },
      visual: {
        sprite: {
          height: QUEST_SCREEN_SKIN_MAP.itemSlot.height,
          nineSlice: QUEST_SCREEN_SKIN_MAP.itemSlot.nineSlice,
          spriteName: QUEST_SCREEN_SKIN_MAP.itemSlot.backgroundSpriteName,
          spriteSheetName: QUEST_SCREEN_SKIN_MAP.itemSlot.backgroundSpriteSheetName,
          width: QUEST_SCREEN_SKIN_MAP.itemSlot.width,
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
        offsetX: QUEST_SCREEN_SKIN_MAP.itemQuantity.offsetX,
        offsetY: QUEST_SCREEN_SKIN_MAP.itemQuantity.offsetY,
        width: QUEST_SCREEN_SKIN_MAP.itemQuantity.width,
      },
      visual: {
        text: {
          autoWrap: false,
          horizontalAlign: "right",
          maxWidth: QUEST_SCREEN_SKIN_MAP.itemQuantity.width,
          scale: 2,
          text: "",
        },
      },
      zIndex,
    });
  }

  private createStorageSlotNodes(): UINode[] {
    return Array.from({ length: QUEST_STORAGE_MAX_SLOTS }, (_value, slotIndex) => {
      const nodeIds = QUEST_SCREEN_NODE_IDS.storageSlot(slotIndex);

      return this.createSlotNode(
        nodeIds,
        createQuestItemPlacementBindAction("storage", slotIndex),
        true,
      );
    });
  }

  private createTextNode(
    nodeId: string,
    offsetX: number,
    offsetY: number,
    width: number,
    text: string,
    autoWrap = false,
  ): UINode {
    return createUINode({
      id: nodeId,
      layout: {
        offsetX,
        offsetY,
        width,
      },
      visual: {
        text: {
          autoWrap,
          horizontalAlign: "left",
          maxWidth: width,
          text,
        },
      },
    });
  }
}

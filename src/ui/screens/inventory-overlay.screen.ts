import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { SpriteName } from "../../game/world-map/types/sprite-name.enum.js";
import { createItemPlacementBindAction } from "../input/container-content-ui-actions.js";
import { createSelectInventoryOverlayTabAction } from "../input/inventory-overlay-ui-actions.js";
import { createUINode, type UINode } from "../runtime/ui-node.js";
import type { UIScreen } from "../runtime/ui-screen.js";
import {
  INVENTORY_OVERLAY_MAX_ACTIVE_QUESTS,
  INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS,
  INVENTORY_OVERLAY_MAX_WEAPON_SLOTS,
  INVENTORY_OVERLAY_SKIN_MAP,
} from "../style/inventory-overlay-skin-map.js";
import { UIButtonState, UIButtonVariant } from "../style/ui-button-config.js";
import { createButtonWidget } from "../widgets/button.widget.js";
import {
  INVENTORY_OVERLAY_NODE_IDS,
  INVENTORY_OVERLAY_SCREEN_ID,
} from "./node-ids/inventory-overlay-node-ids.js";

export class InventoryOverlayScreen implements UIScreen {
  public readonly id = INVENTORY_OVERLAY_SCREEN_ID;

  public build(_context: Parameters<UIScreen["build"]>[0]): ReturnType<UIScreen["build"]> {
    return createUINode({
      children: [
        createUINode({
          children: [
            ...this.createTabNodes(),
            ...this.createWeaponSlotNodes(),
            createUINode({
              children: [
                createUINode({
                  id: INVENTORY_OVERLAY_NODE_IDS.hoveredItemName,
                  layout: {
                    height: INVENTORY_OVERLAY_SKIN_MAP.hoveredItemName.height,
                    offsetX: 0,
                    offsetY: 0,
                    width: 220 - (INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding * 2),
                  },
                  visual: {
                    text: {
                      autoWrap: false,
                      horizontalAlign: "left",
                      maxWidth: 220 - (INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding * 2),
                      text: "",
                    },
                  },
                  zIndex: 4,
                }),
                ...this.createBackpackSlotNodes(),
              ],
              id: INVENTORY_OVERLAY_NODE_IDS.backpackFrame,
              layout: {
                childrenLayout: {
                  kind: "absolute",
                },
                height: 64,
                offsetX: 0,
                offsetY: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.offsetY,
                padding: {
                  bottom: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding,
                  left: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding,
                  right: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding,
                  top: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.padding,
                },
                width: 220,
              },
              visual: {
                sprite: {
                  height: 64,
                  nineSlice: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.nineSlice,
                  spriteName: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.backgroundSpriteName,
                  spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.backpackFrame.backgroundSpriteSheetName,
                  width: 220,
                },
              },
              zIndex: 2,
            }),
            this.createQuestsFrameNode(),
          ],
          id: INVENTORY_OVERLAY_NODE_IDS.panelFrame,
          layout: {
            anchor: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.anchor,
            childrenLayout: {
              kind: "absolute",
            },
            height: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.height,
            offsetX: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.offsetX,
            offsetY: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.offsetY,
            padding: {
              bottom: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.padding,
              left: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.padding,
              right: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.padding,
              top: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.padding,
            },
            width: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.width,
          },
          visual: {
            sprite: {
              height: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.height,
              nineSlice: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.nineSlice,
              spriteName: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.backgroundSpriteName,
              spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.backgroundSpriteSheetName,
              width: INVENTORY_OVERLAY_SKIN_MAP.panelFrame.width,
            },
          },
          zIndex: 1,
        }),
        this.createDragVisualNode(),
      ],
      id: INVENTORY_OVERLAY_NODE_IDS.root,
      layout: {
        childrenLayout: {
          kind: "overlay",
        },
        height: "fill",
        width: "fill",
      },
    });
  }

  private createBackpackSlotNodes(): UINode[] {
    return Array.from({ length: INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS }, (_value, slotIndex) => {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.backpackSlot(slotIndex);

      return createUINode({
        children: [
          createUINode({
            id: nodeIds.icon,
            layout: {
              height: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.height,
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.width,
            },
            visual: {
              sprite: {
                height: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.height,
                spriteName: SpriteName.BLANK,
                spriteSheetName: SpriteSheetName.BLANK,
                width: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.width,
              },
            },
            zIndex: 4,
          }),
          createUINode({
            id: nodeIds.label,
            layout: {
              height: "content",
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "center",
                maxWidth: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.width,
                scale: 2,
                text: "",
              },
            },
            visible: false,
            zIndex: 4,
          }),
          createUINode({
            id: nodeIds.quantity,
            layout: {
              height: "content",
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "right",
                maxWidth: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.width,
                scale: 2,
                text: "",
              },
            },
            zIndex: 5,
          }),
        ],
        id: nodeIds.root,
        interaction: {
          action: createItemPlacementBindAction("inventory", slotIndex),
        },
        layout: {
          childrenLayout: {
            kind: "absolute",
          },
          height: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.height,
          offsetX: 0,
          offsetY: 0,
          width: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.width,
        },
        visual: {
          sprite: {
            height: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.height,
            nineSlice: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.nineSlice,
            spriteName: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.backgroundSpriteName,
            spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.backgroundSpriteSheetName,
            width: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.width,
          },
        },
        visible: false,
        zIndex: 3,
      });
    });
  }

  private createDragVisualNode(): UINode {
    return createUINode({
      children: [
        createUINode({
          id: INVENTORY_OVERLAY_NODE_IDS.dragVisual.icon,
          layout: {
            height: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.height,
            offsetX: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.offsetX,
            offsetY: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.offsetY,
            width: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.width,
          },
          visual: {
            sprite: {
              height: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.height,
              spriteName: SpriteName.BLANK,
              spriteSheetName: SpriteSheetName.BLANK,
              width: INVENTORY_OVERLAY_SKIN_MAP.itemIcon.width,
            },
          },
          zIndex: 21,
        }),
        createUINode({
          id: INVENTORY_OVERLAY_NODE_IDS.dragVisual.label,
          layout: {
            height: "content",
            offsetX: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.offsetX,
            offsetY: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.offsetY,
            width: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.width,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "center",
              maxWidth: INVENTORY_OVERLAY_SKIN_MAP.itemLabel.width,
              scale: 2,
              text: "",
            },
          },
          visible: false,
          zIndex: 21,
        }),
        createUINode({
          id: INVENTORY_OVERLAY_NODE_IDS.dragVisual.quantity,
          layout: {
            height: "content",
            offsetX: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.offsetX,
            offsetY: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.offsetY,
            width: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.width,
          },
          visual: {
            text: {
              autoWrap: false,
              horizontalAlign: "right",
              maxWidth: INVENTORY_OVERLAY_SKIN_MAP.itemQuantity.width,
              scale: 2,
              text: "",
            },
          },
          zIndex: 22,
        }),
      ],
      id: INVENTORY_OVERLAY_NODE_IDS.dragVisual.root,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.height,
        offsetX: 0,
        offsetY: 0,
        width: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.width,
      },
      visible: false,
      zIndex: 20,
    });
  }

  private createActiveQuestNodes(): UINode[] {
    return Array.from({ length: INVENTORY_OVERLAY_MAX_ACTIVE_QUESTS }, (_value, questIndex) => {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.activeQuest(questIndex);

      return createUINode({
        children: [
          this.createQuestTextNode(
            nodeIds.title,
            0,
            INVENTORY_OVERLAY_SKIN_MAP.activeQuest.titleOffsetY,
            INVENTORY_OVERLAY_SKIN_MAP.activeQuest.textWidth,
            "",
            true,
          ),
          this.createQuestTextNode(
            nodeIds.objective,
            0,
            INVENTORY_OVERLAY_SKIN_MAP.activeQuest.descriptionOffsetY,
            INVENTORY_OVERLAY_SKIN_MAP.activeQuest.textWidth,
            "",
            true,
          ),
        ],
        id: nodeIds.root,
        layout: {
          childrenLayout: {
            kind: "absolute",
          },
          height: INVENTORY_OVERLAY_SKIN_MAP.activeQuest.entryHeight,
          offsetX: INVENTORY_OVERLAY_SKIN_MAP.activeQuest.offsetX,
          offsetY: 0,
          width: INVENTORY_OVERLAY_SKIN_MAP.activeQuest.textWidth,
        },
        visible: false,
        zIndex: 3,
      });
    });
  }

  private createQuestTextNode(
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
      zIndex: 4,
    });
  }

  private createQuestsFrameNode(): UINode {
    return createUINode({
      children: [
        createUINode({
          id: INVENTORY_OVERLAY_NODE_IDS.activeQuestEmpty,
          layout: {
            offsetX: 0,
            offsetY: INVENTORY_OVERLAY_SKIN_MAP.activeQuest.offsetY,
            width: INVENTORY_OVERLAY_SKIN_MAP.activeQuest.textWidth,
          },
          visual: {
            text: {
              autoWrap: true,
              horizontalAlign: "left",
              maxWidth: INVENTORY_OVERLAY_SKIN_MAP.activeQuest.textWidth,
              text: "",
            },
          },
          visible: false,
          zIndex: 4,
        }),
        ...this.createActiveQuestNodes(),
      ],
      id: INVENTORY_OVERLAY_NODE_IDS.questsFrame,
      layout: {
        childrenLayout: {
          kind: "absolute",
        },
        height: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.height,
        offsetX: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.offsetX,
        offsetY: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.offsetY,
        padding: {
          bottom: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.padding,
          left: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.padding,
          right: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.padding,
          top: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.padding,
        },
        width: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.width,
      },
      visible: false,
      visual: {
        sprite: {
          height: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.height,
          nineSlice: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.nineSlice,
          spriteName: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.backgroundSpriteName,
          spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.backgroundSpriteSheetName,
          width: INVENTORY_OVERLAY_SKIN_MAP.questsFrame.width,
        },
      },
      zIndex: 2,
    });
  }

  private createTabNodes(): UINode[] {
    return [
      createButtonWidget({
        anchor: "top-left",
        buttonState: UIButtonState.SELECTED,
        buttonVariant: UIButtonVariant.TAB,
        height: INVENTORY_OVERLAY_SKIN_MAP.tabs.height,
        nodeId: INVENTORY_OVERLAY_NODE_IDS.tabs.inventory,
        offsetX: INVENTORY_OVERLAY_SKIN_MAP.tabs.offsetX,
        offsetY: INVENTORY_OVERLAY_SKIN_MAP.tabs.offsetY,
        onClickAction: createSelectInventoryOverlayTabAction("inventory"),
        text: "Inventory",
        width: INVENTORY_OVERLAY_SKIN_MAP.tabs.tabWidth,
      }),
      createButtonWidget({
        anchor: "top-left",
        buttonState: UIButtonState.NORMAL,
        buttonVariant: UIButtonVariant.TAB,
        height: INVENTORY_OVERLAY_SKIN_MAP.tabs.height,
        nodeId: INVENTORY_OVERLAY_NODE_IDS.tabs.quests,
        offsetX: INVENTORY_OVERLAY_SKIN_MAP.tabs.offsetX
          + INVENTORY_OVERLAY_SKIN_MAP.tabs.tabWidth
          + INVENTORY_OVERLAY_SKIN_MAP.tabs.tabGap,
        offsetY: INVENTORY_OVERLAY_SKIN_MAP.tabs.offsetY,
        onClickAction: createSelectInventoryOverlayTabAction("quests"),
        text: "Quests",
        width: INVENTORY_OVERLAY_SKIN_MAP.tabs.tabWidth,
      }),
    ];
  }

  private createWeaponSlotNodes(): UINode[] {
    return Array.from({ length: INVENTORY_OVERLAY_MAX_WEAPON_SLOTS }, (_value, slotIndex) => {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.weaponSlot(slotIndex);

      return createUINode({
        children: [
          createUINode({
            id: nodeIds.icon,
            layout: {
              height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.height,
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.width,
            },
            visual: {
              sprite: {
                height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.height,
                spriteName: SpriteName.BLANK,
                spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.spriteSheetName,
                width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.icon.width,
              },
            },
            zIndex: 4,
          }),
          createUINode({
            id: nodeIds.ammoIcon,
            layout: {
              height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.height,
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.width,
            },
            visual: {
              sprite: {
                height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.height,
                spriteName: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.spriteName,
                spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.spriteSheetName,
                width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoIcon.width,
              },
            },
            zIndex: 4,
          }),
          createUINode({
            id: nodeIds.ammoText,
            layout: {
              height: "content",
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoText.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoText.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoText.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "right",
                maxWidth: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.ammoText.width,
                scale: 2,
                text: "",
              },
            },
            zIndex: 5,
          }),
          createUINode({
            id: nodeIds.magIcon,
            layout: {
              height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.height,
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.width,
            },
            visual: {
              sprite: {
                height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.height,
                spriteName: SpriteName.BLANK,
                spriteSheetName: SpriteSheetName.BLANK,
                width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magIcon.width,
              },
            },
            zIndex: 4,
          }),
          createUINode({
            id: nodeIds.magText,
            layout: {
              height: "content",
              offsetX: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magText.offsetX,
              offsetY: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magText.offsetY,
              width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magText.width,
            },
            visual: {
              text: {
                autoWrap: false,
                horizontalAlign: "right",
                maxWidth: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.magText.width,
                scale: 2,
                text: "",
              },
            },
            zIndex: 5,
          }),
        ],
        id: nodeIds.root,
        layout: {
          childrenLayout: {
            kind: "absolute",
          },
          height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.height,
          offsetX: 0,
          offsetY: 0,
          width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.width,
        },
        visual: {
          sprite: {
            height: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.height,
            nineSlice: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.nineSlice,
            spriteName: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.backgroundSpriteName,
            spriteSheetName: INVENTORY_OVERLAY_SKIN_MAP.itemSlot.backgroundSpriteSheetName,
            width: INVENTORY_OVERLAY_SKIN_MAP.weaponSlot.width,
          },
        },
        visible: false,
        zIndex: 3,
      });
    });
  }
}

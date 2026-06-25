import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { CONTAINER_CONTENT_NODE_IDS } from "../../ui/screens/node-ids/container-content-node-ids.js";
import { CONTAINER_CONTENT_UI_ACTION } from "../../ui/input/container-content-ui-actions.js";
import { UIHitTest } from "../../ui/input/ui-hit-test.js";
import { InventoryOverlayPresenter } from "../../ui/presenters/inventory-overlay.presenter.js";
import { ContainerContentPresenter } from "../../ui/presenters/container-content.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  INVENTORY_OVERLAY_MAX_ACTIVE_QUESTS,
  INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS,
  INVENTORY_OVERLAY_MAX_WEAPON_SLOTS,
} from "../../ui/style/inventory-overlay-skin-map.js";
import {
  UI_BUTTON_CONFIG,
  UIButtonState,
  UIButtonVariant,
} from "../../ui/style/ui-button-config.js";
import { INVENTORY_OVERLAY_NODE_IDS } from "../../ui/screens/node-ids/inventory-overlay-node-ids.js";
import { ISystem } from "./system.interface.js";

type UIScreenPosition = {
  x: number;
  y: number;
};

export class InventoryOverlayRuntimeSystem implements ISystem {
  private canvas: HTMLCanvasElement;
  private mouseScreenPosition: UIScreenPosition | null = null;
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private inventoryOverlayPresenter: InventoryOverlayPresenter,
    private containerContentPresenter: ContainerContentPresenter,
  ) {
    const canvas = document.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("InventoryOverlayRuntimeSystem: canvas not found in DOM.");
    }

    this.canvas = canvas;
    this.canvas.addEventListener("mousemove", this.updateMousePosition);
    this.canvas.addEventListener("mouseleave", this.clearMousePosition);
  }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(INVENTORY_OVERLAY_NODE_IDS.root);

    if (!rootNode) {
      this.inventoryOverlayPresenter.setHoveredBackpackSlotIndex(null);
      return;
    }

    this.syncHoveredBackpackSlotFromMouse();

    const binder = this.getBinder();
    const viewModel = this.inventoryOverlayPresenter.buildViewModel();

    if (!viewModel) {
      binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.root, false);
      this.inventoryOverlayPresenter.setHoveredBackpackSlotIndex(null);
      this.uiRuntime.relayout();
      return;
    }

    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.root, true);
    this.applyButtonState(
      INVENTORY_OVERLAY_NODE_IDS.tabs.inventory,
      UIButtonVariant.TAB,
      viewModel.tabs[0].buttonState,
    );
    this.applyButtonState(
      INVENTORY_OVERLAY_NODE_IDS.tabs.quests,
      UIButtonVariant.TAB,
      viewModel.tabs[1].buttonState,
    );
    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.backpackFrame, viewModel.inventoryContentVisible);
    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.questsFrame, viewModel.questsContentVisible);
    binder.patchLayout(INVENTORY_OVERLAY_NODE_IDS.questsFrame, {
      height: viewModel.questsFrameHeight,
      width: viewModel.questsFrameWidth,
    });
    binder.patchSprite(INVENTORY_OVERLAY_NODE_IDS.questsFrame, {
      height: viewModel.questsFrameHeight,
      width: viewModel.questsFrameWidth,
    });
    binder.patchLayout(INVENTORY_OVERLAY_NODE_IDS.backpackFrame, {
      height: viewModel.backpackFrameHeight,
      offsetX: viewModel.backpackFrameX,
      offsetY: viewModel.backpackFrameY,
      width: viewModel.backpackFrameWidth,
    });
    binder.patchSprite(INVENTORY_OVERLAY_NODE_IDS.backpackFrame, {
      height: viewModel.backpackFrameHeight,
      width: viewModel.backpackFrameWidth,
    });
    binder.patchLayout(INVENTORY_OVERLAY_NODE_IDS.hoveredItemName, {
      width: viewModel.hoveredItemNameWidth,
    });
    binder.patchText(INVENTORY_OVERLAY_NODE_IDS.hoveredItemName, {
      maxWidth: viewModel.hoveredItemNameWidth,
      text: viewModel.hoveredItemName,
    });

    const visibleWeaponSlotIndexes = new Set<number>();

    for (const weaponSlot of viewModel.weaponSlots) {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.weaponSlot(weaponSlot.slotIndex);
      visibleWeaponSlotIndexes.add(weaponSlot.slotIndex);
      binder.setVisibility(nodeIds.root, weaponSlot.visible && viewModel.inventoryContentVisible);
      binder.patchLayout(nodeIds.root, {
        offsetX: weaponSlot.x,
        offsetY: weaponSlot.y,
      });
      binder.patchLayout(nodeIds.icon, {
        height: weaponSlot.iconHeight,
        width: weaponSlot.iconWidth,
      });
      binder.patchSprite(nodeIds.icon, {
        height: weaponSlot.iconHeight,
        spriteName: weaponSlot.iconSpriteName,
        spriteSheetName: weaponSlot.iconSpriteSheetName,
        width: weaponSlot.iconWidth,
      });
      binder.patchSprite(nodeIds.magIcon, {
        height: weaponSlot.magIconHeight,
        spriteName: weaponSlot.magIconSpriteName,
        spriteSheetName: weaponSlot.magIconSpriteSheetName,
        width: weaponSlot.magIconWidth,
      });
      binder.patchText(nodeIds.ammoText, {
        text: weaponSlot.ammoText,
      });
      binder.patchText(nodeIds.magText, {
        text: weaponSlot.magText,
      });
    }

    this.hideUnusedWeaponSlots(visibleWeaponSlotIndexes);

    const visibleBackpackSlotIndexes = new Set<number>();

    for (const backpackSlot of viewModel.backpackSlots) {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.backpackSlot(backpackSlot.slotIndex);
      visibleBackpackSlotIndexes.add(backpackSlot.slotIndex);
      binder.setVisibility(nodeIds.root, backpackSlot.visible && viewModel.inventoryContentVisible);
      binder.patchLayout(nodeIds.root, {
        offsetX: backpackSlot.x,
        offsetY: backpackSlot.y,
      });
      binder.setVisibility(nodeIds.icon, backpackSlot.iconVisible);
      binder.patchSprite(nodeIds.icon, {
        height: backpackSlot.iconHeight,
        spriteName: backpackSlot.iconSpriteName,
        spriteSheetName: backpackSlot.iconSpriteSheetName,
        width: backpackSlot.iconWidth,
      });
      binder.setVisibility(nodeIds.label, backpackSlot.labelVisible);
      binder.patchText(nodeIds.label, {
        text: backpackSlot.labelText,
      });
      binder.setVisibility(nodeIds.quantity, backpackSlot.quantityVisible);
      binder.patchText(nodeIds.quantity, {
        text: backpackSlot.amountText,
      });
    }

    this.hideUnusedBackpackSlots(visibleBackpackSlotIndexes);
    this.patchActiveQuests(viewModel);
    this.patchDragVisual();
    this.uiRuntime.relayout();
  }

  private applyButtonState(
    nodeId: string,
    buttonVariant: UIButtonVariant,
    buttonState: UIButtonState,
  ): void {
    const binder = this.getBinder();

    binder.patchInteraction(nodeId, {
      disabled: buttonState === UIButtonState.DISABLED,
    });
    binder.patchSprite(nodeId, {
      spriteName: UI_BUTTON_CONFIG[buttonVariant].states[buttonState].spriteName,
    });
  }

  private clearMousePosition = (): void => {
    this.mouseScreenPosition = null;
  };

  private getBinder(): UINodeBinder {
    if (!this.uiNodeBinder) {
      this.uiNodeBinder = new UINodeBinder(this.uiRuntime.getDocument());
    }

    return this.uiNodeBinder;
  }

  private hideUnusedBackpackSlots(visibleSlotIndexes: Set<number>): void {
    const binder = this.getBinder();

    for (let slotIndex = 0; slotIndex < INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS; slotIndex++) {
      if (visibleSlotIndexes.has(slotIndex)) {
        continue;
      }

      binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.backpackSlot(slotIndex).root, false);
    }
  }

  private hideUnusedWeaponSlots(visibleSlotIndexes: Set<number>): void {
    const binder = this.getBinder();

    for (let slotIndex = 0; slotIndex < INVENTORY_OVERLAY_MAX_WEAPON_SLOTS; slotIndex++) {
      if (visibleSlotIndexes.has(slotIndex)) {
        continue;
      }

      binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.weaponSlot(slotIndex).root, false);
    }
  }

  private hideUnusedActiveQuests(visibleQuestIndexes: Set<number>): void {
    const binder = this.getBinder();

    for (let questIndex = 0; questIndex < INVENTORY_OVERLAY_MAX_ACTIVE_QUESTS; questIndex++) {
      if (visibleQuestIndexes.has(questIndex)) {
        continue;
      }

      binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.activeQuest(questIndex).root, false);
    }
  }

  private patchActiveQuests(
    viewModel: NonNullable<ReturnType<InventoryOverlayPresenter["buildViewModel"]>>,
  ): void {
    const binder = this.getBinder();
    const visibleQuestIndexes = new Set<number>();

    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.activeQuestEmpty, viewModel.activeQuestEmptyVisible);
    binder.patchText(INVENTORY_OVERLAY_NODE_IDS.activeQuestEmpty, {
      text: viewModel.activeQuestEmptyText,
    });

    for (const activeQuest of viewModel.activeQuests) {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.activeQuest(activeQuest.questIndex);
      visibleQuestIndexes.add(activeQuest.questIndex);
      binder.setVisibility(nodeIds.root, activeQuest.visible);
      binder.patchLayout(nodeIds.root, {
        offsetX: activeQuest.x,
        offsetY: activeQuest.y,
      });
      binder.patchText(nodeIds.title, {
        text: activeQuest.titleText,
      });
      binder.patchText(nodeIds.objective, {
        text: activeQuest.objectiveText,
      });
    }

    this.hideUnusedActiveQuests(visibleQuestIndexes);
  }

  private patchDragVisual(): void {
    const binder = this.getBinder();
    const containerContentNode = this.uiRuntime.getDocument().getNodeOrNull(CONTAINER_CONTENT_NODE_IDS.root);
    const dragVisual = containerContentNode
      ? null
      : this.containerContentPresenter.buildDragVisualViewModel();

    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.dragVisual.root, dragVisual?.visible === true);

    if (!dragVisual) {
      return;
    }

    binder.patchLayout(INVENTORY_OVERLAY_NODE_IDS.dragVisual.root, {
      offsetX: dragVisual.x,
      offsetY: dragVisual.y,
    });
    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.dragVisual.icon, dragVisual.iconVisible);
    binder.patchSprite(INVENTORY_OVERLAY_NODE_IDS.dragVisual.icon, {
      height: dragVisual.iconHeight,
      spriteName: dragVisual.iconSpriteName,
      spriteSheetName: dragVisual.iconSpriteSheetName,
      width: dragVisual.iconWidth,
    });
    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.dragVisual.label, dragVisual.labelVisible);
    binder.patchText(INVENTORY_OVERLAY_NODE_IDS.dragVisual.label, {
      text: dragVisual.labelText,
    });
    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.dragVisual.quantity, dragVisual.quantityVisible);
    binder.patchText(INVENTORY_OVERLAY_NODE_IDS.dragVisual.quantity, {
      text: dragVisual.amountText,
    });
  }

  private syncHoveredBackpackSlotFromMouse(): void {
    if (!this.mouseScreenPosition) {
      this.inventoryOverlayPresenter.setHoveredBackpackSlotIndex(null);
      return;
    }

    const action = new UIHitTest(this.uiRuntime.getDocument()).pickAction(this.mouseScreenPosition);

    if (action?.type !== CONTAINER_CONTENT_UI_ACTION.ITEM_PLACEMENT_BIND
      || action.payload?.source !== "inventory") {
      this.inventoryOverlayPresenter.setHoveredBackpackSlotIndex(null);
      return;
    }

    const slotIndex = Number(action.payload?.slotIndex);
    this.inventoryOverlayPresenter.setHoveredBackpackSlotIndex(
      Number.isInteger(slotIndex) ? slotIndex : null,
    );
  }

  private updateMousePosition = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.mouseScreenPosition = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };
}

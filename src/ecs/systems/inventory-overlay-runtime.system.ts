import { UINodeBinder } from "../../ui/binding/ui-node-binder.js";
import { CONTAINER_CONTENT_NODE_IDS } from "../../ui/screens/node-ids/container-content-node-ids.js";
import { InventoryOverlayPresenter } from "../../ui/presenters/inventory-overlay.presenter.js";
import { ContainerContentPresenter } from "../../ui/presenters/container-content.presenter.js";
import { UIRuntime } from "../../ui/runtime/ui-runtime.js";
import {
  INVENTORY_OVERLAY_MAX_BACKPACK_SLOTS,
  INVENTORY_OVERLAY_MAX_WEAPON_SLOTS,
} from "../../ui/style/inventory-overlay-skin-map.js";
import { INVENTORY_OVERLAY_NODE_IDS } from "../../ui/screens/node-ids/inventory-overlay-node-ids.js";
import { ISystem } from "./system.interface.js";

export class InventoryOverlayRuntimeSystem implements ISystem {
  private uiNodeBinder: UINodeBinder | null = null;

  constructor(
    private uiRuntime: UIRuntime,
    private inventoryOverlayPresenter: InventoryOverlayPresenter,
    private containerContentPresenter: ContainerContentPresenter,
  ) { }

  public update(_deltaTime: number): void {
    const rootNode = this.uiRuntime.getDocument().getNodeOrNull(INVENTORY_OVERLAY_NODE_IDS.root);

    if (!rootNode) {
      return;
    }

    const binder = this.getBinder();
    const viewModel = this.inventoryOverlayPresenter.buildViewModel();

    if (!viewModel) {
      binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.root, false);
      this.uiRuntime.relayout();
      return;
    }

    binder.setVisibility(INVENTORY_OVERLAY_NODE_IDS.root, true);
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

    const visibleWeaponSlotIndexes = new Set<number>();

    for (const weaponSlot of viewModel.weaponSlots) {
      const nodeIds = INVENTORY_OVERLAY_NODE_IDS.weaponSlot(weaponSlot.slotIndex);
      visibleWeaponSlotIndexes.add(weaponSlot.slotIndex);
      binder.setVisibility(nodeIds.root, weaponSlot.visible);
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
      binder.setVisibility(nodeIds.root, backpackSlot.visible);
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
    this.patchDragVisual();
    this.uiRuntime.relayout();
  }

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
}

import {
  CHOICES_OVERLAY_UI_ACTION,
  type ChoicesOverlayChoiceId,
} from "../../ui/input/choices-overlay-ui-actions.js";
import type { UIAction, UIActionHandler } from "../../ui/input/ui-action.js";
import { ChoicesOverlayPresenter } from "../../ui/presenters/choices-overlay.presenter.js";
import { ContainerContentPresenter } from "../../ui/presenters/container-content.presenter.js";
import { InventoryOverlayPresenter } from "../../ui/presenters/inventory-overlay.presenter.js";
import { isInventoryResourceType } from "../components/types/inventory-resource-type.js";
import type { MedicalItemType } from "../components/types/medical-items-config.js";
import { MEDICAL_ITEM_CONFIG } from "../components/types/medical-items-config.js";

type MedicalItemUseHandler = (
  item: MedicalItemType,
  consumeInventory: boolean,
) => boolean;

export class ChoicesOverlayActionController implements UIActionHandler {
  constructor(
    private choicesOverlayPresenter: ChoicesOverlayPresenter,
    private containerContentPresenter: ContainerContentPresenter,
    private inventoryOverlayPresenter: InventoryOverlayPresenter,
    private useMedicalItem: MedicalItemUseHandler,
    private closeChoicesOverlay: () => void,
  ) { }

  public handle(action: UIAction): boolean {
    switch (action.type) {
      case CHOICES_OVERLAY_UI_ACTION.CLOSE:
        if (this.isPointerDownAction(action)) {
          this.close();
        }
        return true;

      case CHOICES_OVERLAY_UI_ACTION.EXECUTE:
        if (this.isPointerDownAction(action)) {
          this.executeChoice(action.payload?.choiceId);
        }
        return true;

      default:
        return false;
    }
  }

  private close(): void {
    this.choicesOverlayPresenter.close();
    this.closeChoicesOverlay();
  }

  private executeChoice(choiceId: string | undefined): void {
    if (!this.isChoiceId(choiceId)) {
      this.close();
      return;
    }

    const context = this.choicesOverlayPresenter.getContext();

    if (!context) {
      this.close();
      return;
    }

    switch (choiceId) {
      case "destroy":
        this.destroyItem(context.source, context.slotIndex);
        break;

      case "pick-up":
        if (context.source === "container") {
          this.containerContentPresenter.takeContainerSlotToInventory(context.slotIndex);
        }
        break;

      case "use":
        if (!this.isMedicalItem(context.itemId)) {
          break;
        }

        if (context.source === "container") {
          if (this.useMedicalItem(context.itemId, false)) {
            this.containerContentPresenter.removeContainerSlotItemAmount(context.slotIndex, 1);
          }
        } else {
          this.useMedicalItem(context.itemId, true);
        }
        break;

      default: {
        const exhaustiveCheck: never = choiceId;
        return exhaustiveCheck;
      }
    }

    this.close();
  }

  private destroyItem(source: "container" | "inventory", slotIndex: number): void {
    if (source === "container") {
      this.containerContentPresenter.destroyContainerSlotItem(slotIndex);
      return;
    }

    this.inventoryOverlayPresenter.removeBackpackSlotItem(slotIndex);
  }

  private isChoiceId(value: string | undefined): value is ChoicesOverlayChoiceId {
    return value === "destroy"
      || value === "pick-up"
      || value === "use";
  }

  private isMedicalItem(value: unknown): value is MedicalItemType {
    return isInventoryResourceType(value) && value in MEDICAL_ITEM_CONFIG;
  }

  private isPointerDownAction(action: UIAction): boolean {
    return !action.payload?.pointerEvent || action.payload.pointerEvent === "pointer-down";
  }
}

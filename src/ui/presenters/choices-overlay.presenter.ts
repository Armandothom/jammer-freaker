import {
  isInventoryResourceType,
} from "../../ecs/components/types/inventory-resource-type.js";
import { MEDICAL_ITEM_CONFIG } from "../../ecs/components/types/medical-items-config.js";
import { isMiscResourceType } from "../../ecs/components/types/misc-resource-type.js";
import type { LootTableItemId } from "../../game/world/loot/loot-tables.js";
import type {
  ChoicesOverlayChoiceId,
} from "../input/choices-overlay-ui-actions.js";
import type { ItemPlacementBindSource } from "../input/container-content-ui-actions.js";
import { CHOICES_OVERLAY_SKIN_MAP } from "../style/choices-overlay-skin-map.js";
import type {
  ChoicesOverlayChoiceViewModel,
  ChoicesOverlayViewModel,
} from "../view-models/choices-overlay.view-model.js";

export interface ChoicesOverlayContext {
  itemId: LootTableItemId;
  source: ItemPlacementBindSource;
  slotIndex: number;
  x: number;
  y: number;
}

type ChoicesOverlayChoiceDefinition = {
  choiceId: ChoicesOverlayChoiceId;
  label: string;
};

const CHOICE_LABELS: Record<ChoicesOverlayChoiceId, string> = {
  "destroy": "Destroy",
  "pick-up": "Pick Up",
  "use": "Use",
};

export class ChoicesOverlayPresenter {
  private context: ChoicesOverlayContext | null = null;

  public buildViewModel(): ChoicesOverlayViewModel | null {
    if (!this.context) {
      return null;
    }

    const choices = this.resolveChoices(this.context);
    const frameWidth = CHOICES_OVERLAY_SKIN_MAP.choice.width
      + (CHOICES_OVERLAY_SKIN_MAP.frame.padding * 2);
    const frameHeight = (choices.length * CHOICES_OVERLAY_SKIN_MAP.choice.height)
      + (Math.max(0, choices.length - 1) * CHOICES_OVERLAY_SKIN_MAP.layout.gap)
      + (CHOICES_OVERLAY_SKIN_MAP.frame.padding * 2);

    return {
      choices: choices.map((choice, index): ChoicesOverlayChoiceViewModel => ({
        choiceId: choice.choiceId,
        label: choice.label,
        visible: true,
        x: 0,
        y: index * (
          CHOICES_OVERLAY_SKIN_MAP.choice.height
          + CHOICES_OVERLAY_SKIN_MAP.layout.gap
        ),
      })),
      frameHeight,
      frameWidth,
      x: this.context.x,
      y: this.context.y,
    };
  }

  public close(): void {
    this.context = null;
  }

  public getContext(): ChoicesOverlayContext | null {
    return this.context;
  }

  public open(context: ChoicesOverlayContext): boolean {
    const choices = this.resolveChoices(context);

    if (choices.length === 0) {
      this.close();
      return false;
    }

    this.context = {
      ...context,
    };
    return true;
  }

  private resolveChoices(context: ChoicesOverlayContext): ChoicesOverlayChoiceDefinition[] {
    if (this.isMedicalItem(context.itemId)) {
      return context.source === "container"
        ? this.buildChoices(["use", "pick-up", "destroy"])
        : this.buildChoices(["use", "destroy"]);
    }

    if (isInventoryResourceType(context.itemId) || isMiscResourceType(context.itemId)) {
      return context.source === "container"
        ? this.buildChoices(["pick-up", "destroy"])
        : this.buildChoices(["destroy"]);
    }

    return [];
  }

  private buildChoices(choiceIds: ChoicesOverlayChoiceId[]): ChoicesOverlayChoiceDefinition[] {
    return choiceIds.map((choiceId) => ({
      choiceId,
      label: CHOICE_LABELS[choiceId],
    }));
  }

  private isMedicalItem(itemId: LootTableItemId): boolean {
    return isInventoryResourceType(itemId) && itemId in MEDICAL_ITEM_CONFIG;
  }
}

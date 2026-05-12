import { DIALOG_MAPPED_VALUES } from "../../game/asset-manager/consts/dialog-mapped-values.js";
import { GunsShopDialogEvent } from "../components/types/guns-shop-dialog-event.enum.js";

export class DialogManager {
  public getDialogTexts(dialogSourceId: string, dialogEntryId: string): string[] {
    const dialogBlueprint = DIALOG_MAPPED_VALUES.get(dialogSourceId);

    if (!dialogBlueprint) {
      throw new Error(`Dialog source not found: ${dialogSourceId}`);
    }

    const dialogEntry = dialogBlueprint.definition[dialogEntryId];

    if (!dialogEntry) {
      throw new Error(
        `Dialog entry "${dialogEntryId}" not found for source "${dialogSourceId}" in ${dialogBlueprint.jsonPath}`,
      );
    }

    return [...dialogEntry.dialogText];
  }

  public getGunDealerDialogTexts(dialogEvent: GunsShopDialogEvent): string[] {
    return this.getDialogTexts("gun_dealer", dialogEvent);
  }

  public getRandomGunDealerDialogText(dialogEvent: GunsShopDialogEvent): string {
    const dialogTexts = this.getGunDealerDialogTexts(dialogEvent);

    if (dialogTexts.length === 0) {
      throw new Error(`No dialog texts found for gun dealer event: ${dialogEvent}`);
    }

    const randomIndex = Math.floor(Math.random() * dialogTexts.length);
    return dialogTexts[randomIndex];
  }
}

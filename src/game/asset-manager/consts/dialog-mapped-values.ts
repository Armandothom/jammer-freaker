import gunDealerDialogDefinition from "../../../assets/json/gun_dealer_dialog.json" with { type: "json" };

export interface DialogEntryDefinition {
  dialogText: string[];
}

export type DialogSourceDefinition = Record<string, DialogEntryDefinition>;

export interface DialogBlueprint {
  jsonPath: string;
  definition: DialogSourceDefinition;
}

export const DIALOG_MAPPED_VALUES: Map<string, DialogBlueprint> = new Map([
  [
    "gun_dealer",
    {
      jsonPath: "src/assets/json/gun_dealer_dialog.json",
      definition: gunDealerDialogDefinition.gun_dealer as DialogSourceDefinition,
    },
  ],
]);

import { GunsShopDialogEvent } from "./types/guns-shop-dialog-event.enum.js";

export class GunsShopDialogIntentComponent {
    constructor(
        public readonly event: GunsShopDialogEvent,
    ) {
    }
}

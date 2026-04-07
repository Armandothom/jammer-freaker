import { ShopDialogEvent } from "./types/shop-dialog-event.enum.js";

export class ShopDialogIntentComponent {
    constructor(
        public readonly event: ShopDialogEvent,
    ) {
    }
}

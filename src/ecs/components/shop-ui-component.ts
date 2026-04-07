import { ShopUIEntryType, ShopUIType } from "./types/shop-ui-type.js";

export class ShopUIComponent {
    constructor(
        public readonly entryType: ShopUIEntryType,
        public readonly shopUiType: ShopUIType,
    ) { }
}

import { GunsShopUIEntryType, GunsShopUIType } from "./types/guns-shop-ui-type.js";

export class GunsShopUIComponent {
    constructor(
        public readonly entryType: GunsShopUIEntryType,
        public readonly gunsShopUiType: GunsShopUIType,
    ) { }
}

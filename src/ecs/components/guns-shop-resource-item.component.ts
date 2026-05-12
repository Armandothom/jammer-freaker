import type { GunsShopResourceItemType } from "./types/guns-shop-resource-item-config.js";

export class GunsShopResourceItemComponent {
    constructor(
        public readonly itemType: GunsShopResourceItemType,
        public quantityTextEntityId?: number,
    ) { }
}

import type { ShopResourceItemType } from "./types/shop-resource-item-config.js";

export class ResourceShopItemComponent {
    constructor(
        public readonly itemType: ShopResourceItemType,
        public quantityTextEntityId?: number,
    ) { }
}

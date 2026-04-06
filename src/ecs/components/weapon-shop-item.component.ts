import type { ShopWeaponItemType } from "./types/shop-weapon-item-config.js";

export class WeaponShopItemComponent {
    constructor(
        public readonly itemType: ShopWeaponItemType,
    ) { }
}

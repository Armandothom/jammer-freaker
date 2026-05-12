import type { GunsShopWeaponItemType } from "./types/guns-shop-weapon-item-config.js";

export class GunsShopWeaponItemComponent {
    constructor(
        public readonly itemType: GunsShopWeaponItemType,
    ) { }
}

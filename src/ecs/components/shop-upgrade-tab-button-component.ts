import { ShopUpgradeTabType } from "./types/shop-upgrade-tab-config.js";

export class ShopUpgradeTabButtonComponent {
    constructor(
        public readonly tabType: ShopUpgradeTabType,
    ) { }
}
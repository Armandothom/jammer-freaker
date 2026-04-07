import { ShopUpgradeTabType } from "./types/shop-upgrade-tab-config.js";
import { WeaponUpgradeType } from "./types/weapon-upgrade-config.js";

export class UpgradeShopItemComponent {
    constructor(
        public weaponUpgradeType: WeaponUpgradeType,
        public shopUpgradeTab: ShopUpgradeTabType,
    ) {

    }
}
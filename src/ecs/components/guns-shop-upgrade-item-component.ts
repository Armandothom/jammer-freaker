import { GunsShopUpgradeTabType } from "./types/guns-shop-upgrade-tab-config.js";
import { WeaponUpgradeType } from "./types/weapon-upgrade-config.js";

export class GunsShopUpgradeItemComponent {
    constructor(
        public weaponUpgradeType: WeaponUpgradeType,
        public gunsShopUpgradeTab: GunsShopUpgradeTabType,
    ) {

    }
}

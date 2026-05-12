import { GunsShopTabType } from "./types/guns-shop-tab-config.js";
import type { UIButtonState } from "../../ui/style/ui-button-config.js";


export class GunsShopButtonComponent {
    constructor(
        public gunsShopTabType: GunsShopTabType | undefined,
        public state: UIButtonState,
    ) { }
}

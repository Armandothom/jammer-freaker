import { ShopButtonState } from "./types/shop-button-config.js";
import { ShopTabType } from "./types/shop-tab-config.js";


export class ShopButtonComponent {
    constructor(
        public shopTabType: ShopTabType | undefined,
        public state: ShopButtonState,
    ) { }
}

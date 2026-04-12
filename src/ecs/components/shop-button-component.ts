import { ShopTabType } from "./types/shop-tab-config.js";
import type { UIButtonState } from "../../ui/style/ui-button-config.js";


export class ShopButtonComponent {
    constructor(
        public shopTabType: ShopTabType | undefined,
        public state: UIButtonState,
    ) { }
}

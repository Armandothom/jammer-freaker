import { ShopTabType } from "../types/shop-tab-config.js";

export class ShopTabState {
    private activeTabType: ShopTabType = ShopTabType.WEAPONS;

    public getActiveTabType(): ShopTabType {
        return this.activeTabType;
    }

    public setActiveTabType(tabType: ShopTabType): void {
        this.activeTabType = tabType;
    }

    public reset(): void {
        this.activeTabType = ShopTabType.WEAPONS;
    }
}

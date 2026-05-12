import { GunsShopTabType } from "../types/guns-shop-tab-config.js";

export class GunsShopTabState {
    private activeTabType: GunsShopTabType = GunsShopTabType.WEAPONS;

    public getActiveTabType(): GunsShopTabType {
        return this.activeTabType;
    }

    public setActiveTabType(tabType: GunsShopTabType): void {
        this.activeTabType = tabType;
    }

    public reset(): void {
        this.activeTabType = GunsShopTabType.WEAPONS;
    }
}

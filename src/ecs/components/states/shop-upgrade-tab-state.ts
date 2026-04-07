import { ShopUpgradeTabType } from "../types/shop-upgrade-tab-config.js";

export class ShopUpgradeTabState {
    private activeTabType: ShopUpgradeTabType = ShopUpgradeTabType.PISTOL;

    public getActiveTabType(): ShopUpgradeTabType {
        return this.activeTabType;
    }

    public setActiveTabType(tabType: ShopUpgradeTabType): void {
        this.activeTabType = tabType;
    }

    public reset(): void {
        this.activeTabType = ShopUpgradeTabType.PISTOL;
    }
}
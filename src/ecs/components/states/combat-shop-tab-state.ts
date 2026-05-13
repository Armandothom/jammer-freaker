import { CombatShopTabType } from "../types/combat-shop-tab-config.js";

export class CombatShopTabState {
    private activeTabType: CombatShopTabType = CombatShopTabType.UPGRADES;

    public getActiveTabType(): CombatShopTabType {
        return this.activeTabType;
    }

    public setActiveTabType(tabType: CombatShopTabType): void {
        this.activeTabType = tabType;
    }

    public reset(): void {
        this.activeTabType = CombatShopTabType.UPGRADES;
    }
}

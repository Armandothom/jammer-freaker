import { MedicalShopTabType } from "../types/medical-shop-tab-config.js";

export class MedicalShopTabState {
    private activeTabType: MedicalShopTabType = MedicalShopTabType.RESOURCES;

    public getActiveTabType(): MedicalShopTabType {
        return this.activeTabType;
    }

    public setActiveTabType(tabType: MedicalShopTabType): void {
        this.activeTabType = tabType;
    }

    public reset(): void {
        this.activeTabType = MedicalShopTabType.RESOURCES;
    }
}

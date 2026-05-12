import { GunsShopUpgradeTabType } from "../types/guns-shop-upgrade-tab-config.js";

export class GunsShopUpgradeTabState {
    private activeTabType: GunsShopUpgradeTabType = GunsShopUpgradeTabType.PISTOL;
    private visibleWindowStartIndex = 0;

    public getActiveTabType(): GunsShopUpgradeTabType {
        return this.activeTabType;
    }

    public setActiveTabType(tabType: GunsShopUpgradeTabType): void {
        this.activeTabType = tabType;
    }

    public getVisibleWindowStartIndex(): number {
        return this.visibleWindowStartIndex;
    }

    public setVisibleWindowStartIndex(index: number): void {
        this.visibleWindowStartIndex = Math.max(0, Math.floor(index));
    }

    public clampVisibleWindowStartIndex(totalTabs: number, visibleCapacity: number): void {
        this.visibleWindowStartIndex = this.normalizeVisibleWindowStartIndex(
            this.visibleWindowStartIndex,
            totalTabs,
            visibleCapacity,
        );
    }

    public ensureIndexVisible(index: number, totalTabs: number, visibleCapacity: number): void {
        const normalizedIndex = Math.max(0, Math.floor(index));
        this.visibleWindowStartIndex = this.normalizeVisibleWindowStartIndex(
            normalizedIndex,
            totalTabs,
            visibleCapacity,
        );
    }

    public shiftVisibleWindow(
        delta: number,
        totalTabs: number,
        visibleCapacity: number,
    ): boolean {
        const nextStart = this.normalizeVisibleWindowStartIndex(
            this.visibleWindowStartIndex + delta,
            totalTabs,
            visibleCapacity,
        );

        if (nextStart === this.visibleWindowStartIndex) {
            return false;
        }

        this.visibleWindowStartIndex = nextStart;
        return true;
    }

    public reset(): void {
        this.activeTabType = GunsShopUpgradeTabType.PISTOL;
        this.visibleWindowStartIndex = 0;
    }

    private normalizeVisibleWindowStartIndex(
        index: number,
        totalTabs: number,
        visibleCapacity: number,
    ): number {
        const pageSize = Math.max(1, visibleCapacity);
        const maxStartIndex = Math.max(0, (Math.ceil(totalTabs / pageSize) - 1) * pageSize);
        const clampedIndex = Math.min(Math.max(0, Math.floor(index)), maxStartIndex);

        return Math.floor(clampedIndex / pageSize) * pageSize;
    }
}

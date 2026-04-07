export class WeaponUpgradeState {
    constructor(
        public damageLevel: number = 0,
        public magSizeLevel: number = 0,
        public fireRateLevel: number = 0,
        public maxedOut: boolean = false,
    ) { }

    public clone(): WeaponUpgradeState {
        return new WeaponUpgradeState(
            this.damageLevel,
            this.magSizeLevel,
            this.fireRateLevel,
            this.maxedOut
        );
    }
}

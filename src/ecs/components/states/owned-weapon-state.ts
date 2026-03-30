import { WeaponUpgradeState } from "./weapon-upgrade-state.js";

export class OwnedWeaponState {
    constructor(
        public owned: boolean = false,
        public roundsInMag: number = 0,
        public upgrades: WeaponUpgradeState = new WeaponUpgradeState(),
    ) { }

    public clone(): OwnedWeaponState {
        return new OwnedWeaponState(
            this.owned,
            this.roundsInMag,
            this.upgrades.clone(),
        );
    }
}

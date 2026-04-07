export class WeaponSnapshot {
    constructor(
        public readonly owned: boolean,
        public readonly roundsInMag: number,
        public readonly damageLevel: number,
        public readonly magSizeLevel: number,
        public readonly fireRateLevel: number,
        public readonly maxedOut: boolean,
    ) { }
}

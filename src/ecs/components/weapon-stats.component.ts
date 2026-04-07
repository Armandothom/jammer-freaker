export class WeaponStatsComponent {
    constructor(
        public damage: number,
        public maxBullets: number,
        public reloadTime: number,
        public fireRate: number,
        public maxedOut: boolean,
    ) { }
}

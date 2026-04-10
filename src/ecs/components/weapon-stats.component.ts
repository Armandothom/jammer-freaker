export class WeaponStatsComponent {
    constructor(
        public damage: number,
        public maxBullets: number,
        public reloadTime: number,
        public fireRate: number,
        public spreadAngle: number | null,
        public projectilesFired: number | null,
        public projectileVelocity: number | null,
        public maxedOut: boolean,
    ) { }
}

export class DamageTakenIntentComponent {
    constructor(
        public damageSource: number,
        public damage: number,
    ) { }

    accumulate(damageSource: number, damage: number) {
        this.damageSource = damageSource;
        this.damage += damage;
    }
}

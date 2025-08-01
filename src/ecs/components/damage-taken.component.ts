export class DamageTakenComponent {
    public damageSource: number;
    public grenadeDamage: number;
    constructor(damageSource: number, grenadeDamage: number) {
        this.damageSource = damageSource
        this.grenadeDamage = grenadeDamage;
    }
}
export class HealthComponent {
    public hp: number;
    public maxHp: number;

    constructor(initialHp: number) {
        this.hp = initialHp;
        this.maxHp = initialHp;
    }

    takeDamage(damage: number): void {
        this.hp = Math.max(0, this.hp - damage);
    }

    isDead(): boolean {
        return this.hp <= 0;
    }
}
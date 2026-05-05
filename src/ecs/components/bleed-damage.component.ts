export class BleedDamageComponent {
    public bleedDPS: number;
    public bleedStacks: number;
    public timer: number = 0;
    constructor(
        bleedDPS: number,
        bleedStacks: number,
    ) {
        this.bleedDPS = bleedDPS;
        this.bleedStacks = bleedStacks;
    }
}
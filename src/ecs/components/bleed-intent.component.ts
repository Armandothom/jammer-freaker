export class BleedIntentComponent {
    public bleedChance: number;
    public bleedingStacks?: number
    constructor(
        bleedChance: number,
        bleedingStacks?: number
    ) {
        this.bleedChance = bleedChance;
        this.bleedingStacks = bleedingStacks;
    }
}
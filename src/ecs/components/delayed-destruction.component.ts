export class DelayedDestructionComponent {
    public totalDestructionTimer: number
    public destructionTime: number = 0;
    constructor(totalDestructionTimer: number) {
        this.totalDestructionTimer = totalDestructionTimer;
    }
}
export class GrenadeBeltComponent {
    public grenadeInventory: number;
    public maxGrenade: number;

    constructor(
        grenadeInventory: number,
        maxGrenade: number,
    ) {
        this.grenadeInventory = grenadeInventory;
        this.maxGrenade = maxGrenade;
    }

    consumeGrenade(): void {
        if (this.grenadeInventory > 0) {
            this.grenadeInventory--;
        }
    }
}
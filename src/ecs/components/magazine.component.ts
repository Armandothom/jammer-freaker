export class MagazineComponent {
    public bullets: number;
    public magazineSize: number;

    constructor(initialBullets: number) {
        this.bullets = initialBullets;
        this.magazineSize = initialBullets;
    }

    bulletSpent(): void {
        this.bullets = Math.max(0, this.bullets - 1);
    }
}
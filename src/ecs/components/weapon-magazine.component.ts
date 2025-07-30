export class WeaponMagazineComponent {
    public magazineInventory: number;
    public currentAmmo: number;
    public maxAmmo: number;
    public reloadTime: number;
    public isReloading: boolean;

    constructor(
        magazineInventory: number,
        currentAmmo: number,
        maxAmmo: number,
        reloadTime: number,
        isReloading: boolean,
    ) {
        this.magazineInventory = magazineInventory;
        this.currentAmmo = currentAmmo;
        this.maxAmmo = maxAmmo;
        this.reloadTime = reloadTime;
        this.isReloading = isReloading;
    }

    consumeAmmo(): void {
        if (this.currentAmmo > 0) {
            this.currentAmmo--;
        }
    }

    consumeMagazine(): void {
        if (this.magazineInventory > 0) {
            this.magazineInventory--;
        }
    }
}
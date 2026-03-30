import { WeaponType } from "./types/weapon-type.js";

export class ReloadIntentComponent {
    public endReloadTime: number;
    public reloadedWeapon: WeaponType;
    constructor(reloadTime: number, reloadedWeapon: WeaponType) {
        this.endReloadTime = reloadTime;
        this.reloadedWeapon = reloadedWeapon;
    }
}
import { WeaponType } from "./types/weapon-config.js";

export class ReloadIntentComponent {
    public endReloadTime: number;
    public reloadedWeapon: WeaponType;
    public hasPlayedReloadSound: boolean;
    constructor(reloadTime: number, reloadedWeapon: WeaponType) {
        this.endReloadTime = reloadTime;
        this.reloadedWeapon = reloadedWeapon;
        this.hasPlayedReloadSound = false;
    }
}

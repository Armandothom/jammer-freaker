import { WeaponType } from "./types/weapon-config.js";

export class IntentShotComponent {
    constructor(
        public x: number,
        public y: number,
        public isHold: boolean = false, // true = mousedown contínuo, false = clique único
        public weaponWielded: WeaponType,
    ) { }
}
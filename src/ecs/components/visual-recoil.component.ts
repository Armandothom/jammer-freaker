import { WeaponType } from "./types/weapon-config.js";

export class VisualRecoilComponent {
    public weaponType: WeaponType | null;
    public elapsedMs: number;
    public isPlaying: boolean;
    constructor(
        weaponType: WeaponType | null = null,
        elapsedMs: number = 0,
        isPlaying: boolean = true,
    ) {
        this.weaponType = weaponType;
        this.elapsedMs = elapsedMs;
        this.isPlaying = isPlaying;
    }
}

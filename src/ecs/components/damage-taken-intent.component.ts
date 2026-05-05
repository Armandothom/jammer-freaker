import type { EnemyType } from "./types/enemy-type.js";
import type { WeaponType } from "./types/weapon-config.js";

export class DamageTakenIntentComponent {
    constructor(
        public damagingEntity: number,
        public damageSource: EnemyType | WeaponType,
        public damage: number,
    ) { }

    accumulate(damagingEntity: number, damageSource: EnemyType | WeaponType, damage: number) {
        this.damagingEntity = damagingEntity;
        this.damageSource = damageSource;
        this.damage += damage;
    }
}

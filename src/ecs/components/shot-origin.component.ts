import type { EnemyType } from "./types/enemy-type.js";
import type { WeaponType } from "./types/weapon-config.js";

export class ShotOriginComponent {
  constructor(
    public shooterEntity: number,
    public shotStartX: number,
    public shotStartY: number,
    public damageSource?: EnemyType | WeaponType,
  ) {
  }
}

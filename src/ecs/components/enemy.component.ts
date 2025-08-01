import { EnemyType } from "./types/enemy-type.js";

export class EnemyComponent {
  public enemyType: EnemyType;
  constructor(enemyType: EnemyType) {
    this.enemyType = enemyType;
  }
}
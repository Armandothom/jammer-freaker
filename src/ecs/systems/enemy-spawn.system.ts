import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { EnemyType, EnemyConfig } from "../components/types/enemy-type.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemyComponent } from "../components/enemy.component.js";

export class EnemySpawnSystem implements ISystem {
    private timeSinceLastSpawn = 0;

    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private entityFactory: EntityFactory,

    ) {
    }

    update(deltaTime: number): void {
        this.timeSinceLastSpawn += deltaTime;
        const spawnIntervalsInSeconds = 3;
        const previousTime = this.timeSinceLastSpawn - deltaTime;

        const enemyTypes: EnemyType[] = Object.keys(EnemyType).map((k) => (EnemyType as any)[k]) as EnemyType[];
        //const hp = EnemyConfig[EnemyType.SOLDIER].hp;

        const enemySpawnChances: number[] = enemyTypes.map((enemyType) => EnemyConfig[enemyType].spawnFrequency);
        let spawnChancesAccumulated: number[] = [];

        for (let i = 0; i < enemySpawnChances.length; i++) {
            if (i == 0) {
                spawnChancesAccumulated[i] = enemySpawnChances[i];
            } else {
                spawnChancesAccumulated[i] = enemySpawnChances[i] + spawnChancesAccumulated[i - 1];
            }
        }

        const spawnRoll = Math.random();
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        const xRoll = canvas.width * Math.random();
        const yRoll = canvas.height * Math.random();
        // xRoll and yRoll as placeholder for now, must be improved to check collision,
        // another enemy its in the vicinity, must not spawn in the vicinity of the player

        // to be implemented: time elapsed || bypass logic for spawn logic
        // bypass being used to spawn a bunch of enemies on level start

        if (previousTime < spawnIntervalsInSeconds && this.timeSinceLastSpawn >= spawnIntervalsInSeconds) {
            this.timeSinceLastSpawn = 0;
            if (spawnRoll <= spawnChancesAccumulated[0]) {
                this.entityFactory.createSoldier(
                    xRoll, yRoll,
                    EnemyConfig[EnemyType.SOLDIER].hp,
                    EnemyConfig[EnemyType.SOLDIER].damage,
                    EnemyConfig[EnemyType.SOLDIER].attackCooldownInSeconds,
                    EnemyConfig[EnemyType.SOLDIER].attackRange,
                    EnemyConfig[EnemyType.SOLDIER].movementRadius,
                    EnemyConfig[EnemyType.SOLDIER].velocity);
            }
            if (spawnRoll > spawnChancesAccumulated[0] && spawnRoll < spawnChancesAccumulated[1]) {
                this.entityFactory.createSniper(
                    xRoll, yRoll,
                    EnemyConfig[EnemyType.SNIPER].hp,
                    EnemyConfig[EnemyType.SNIPER].damage,
                    EnemyConfig[EnemyType.SNIPER].attackCooldownInSeconds,
                    EnemyConfig[EnemyType.SNIPER].attackRange,
                    EnemyConfig[EnemyType.SNIPER].movementRadius,
                    EnemyConfig[EnemyType.SNIPER].velocity);
            }
            if (spawnRoll > spawnChancesAccumulated[1] && spawnRoll < spawnChancesAccumulated[2]) {
                //kmkz
                this.entityFactory.createKamikaze(
                    xRoll, yRoll,
                    EnemyConfig[EnemyType.KAMIKAZE].hp,
                    EnemyConfig[EnemyType.KAMIKAZE].damage,
                    EnemyConfig[EnemyType.KAMIKAZE].attackCooldownInSeconds,
                    EnemyConfig[EnemyType.KAMIKAZE].attackRange,
                    EnemyConfig[EnemyType.KAMIKAZE].movementRadius,
                    EnemyConfig[EnemyType.KAMIKAZE].velocity);
            }
            if (spawnRoll > spawnChancesAccumulated[2] && spawnRoll < spawnChancesAccumulated[3]) {
                //JUGG
                this.entityFactory.createJuggernaut(
                    xRoll, yRoll,
                    EnemyConfig[EnemyType.JUGG].hp,
                    EnemyConfig[EnemyType.JUGG].damage,
                    EnemyConfig[EnemyType.JUGG].attackCooldownInSeconds,
                    EnemyConfig[EnemyType.JUGG].attackRange,
                    EnemyConfig[EnemyType.JUGG].movementRadius,
                    EnemyConfig[EnemyType.JUGG].velocity);
            }
            if (spawnRoll > spawnChancesAccumulated[3] && spawnRoll < spawnChancesAccumulated[4]) {
                this.entityFactory.createBomber(
                    xRoll, yRoll,
                    EnemyConfig[EnemyType.BOMBER].hp,
                    EnemyConfig[EnemyType.BOMBER].damage,
                    EnemyConfig[EnemyType.BOMBER].attackCooldownInSeconds,
                    EnemyConfig[EnemyType.BOMBER].attackRange,
                    EnemyConfig[EnemyType.BOMBER].movementRadius,
                    EnemyConfig[EnemyType.BOMBER].velocity);
            }
        }
    }
}
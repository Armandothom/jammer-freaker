import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { EnemyType, EnemyConfig } from "../components/types/enemy-type.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { CollisionComponent } from "../components/collision-component.js";
import { PlayerComponent } from "../components/player.component.js";
import { EnemyDead } from "../components/enemy-dead.component.js";

export class EnemySpawnSystem implements ISystem {
    private timeSinceLastSpawn = 0;

    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private collisionComponentStore: ComponentStore<CollisionComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDead>,
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
            // this.trySpawn(spawnRoll, 0);
            // if (spawnRoll <= spawnChancesAccumulated[0]) {
            //     this.entityFactory.createSoldier(
            //         xRoll, yRoll,
            //         EnemyConfig[EnemyType.SOLDIER].hp,
            //         EnemyConfig[EnemyType.SOLDIER].damage,
            //         EnemyConfig[EnemyType.SOLDIER].attackCooldownInSeconds,
            //         EnemyConfig[EnemyType.SOLDIER].attackRange,
            //         EnemyConfig[EnemyType.SOLDIER].movementRadius,
            //         EnemyConfig[EnemyType.SOLDIER].velocity);
            // }
            // if (spawnRoll > spawnChancesAccumulated[0] && spawnRoll < spawnChancesAccumulated[1]) {
            //     this.entityFactory.createSniper(
            //         xRoll, yRoll,
            //         EnemyConfig[EnemyType.SNIPER].hp,
            //         EnemyConfig[EnemyType.SNIPER].damage,
            //         EnemyConfig[EnemyType.SNIPER].attackCooldownInSeconds,
            //         EnemyConfig[EnemyType.SNIPER].attackRange,
            //         EnemyConfig[EnemyType.SNIPER].movementRadius,
            //         EnemyConfig[EnemyType.SNIPER].velocity);
            // }
            // if (spawnRoll > spawnChancesAccumulated[1] && spawnRoll < spawnChancesAccumulated[2]) {
            //     //kmkz
            //     this.entityFactory.createKamikaze(
            //         xRoll, yRoll,
            //         EnemyConfig[EnemyType.KAMIKAZE].hp,
            //         EnemyConfig[EnemyType.KAMIKAZE].damage,
            //         EnemyConfig[EnemyType.KAMIKAZE].attackCooldownInSeconds,
            //         EnemyConfig[EnemyType.KAMIKAZE].attackRange,
            //         EnemyConfig[EnemyType.KAMIKAZE].movementRadius,
            //         EnemyConfig[EnemyType.KAMIKAZE].velocity);
            // }
            // if (spawnRoll > spawnChancesAccumulated[2] && spawnRoll < spawnChancesAccumulated[3]) {
            //     //JUGG
            //     this.entityFactory.createJuggernaut(
            //         xRoll, yRoll,
            //         EnemyConfig[EnemyType.JUGG].hp,
            //         EnemyConfig[EnemyType.JUGG].damage,
            //         EnemyConfig[EnemyType.JUGG].attackCooldownInSeconds,
            //         EnemyConfig[EnemyType.JUGG].attackRange,
            //         EnemyConfig[EnemyType.JUGG].movementRadius,
            //         EnemyConfig[EnemyType.JUGG].velocity);
            // }
            // if (spawnRoll > spawnChancesAccumulated[3] && spawnRoll < spawnChancesAccumulated[4]) {
            //     this.entityFactory.createBomber(
            //         xRoll, yRoll,
            //         EnemyConfig[EnemyType.BOMBER].hp,
            //         EnemyConfig[EnemyType.BOMBER].damage,
            //         EnemyConfig[EnemyType.BOMBER].attackCooldownInSeconds,
            //         EnemyConfig[EnemyType.BOMBER].attackRange,
            //         EnemyConfig[EnemyType.BOMBER].movementRadius,
            //         EnemyConfig[EnemyType.BOMBER].velocity);
            // }
        }
    }

    trySpawn(spawnRoll: number, spawnAttempt: number) {
        const playerEntities = this.playerComponentStore.getAllEntities();
        const playerEntity = playerEntities[0]; // hard coded as the first player
        const playerPos: { x: number, y: number } = this.positionComponentStore.get(playerEntity);
        const enemyEntities = this.enemyComponentStore.getAllEntities();
        const deadEnemiesEntities = this.enemyDeadComponentStore.getAllEntities();

        const inCommon = deadEnemiesEntities.filter(function (v) {
            return enemyEntities.indexOf(v) > -1;
        });
        const exclusiveA = deadEnemiesEntities.filter(function (v) {
            return inCommon.indexOf(v) === -1;
        });
        const exclusiveB = enemyEntities.filter(function (v) {
            return inCommon.indexOf(v) === -1;
        });

        const aliveEnemyEntities = exclusiveA.concat(exclusiveB);
        console.log(enemyEntities);
        console.log(aliveEnemyEntities);

        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        let xRoll = canvas.width * Math.random();
        let yRoll = canvas.height * Math.random();
        let sucessCount = 0;

        for (const enemyEntity of aliveEnemyEntities) {
            // refuge spawn attempts of the xRoll and yRoll
            // should take into account the already set spawnRoll
            const enemyPos: { x: number, y: number } = this.positionComponentStore.get(enemyEntity);
            const dxEnemy = Math.abs(enemyPos.x - xRoll);
            const dyEnemy = Math.abs(enemyPos.y - yRoll);
            const dxPlayer = Math.abs(playerPos.x - xRoll);
            const dyPlayer = Math.abs(playerPos.y - yRoll);
            if (dxEnemy <= 160 || dyEnemy <= 160 || dxPlayer <= 160 || dyPlayer <= 160) {
                continue;
            } else {
                sucessCount++;
            }
        }
        if (sucessCount == aliveEnemyEntities.length) {
            return;
        } else {
            if (spawnAttempt == 0) {
                this.trySpawn(spawnRoll, 1);
            } else return;
        }
    }
}
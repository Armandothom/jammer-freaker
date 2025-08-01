import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { EnemyType, EnemyConfig } from "../components/types/enemy-type.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { EnemyDead } from "../components/enemy-dead.component.js";
import { WorldTilemapManager } from "../../game/world/world-tilemap-manager.js";
import { SpriteManager } from "../../game/asset-manager/sprite-manager.js";
import { SpriteSheetName } from "../../game/asset-manager/types/sprite-sheet-name.enum.js";
import { sleep } from "../../utils/sleep.js";
import { SoundManager } from "../../game/asset-manager/sound-manager.js";
import { FreezeManager } from "../core/freeze-manager.js";
import { SpriteComponent } from "../components/sprite.component.js";
import { SpriteName } from "../../game/world/types/sprite-name.enum.js";

export class EnemyLifecicleSystem implements ISystem {
    private timeSinceLastSpawn = 0;
    private expectedLevel: number = 0;

    constructor(
        private positionComponentStore: ComponentStore<PositionComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDead>,
        private entityFactory: EntityFactory,
        private worldTilemapManager: WorldTilemapManager,
        private spriteManager: SpriteManager,
        private soundManager: SoundManager,
        private freezeManager: FreezeManager,
        private spriteComponentStore: ComponentStore<SpriteComponent>,
        private tilemapManager: WorldTilemapManager,
    ) {

    }

    update(deltaTime: number): void {
        this.timeSinceLastSpawn += deltaTime;
        let spawnIntervalsInSeconds = 999;
        const previousTime = this.timeSinceLastSpawn - deltaTime;

        if (previousTime < spawnIntervalsInSeconds && this.timeSinceLastSpawn >= spawnIntervalsInSeconds) {
            this.timeSinceLastSpawn = -999;
            this.spawnEnemy();
        }
    }

    async levelUpdate(enemySpawnTable: { name: string; quantity: number }[], currentLevel: number): Promise<void> {
        if (currentLevel >= this.expectedLevel || this.expectedLevel === 1) {
            if (currentLevel == 1) {
                this.initialEnemiesSpawn(enemySpawnTable);
            } else {
                await this.killAllEnemies();
                this.initialEnemiesSpawn(enemySpawnTable);
            }
            this.expectedLevel = currentLevel + 1;
        }
    }

    spawnEnemy() {
        const enemyTypes: EnemyType[] = Object.keys(EnemyType).map((k) => (EnemyType as any)[k]) as EnemyType[];

        const enemySpawnChances: number[] = enemyTypes.map((enemyType) => EnemyConfig[enemyType].spawnFrequency);
        let spawnChancesAccumulated: number[] = [];

        for (let i = 0; i < enemySpawnChances.length; i++) {
            if (i == 0) {
                spawnChancesAccumulated[i] = enemySpawnChances[i];
            } else {
                spawnChancesAccumulated[i] = enemySpawnChances[i] + spawnChancesAccumulated[i - 1];
            }
        }

        let spawnRoll = Math.random();
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;

        // xRoll and yRoll as placeholder for now, must be improved to check collision,
        // another enemy its in the vicinity, must not spawn in the vicinity of the player

        // to be implemented: time elapsed || bypass logic for spawn logic
        // bypass being used to spawn a bunch of enemies on level start


        if (spawnRoll <= spawnChancesAccumulated[0]) {
            const posRoll = this.trySpawn();
            this.entityFactory.createSoldier(
                posRoll.x, posRoll.y,
                EnemyConfig[EnemyType.SOLDIER].hp,
                EnemyConfig[EnemyType.SOLDIER].damage,
                EnemyConfig[EnemyType.SOLDIER].attackCooldownInSeconds,
                EnemyConfig[EnemyType.SOLDIER].attackRange,
                EnemyConfig[EnemyType.SOLDIER].movementRadius,
                EnemyConfig[EnemyType.SOLDIER].velocity);
        }
        if (spawnRoll > spawnChancesAccumulated[0] && spawnRoll < spawnChancesAccumulated[1]) {
            const posRoll = this.trySpawn();
            this.entityFactory.createSniper(
                posRoll.x, posRoll.y,
                EnemyConfig[EnemyType.SNIPER].hp,
                EnemyConfig[EnemyType.SNIPER].damage,
                EnemyConfig[EnemyType.SNIPER].attackCooldownInSeconds,
                EnemyConfig[EnemyType.SNIPER].attackRange,
                EnemyConfig[EnemyType.SNIPER].movementRadius,
                EnemyConfig[EnemyType.SNIPER].velocity);
        }
        if (spawnRoll > spawnChancesAccumulated[1] && spawnRoll < spawnChancesAccumulated[2]) {
            //kmkz
            const posRoll = this.trySpawn();
            this.entityFactory.createKamikaze(
                posRoll.x, posRoll.y,
                EnemyConfig[EnemyType.KAMIKAZE].hp,
                EnemyConfig[EnemyType.KAMIKAZE].damage,
                EnemyConfig[EnemyType.KAMIKAZE].attackCooldownInSeconds,
                EnemyConfig[EnemyType.KAMIKAZE].attackRange,
                EnemyConfig[EnemyType.KAMIKAZE].movementRadius,
                EnemyConfig[EnemyType.KAMIKAZE].velocity);
        }
        if (spawnRoll > spawnChancesAccumulated[2] && spawnRoll < spawnChancesAccumulated[3]) {
            //JUGG
            const posRoll = this.trySpawn();
            this.entityFactory.createJuggernaut(
                posRoll.x, posRoll.y,
                EnemyConfig[EnemyType.JUGG].hp,
                EnemyConfig[EnemyType.JUGG].damage,
                EnemyConfig[EnemyType.JUGG].attackCooldownInSeconds,
                EnemyConfig[EnemyType.JUGG].attackRange,
                EnemyConfig[EnemyType.JUGG].movementRadius,
                EnemyConfig[EnemyType.JUGG].velocity);
        }
        if (spawnRoll > spawnChancesAccumulated[3] && spawnRoll < spawnChancesAccumulated[4]) {
            const posRoll = this.trySpawn();
            this.entityFactory.createBomber(
                posRoll.x, posRoll.y,
                EnemyConfig[EnemyType.BOMBER].hp,
                EnemyConfig[EnemyType.BOMBER].damage,
                EnemyConfig[EnemyType.BOMBER].attackCooldownInSeconds,
                EnemyConfig[EnemyType.BOMBER].attackRange,
                EnemyConfig[EnemyType.BOMBER].movementRadius,
                EnemyConfig[EnemyType.BOMBER].velocity);
        }
    }

    async killAllEnemies() {
        console.log("killallenemies call");
        //this.freezeManager.freezeGame();
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

        const livingEnemyEntities = exclusiveA.concat(exclusiveB);
        this.soundManager.playSound("A10_BARRAGE");

        await sleep(2);
        for (const livingEnemyEntity of livingEnemyEntities) {
            this.entityFactory.destroyEnemy(livingEnemyEntity);
        }
        await sleep(2);
        //this.freezeManager.unfreezeGame();

        return;
    }

    initialEnemiesSpawn(spawnList: { name: string; quantity: number }[]) {

        const enemyTypes: EnemyType[] = Object.keys(EnemyType).map((k) => (EnemyType as any)[k]) as EnemyType[];

        for (const spawn of spawnList) {
            for (let i = 0; i < spawn.quantity; i++) {
                if (spawn.name == EnemyType.SOLDIER) {
                    const posRoll = this.trySpawn();
                    this.entityFactory.createSoldier(
                        posRoll.x, posRoll.y,
                        EnemyConfig[EnemyType.SOLDIER].hp,
                        EnemyConfig[EnemyType.SOLDIER].damage,
                        EnemyConfig[EnemyType.SOLDIER].attackCooldownInSeconds,
                        EnemyConfig[EnemyType.SOLDIER].attackRange,
                        EnemyConfig[EnemyType.SOLDIER].movementRadius,
                        EnemyConfig[EnemyType.SOLDIER].velocity);
                }
                if (spawn.name == EnemyType.SNIPER) {
                    const posRoll = this.trySpawn();
                    this.entityFactory.createSniper(
                        posRoll.x, posRoll.y,
                        EnemyConfig[EnemyType.SNIPER].hp,
                        EnemyConfig[EnemyType.SNIPER].damage,
                        EnemyConfig[EnemyType.SNIPER].attackCooldownInSeconds,
                        EnemyConfig[EnemyType.SNIPER].attackRange,
                        EnemyConfig[EnemyType.SNIPER].movementRadius,
                        EnemyConfig[EnemyType.SNIPER].velocity);
                }
                if (spawn.name == EnemyType.JUGG) {
                    const posRoll = this.trySpawn();
                    this.entityFactory.createJuggernaut(
                        posRoll.x, posRoll.y,
                        EnemyConfig[EnemyType.JUGG].hp,
                        EnemyConfig[EnemyType.JUGG].damage,
                        EnemyConfig[EnemyType.JUGG].attackCooldownInSeconds,
                        EnemyConfig[EnemyType.JUGG].attackRange,
                        EnemyConfig[EnemyType.JUGG].movementRadius,
                        EnemyConfig[EnemyType.JUGG].velocity);
                }
                if (spawn.name == EnemyType.KAMIKAZE) {
                    const posRoll = this.trySpawn();
                    this.entityFactory.createKamikaze(
                        posRoll.x, posRoll.y,
                        EnemyConfig[EnemyType.KAMIKAZE].hp,
                        EnemyConfig[EnemyType.KAMIKAZE].damage,
                        EnemyConfig[EnemyType.KAMIKAZE].attackCooldownInSeconds,
                        EnemyConfig[EnemyType.KAMIKAZE].attackRange,
                        EnemyConfig[EnemyType.KAMIKAZE].movementRadius,
                        EnemyConfig[EnemyType.KAMIKAZE].velocity);
                }
                if (spawn.name == EnemyType.BOMBER) {
                    const posRoll = this.trySpawn();
                    this.entityFactory.createBomber(
                        posRoll.x, posRoll.y,
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

    positionRoll(tries: number): { x: number, y: number } {
        const randomTile = Math.floor(Math.random() * this.tilemapManager.validSpawnTile.length);
        const spawnTile = this.tilemapManager.validSpawnTile[randomTile];

        return {
            x: spawnTile.x,
            y: spawnTile.y
        }
    }

    trySpawn(): { x: number, y: number, success: boolean } {
        const enemyEntities = this.enemyComponentStore.getAllEntities();
        const deadEnemiesEntities = this.enemyDeadComponentStore.getAllEntities();
        const spriteProperties = this.spriteManager.getSpriteProperties(SpriteName.ENEMY_STILL, SpriteSheetName.ENEMY);
        const playerId = this.playerComponentStore.getAllEntities()[0];
        const playerPos = this.positionComponentStore.get(playerId);
        let checkPlayerEnemyLogic = false;
        let tries = 0;
        let maxTries = 5;
        let rolledPosition: { x: number, y: number };
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;

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

        let foundValidPosition = false;

        do {
            rolledPosition = this.positionRoll(tries);
            let sucessCount = 0;
            tries++;
            checkPlayerEnemyLogic = false;

            //Enemy spawn check
            for (const enemyEntity of aliveEnemyEntities) {
                const enemyPos: { x: number, y: number } = this.positionComponentStore.get(enemyEntity)
                const sprite = this.spriteComponentStore.get(enemyEntity);

                const enemyDistance = Math.hypot(enemyPos.x - rolledPosition.x * sprite.width, enemyPos.y - rolledPosition.y * sprite.height);

                if (enemyDistance >= sprite.width * 2) {
                    sucessCount++;
                }
            }
            if (sucessCount == aliveEnemyEntities.length) {
                const playerDistance = Math.hypot(
                    playerPos.x - rolledPosition.x * spriteProperties.sprite.originalRenderSpriteWidth * (canvas.width / (this.tilemapManager.tileSize * this.tilemapManager._maxNumberTilesX)),
                    playerPos.y - rolledPosition.y * spriteProperties.sprite.originalRenderSpriteHeight * (canvas.height / (this.tilemapManager.tileSize * this.tilemapManager._maxNumberTilesY)));
                if (playerDistance >= 180) {
                    checkPlayerEnemyLogic = true;
                }
            }

            if (checkPlayerEnemyLogic) {
                foundValidPosition = true;
            }
        } while ((checkPlayerEnemyLogic === false) && tries < maxTries);


        if (!foundValidPosition) {
            console.warn("Nenhuma posição válida encontrada para o spawn.");
            return { x: 0, y: 0, success: false };
        }

        return {
            x: rolledPosition.x * spriteProperties.sprite.originalRenderSpriteWidth * (canvas.width / (this.tilemapManager.tileSize * this.tilemapManager._maxNumberTilesX)),
            y: rolledPosition.y * spriteProperties.sprite.originalRenderSpriteHeight * (canvas.height / (this.tilemapManager.tileSize * this.tilemapManager._maxNumberTilesY)),
            success: true
        };
    }
}
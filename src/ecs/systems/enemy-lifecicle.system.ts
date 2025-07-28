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
        let spawnIntervalsInSeconds = 10;
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

        const posRoll = this.trySpawn();
        if (spawnRoll <= spawnChancesAccumulated[0]) {
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

    positionRoll(): { x: number, y: number } {
        const canvas = document.querySelector<HTMLCanvasElement>("#gl-canvas")!;
        const spriteProperties = this.spriteManager.getSpriteProperties(SpriteName.ENEMY_STILL,SpriteSheetName.ENEMY);
        return {
            x: Math.floor((canvas.width - spriteProperties.sprite.originalRenderSpriteWidth) * Math.random()),
            y: Math.floor((canvas.height - spriteProperties.sprite.originalRenderSpriteHeight) * Math.random()),
        }
    }

    trySpawn(): { x: number, y: number } {
        const enemyEntities = this.enemyComponentStore.getAllEntities();
        const deadEnemiesEntities = this.enemyDeadComponentStore.getAllEntities();
        const spriteProperties = this.spriteManager.getSpriteSheetProperties(SpriteSheetName.ENEMY);
        const wallPosition = this.worldTilemapManager.generatedWalls;
        const playerId = this.playerComponentStore.getAllEntities()[0];
        const playerPos = this.positionComponentStore.get(playerId);
        let checkWallLogic = false;
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
            rolledPosition = this.positionRoll();
            let sucessCount = 0;
            tries++;
            checkWallLogic = false;
            checkPlayerEnemyLogic = false;

            //Enemy and player spawn check
            for (const enemyEntity of aliveEnemyEntities) {
                const enemyPos: { x: number, y: number } = this.positionComponentStore.get(enemyEntity)
                const sprite = this.spriteComponentStore.get(enemyEntity);

                const enemyDistance = Math.hypot(enemyPos.x - rolledPosition.x, enemyPos.y - rolledPosition.y);
                const playerDistance = Math.hypot(playerPos.x - rolledPosition.x, playerPos.y - rolledPosition.y);
                if (enemyDistance >= sprite.height * 2 && playerDistance >= sprite.width * 2) {
                    sucessCount++;
                }
            }
            if (sucessCount == aliveEnemyEntities.length) {
                checkPlayerEnemyLogic = true;
            }

            //Wall spawn check

            const coordMap = new Map<string, boolean>();

            for (const { x, y } of wallPosition) {
                const key = `${x}_${y}`;
                coordMap.set(key, true);
            }

            const rolledPositionTile = {
                x: Math.floor(rolledPosition.x / this.tilemapManager.tileSize),
                y: Math.floor(rolledPosition.y / this.tilemapManager.tileSize)
            }

            let counter = 0;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx == 0 && dy == 0) continue;
                    const generatedKey = `${rolledPositionTile.x + dx}_${rolledPositionTile.y + dy}`;
                    if (!coordMap.has(generatedKey)) {
                        counter++;
                    }
                }
            }
            if (counter >= 8) {
                checkWallLogic = true;
            }

            if (checkWallLogic && checkPlayerEnemyLogic) {
                foundValidPosition = true;
            }

        } while ((checkWallLogic === false || checkPlayerEnemyLogic === false) && tries < maxTries);

        if (!foundValidPosition) {
            console.warn("Nenhuma posição válida encontrada para o spawn.");
            return { x: 640, y: 640 };
        }

        return {
            x: rolledPosition.x,
            y: rolledPosition.y
        };
    }

}
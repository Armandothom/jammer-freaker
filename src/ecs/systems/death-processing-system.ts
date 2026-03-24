import { DeathIntentComponent } from "../components/death-intent.component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { ComponentStore } from "../core/component-store.js";
import { LevelEndReason, LevelManager } from "../core/level-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";

export class DeathProcessingSystem implements ISystem {
    constructor(
        private levelManager: LevelManager,
        private entityFactory: EntityFactory,
        private deathIntentComponentStore: ComponentStore<DeathIntentComponent>,
        private playerComponentStore: ComponentStore<PlayerComponent>,
        private enemyComponentStore: ComponentStore<EnemyComponent>,
        private enemyDeadComponentStore: ComponentStore<EnemyDeadComponent>,
    ) {

    }
    update(deltaTime: number): void {
        for (const entity of this.deathIntentComponentStore.getAllEntities()) {
            if (this.playerComponentStore.has(entity)) {
                this.levelManager.endCurrentLevel(LevelEndReason.PlayerDeath);
            }
            if (this.enemyComponentStore.has(entity)) {
                this.enemyDeadComponentStore.add(entity, new EnemyDeadComponent());
                this.entityFactory.destroyEnemy(entity);
                // more logic towards score, money
                this.deathIntentComponentStore.remove(entity);
            }
        }
    }
}
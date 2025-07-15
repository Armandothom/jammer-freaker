import { PositionComponent } from "../components/position.component.js";
import { ComponentStore } from "../core/component-store.js";
import { ISystem } from "./system.interface.js";
import { EnemyType } from "../components/types/enemy-type.js";
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
        
        const EnemyTypes = Object.keys(EnemyType).map((k) => (EnemyTypes as any)[k]) as EnemyType[];

    }
}
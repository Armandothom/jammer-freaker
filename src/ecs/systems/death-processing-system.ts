import { AnimationName } from "../../game/asset-manager/types/animation-map.js";
import { AnimationComponent } from "../components/animation.component.js";
import { AwaitingAnimationEndComponent } from "../components/awaiting-animation-end.component.js";
import { DeathIntentComponent } from "../components/death-intent.component.js";
import { EnemyDeadComponent } from "../components/enemy-dead.component.js";
import { EnemyComponent } from "../components/enemy.component.js";
import { ItemBoxComponent } from "../components/item-box.component.js";
import { ItemDropIntentComponent } from "../components/item-drop-intent.component.js";
import { PlayerComponent } from "../components/player.component.js";
import { PositionComponent } from "../components/position.component.js";
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
        private itemBoxComponentStore: ComponentStore<ItemBoxComponent>,
        private awaitingAnimationEndStore: ComponentStore<AwaitingAnimationEndComponent>,
        private itemDropIntentComponentStore: ComponentStore<ItemDropIntentComponent>,
        private positionComponentStore: ComponentStore<PositionComponent>,
    ) {

    }
    update(deltaTime: number): void {
        for (const entity of this.deathIntentComponentStore.getAllEntities()) {
            const isPlayer = this.playerComponentStore.has(entity)
            const isEnemy = this.enemyComponentStore.has(entity)
            const isItemBox = this.itemBoxComponentStore.has(entity)

            if (isPlayer) {
                this.levelManager.endCurrentLevel(LevelEndReason.PlayerDeath);
            }
            if (isEnemy) {
                this.enemyDeadComponentStore.add(entity, new EnemyDeadComponent());
                this.entityFactory.destroyEnemy(entity);
                // more logic towards score, money
                this.deathIntentComponentStore.remove(entity);
            }
            if (isItemBox) {
                if (!this.awaitingAnimationEndStore.has(entity)) {
                    this.awaitingAnimationEndStore.add(entity, new AwaitingAnimationEndComponent(AnimationName.WOODEN_BOX_DESTROYED));
                    continue;
                }
                if (this.awaitingAnimationEndStore.get(entity).resolved === true) {
                    let deathPos = this.positionComponentStore.get(entity);
                    this.itemDropIntentComponentStore.add(entity, new ItemDropIntentComponent(deathPos.x, deathPos.y, 8))
                    this.entityFactory.destroyItemBox(entity);
                }
            }
        }
    }
}
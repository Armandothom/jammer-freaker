
import { IntentClickComponent } from "../components/intent-click.component.js";
import { IntentShotComponent } from "../components/intent-shot.component.js";
import { MovementIntentComponent } from "../components/movement-intent.component.js";
import { ShootingCooldownComponent } from "../components/shooting-cooldown.component.js";
import { WallHitComponent } from "../components/wall-hit.component.js";
import { ComponentStore } from "../core/component-store.js";
import { CoreManager } from "../core/core-manager.js";
import { EntityFactory } from "../entities/entity-factory.js";
import { ISystem } from "./system.interface.js";


//Hasta la vista, baby
export class TerminatorSystem implements ISystem {
    constructor(
        private clickIntentComponentStore: ComponentStore<IntentClickComponent>,
        private movementIntentComponentStore: ComponentStore<MovementIntentComponent>,
        private shootingCooldownComponentStore: ComponentStore<ShootingCooldownComponent>,
        private intentShotComponentStore: ComponentStore<IntentShotComponent>,
        private wallHitComponentStore: ComponentStore<WallHitComponent>,
        private entityFactory: EntityFactory,

    ) { }

    update(deltaTime: number): void {
        const clickIntentComponentEntities = this.clickIntentComponentStore.getAllEntities();
        for (const elemeclickIntentComponentEntity of clickIntentComponentEntities) {
            this.clickIntentComponentStore.remove(elemeclickIntentComponentEntity);
        }

        const movementIntentComponentEntities = this.movementIntentComponentStore.getAllEntities();
        for (const movementIntentComponentEntity of movementIntentComponentEntities) {
            this.movementIntentComponentStore.remove(movementIntentComponentEntity);
        }

        const shootingIntentComponentEntities = this.intentShotComponentStore.getAllEntities();
        for (const shootingIntentComponentEntity of shootingIntentComponentEntities) {
            this.intentShotComponentStore.remove(shootingIntentComponentEntity);
        }

        const shootingCooldownComponentEntities = this.shootingCooldownComponentStore.getAllEntities();
        for (const shootingCooldownComponentEntity of shootingCooldownComponentEntities) {
            const cooldown = this.shootingCooldownComponentStore.get(shootingCooldownComponentEntity);
            if (cooldown.endCooldown < CoreManager.timeGlobalSinceStart) {
                this.shootingCooldownComponentStore.remove(shootingCooldownComponentEntity);
            }
        }

        const projectileCompletedAnimEntities = this.wallHitComponentStore.getAllEntities();
        for (const projectileCompletedAnimEntity of projectileCompletedAnimEntities) {
            this.wallHitComponentStore.get(projectileCompletedAnimEntity).animEndTime -= deltaTime;
            if (this.wallHitComponentStore.get(projectileCompletedAnimEntity).animEndTime <= 0) {
                this.entityFactory.destroyProjectile(projectileCompletedAnimEntity);
                
            }
        }
    }
}